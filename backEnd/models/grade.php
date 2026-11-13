<?php
declare(strict_types=1);

require_once __DIR__ . '/../core/Database.php';

class Grade {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::connection();
    }

    public function isActiveTeacher(int $teacherId): bool {
        $stmt = $this->pdo->prepare(
            "SELECT 1
            FROM users u
            INNER JOIN teacher te ON te.user_id = u.user_id
            WHERE u.user_id = ?
            AND u.role = 'Teacher'
            AND u.account_status = 'Active'
            LIMIT 1"
        );
        $stmt->execute([$teacherId]);

        return (bool) $stmt->fetchColumn();
    }

    public function getCoursesForTeacher(int $teacherId): array {
        $stmt = $this->pdo->prepare(
            "SELECT DISTINCT c.course_code, c.title
            FROM section sec
            INNER JOIN course c ON c.course_code = sec.course_code
            INNER JOIN term t ON t.term_id = sec.term_id
            WHERE sec.teacher_id = ?
            AND CURDATE() BETWEEN t.start_date AND t.end_date
            AND EXISTS (
                SELECT 1
                FROM term_period tp
                WHERE tp.term_id = t.term_id
                AND tp.period_type = 'Grade Encoding'
                AND NOW() BETWEEN tp.start_date AND tp.end_date
            )
            ORDER BY c.course_code ASC"
        );
        $stmt->execute([$teacherId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSectionsForTeacher(int $teacherId, string $courseCode): array {
        $stmt = $this->pdo->prepare(
            "SELECT sec.section_id, sec.section_code,
                    CONCAT(t.school_year, ' Term ', t.term_no) AS term_label
            FROM section sec
            INNER JOIN term t ON t.term_id = sec.term_id
            WHERE sec.teacher_id = ?
            AND sec.course_code = ?
            AND CURDATE() BETWEEN t.start_date AND t.end_date
            AND EXISTS (
                SELECT 1
                FROM term_period tp
                WHERE tp.term_id = t.term_id
                AND tp.period_type = 'Grade Encoding'
                AND NOW() BETWEEN tp.start_date AND tp.end_date
            )
            ORDER BY sec.section_code ASC"
        );
        $stmt->execute([$teacherId, $courseCode]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOwnedCurrentSection(int $sectionId, int $teacherId): ?array {
        $stmt = $this->pdo->prepare(
            "SELECT sec.section_id, sec.section_code, sec.course_code,
                    c.title AS course_title, t.school_year, t.term_no
            FROM section sec
            INNER JOIN course c ON c.course_code = sec.course_code
            INNER JOIN term t ON t.term_id = sec.term_id
            WHERE sec.section_id = ?
            AND sec.teacher_id = ?
            AND CURDATE() BETWEEN t.start_date AND t.end_date
            AND EXISTS (
                SELECT 1
                FROM term_period tp
                WHERE tp.term_id = t.term_id
                AND tp.period_type = 'Grade Encoding'
                AND NOW() BETWEEN tp.start_date AND tp.end_date
            )
            LIMIT 1"
        );
        $stmt->execute([$sectionId, $teacherId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getStudentsForSection(int $sectionId, int $teacherId): array {
        $section = $this->getOwnedCurrentSection($sectionId, $teacherId);

        if (!$section) {
            throw new DomainException('Sections for the current semester cannot be found.');
        }

        $stmt = $this->pdo->prepare(
            "SELECT e.enrollment_id,
                    u.user_id AS student_id,
                    CONCAT_WS(' ',
                        NULLIF(TRIM(u.first_name), ''),
                        NULLIF(TRIM(u.middle_name), ''),
                        NULLIF(TRIM(u.last_name), '')
                    ) AS student_name,
                    g.grade_value
            FROM enrollment e
            INNER JOIN student s ON s.user_id = e.student_id
            INNER JOIN users u ON u.user_id = s.user_id
            LEFT JOIN grade g ON g.enrollment_id = e.enrollment_id
            WHERE e.section_id = ?
            AND e.status = 'Enlisted'
            AND s.academic_status = 'Active'
            AND u.account_status = 'Active'
            ORDER BY u.user_id ASC"
        );
        $stmt->execute([$sectionId]);

        return [
            'section' => $section,
            'students' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function saveGrades(int $teacherId, int $sectionId, array $grades): int {
        if (!$this->getOwnedCurrentSection($sectionId, $teacherId)) {
            throw new DomainException('Sections for the current semester cannot be found.');
        }

        $allowedGrades = $this->pdo->query(
            'SELECT grade_value FROM grade_scale'
        )->fetchAll(PDO::FETCH_COLUMN);
        $allowedGrades = array_fill_keys($allowedGrades, true);

        $this->pdo->beginTransaction();

        try {
            $enrollmentStmt = $this->pdo->prepare(
                "SELECT e.enrollment_id
                FROM enrollment e
                INNER JOIN student s ON s.user_id = e.student_id
                INNER JOIN users u ON u.user_id = s.user_id
                WHERE e.section_id = ?
                AND e.student_id = ?
                AND e.status = 'Enlisted'
                AND s.academic_status = 'Active'
                AND u.account_status = 'Active'
                LIMIT 1
                FOR UPDATE"
            );

            $saveStmt = $this->pdo->prepare(
                "INSERT INTO grade (enrollment_id, encoded_by, grade_value, date_encoded)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON  DUPLICATE KEY UPDATE
                    encoded_by = VALUES(encoded_by),
                    grade_value = VALUES(grade_value),
                    date_encoded = CURRENT_TIMESTAMP"
            );

            $savedCount = 0;
            $seenStudents = [];

            foreach ($grades as $item) {
                if (!is_array($item)) {
                    throw new InvalidArgumentException('Format of the grade entry is incorrect.');
                }

                $studentId = filter_var($item['studentId'] ?? null, FILTER_VALIDATE_INT);
                $gradeValue = trim((string) ($item['grade'] ?? ''));

                if ($studentId === false || $studentId === null || $studentId < 1) {
                    throw new InvalidArgumentException('Student ID is incorrect.');
                }

                if (isset($seenStudents[$studentId])) {
                    throw new InvalidArgumentException('Grades for the same student have been submitted more than once.');
                }
                $seenStudents[$studentId] = true;

                if ($gradeValue === '') continue;
                if (strlen($gradeValue) > 5 || !isset($allowedGrades[$gradeValue])) {
                    throw new InvalidArgumentException("Impermissible grade: {$gradeValue}");
                }

                $enrollmentStmt->execute([$sectionId, (int) $studentId]);
                $enrollmentId = $enrollmentStmt->fetchColumn();

                if (!$enrollmentId) {
                    throw new InvalidArgumentException(
                        "Student is not registered for this class section: {$studentId}"
                    );
                }

                $saveStmt->execute([ (int) $enrollmentId, $teacherId, $gradeValue ]);
                $savedCount++;
            }

            $this->pdo->commit();
            return $savedCount;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }
}
