<?php
require_once __DIR__ . '/../core/Database.php';

class GradeEncoding
{
    // Courses this teacher handles this term. Null teacher id means every course (Admin).
    public static function courses(int $termId, ?int $teacherId): array
    {
        $sql = "SELECT c.course_code, c.title
                FROM section sec
                JOIN course c ON c.course_code = sec.course_code
                WHERE sec.term_id = ?";
        $params = [$termId];
        if ($teacherId !== null) {
            $sql .= " AND sec.teacher_id = ?";
            $params[] = $teacherId;
        }
        $sql .= " GROUP BY c.course_code, c.title ORDER BY c.course_code";

        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function sections(int $termId, string $courseCode, ?int $teacherId): array
    {
        $sql = "SELECT section_id, section_code, campus
                FROM section
                WHERE term_id = ? AND course_code = ?";
        $params = [$termId, $courseCode];
        if ($teacherId !== null) {
            $sql .= " AND teacher_id = ?";
            $params[] = $teacherId;
        }
        $sql .= " ORDER BY section_code";

        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    // One section the teacher is allowed to encode, or null.
    public static function section(int $sectionId, int $termId, ?int $teacherId): ?array
    {
        $sql = "SELECT sec.section_id, sec.section_code, sec.course_code, c.title
                FROM section sec
                JOIN course c ON c.course_code = sec.course_code
                WHERE sec.section_id = ? AND sec.term_id = ?";
        $params = [$sectionId, $termId];
        if ($teacherId !== null) {
            $sql .= " AND sec.teacher_id = ?";
            $params[] = $teacherId;
        }
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() ?: null;
    }

    // Enlisted students in a section, with the grade already on file (if any).
    public static function students(int $sectionId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT e.enrollment_id, u.user_id, u.first_name, u.last_name, g.grade_value
             FROM enrollment e
             JOIN users u ON u.user_id = e.student_id
             LEFT JOIN grade g ON g.enrollment_id = e.enrollment_id
             WHERE e.section_id = ? AND e.status = 'Enlisted'
             ORDER BY u.last_name, u.first_name"
        );
        $stmt->execute([$sectionId]);
        return $stmt->fetchAll();
    }

    public static function scale(): array
    {
        return Database::connection()->query(
            "SELECT grade_value, description
             FROM grade_scale
             ORDER BY grade_value REGEXP '^[0-9]' DESC, grade_value DESC"
        )->fetchAll();
    }

    // Writes one grade per enlisted student. A blank value removes a grade that was saved before.
    public static function save(int $sectionId, int $encodedBy, array $grades): void
    {
        $pdo = Database::connection();
        $owns = $pdo->prepare(
            "SELECT enrollment_id FROM enrollment
             WHERE enrollment_id = ? AND section_id = ? AND status = 'Enlisted'"
        );
        $allowed = $pdo->prepare("SELECT 1 FROM grade_scale WHERE grade_value = ?");
        $existing = $pdo->prepare("SELECT grade_id FROM grade WHERE enrollment_id = ?");
        $insert = $pdo->prepare(
            "INSERT INTO grade (enrollment_id, encoded_by, grade_value) VALUES (?, ?, ?)"
        );
        $update = $pdo->prepare(
            "UPDATE grade SET encoded_by = ?, grade_value = ?, date_encoded = NOW() WHERE enrollment_id = ?"
        );
        $clear = $pdo->prepare("DELETE FROM grade WHERE enrollment_id = ?");

        $pdo->beginTransaction();
        try {
            foreach ($grades as $enrollmentId => $value) {
                $enrollmentId = (int) $enrollmentId;
                $owns->execute([$enrollmentId, $sectionId]);
                if (!$owns->fetch()) {
                    continue;
                }

                $value = trim((string) $value);
                if ($value === '') {
                    $clear->execute([$enrollmentId]);
                    continue;
                }

                $allowed->execute([$value]);
                if (!$allowed->fetch()) {
                    continue;
                }

                $existing->execute([$enrollmentId]);
                if ($existing->fetch()) {
                    $update->execute([$encodedBy, $value, $enrollmentId]);
                } else {
                    $insert->execute([$enrollmentId, $encodedBy, $value]);
                }
            }
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}
