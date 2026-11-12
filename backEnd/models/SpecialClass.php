<?php
require_once __DIR__ . '/../core/Database.php';

class SpecialClass
{
    public const CAMPUSES = ['Either', 'Laguna', 'Manila'];

    // Every course a student can ask for (the whole course table).
    public static function courses(): array
    {
        return Database::connection()
            ->query("SELECT course_code, title FROM course ORDER BY course_code")
            ->fetchAll();
    }

    
    public static function applied(int $studentId, int $termId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT a.course_code, c.title, a.campus,
                    COUNT(*) AS total,
                    MAX(a.student_id = ?) AS mine
             FROM special_class_application a
             JOIN course c ON c.course_code = a.course_code
             WHERE a.term_id = ? AND a.status IN ('Pending', 'Approved')
             GROUP BY a.course_code, c.title, a.campus
             ORDER BY a.course_code, a.campus"
        );
        $stmt->execute([$studentId, $termId]);
        return $stmt->fetchAll();
    }

    // The student's own applications this term, newest first.
    public static function mine(int $studentId, int $termId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT a.application_id, a.course_code, c.title, a.campus, a.reason, a.status
             FROM special_class_application a
             JOIN course c ON c.course_code = a.course_code
             WHERE a.student_id = ? AND a.term_id = ?
             ORDER BY a.created_at DESC, a.application_id DESC"
        );
        $stmt->execute([$studentId, $termId]);
        return $stmt->fetchAll();
    }

    // A message saying why the student cannot apply for this course, or null if they can.
    public static function applyError(int $studentId, int $termId, string $courseCode): ?string
    {
        $pdo = Database::connection();

        $stmt = $pdo->prepare("SELECT 1 FROM course WHERE course_code = ?");
        $stmt->execute([$courseCode]);
        if (!$stmt->fetchColumn()) {
            return 'That course does not exist.';
        }

        $stmt = $pdo->prepare(
            "SELECT 1 FROM special_class_application
             WHERE student_id = ? AND term_id = ? AND course_code = ? AND status IN ('Pending', 'Approved')
             LIMIT 1"
        );
        $stmt->execute([$studentId, $termId, $courseCode]);
        if ($stmt->fetchColumn()) {
            return 'You already have an application for ' . $courseCode . ' this term.';
        }

        // Already in a regular section of the same course this term
        $stmt = $pdo->prepare(
            "SELECT 1 FROM enrollment e
             JOIN section sec ON sec.section_id = e.section_id
             WHERE e.student_id = ? AND sec.term_id = ? AND sec.course_code = ?
               AND e.status IN ('Pending', 'Enlisted')
             LIMIT 1"
        );
        $stmt->execute([$studentId, $termId, $courseCode]);
        if ($stmt->fetchColumn()) {
            return 'You are already enlisted in ' . $courseCode . ' this term.';
        }

        return null;
    }

    public static function create(int $studentId, int $termId, string $courseCode, string $campus, string $reason): void
    {
        $stmt = Database::connection()->prepare(
            "INSERT INTO special_class_application (student_id, course_code, term_id, campus, reason)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$studentId, $courseCode, $termId, $campus, $reason]);
    }

    // Withdraws one of the student's own Pending applications. False if it is not theirs
    // or it is no longer Pending (already approved or rejected).
    public static function withdraw(int $studentId, int $applicationId): bool
    {
        $stmt = Database::connection()->prepare(
            "UPDATE special_class_application SET status = 'Withdrawn'
             WHERE application_id = ? AND student_id = ? AND status = 'Pending'"
        );
        $stmt->execute([$applicationId, $studentId]);
        return $stmt->rowCount() > 0;
    }
}