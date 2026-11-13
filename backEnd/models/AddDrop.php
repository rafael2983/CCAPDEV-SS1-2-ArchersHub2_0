<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/Enrollment.php';

class AddDrop
{
    // Drops an Enlisted course and keeps the reason. Returns true if a row was changed.
    public static function drop(int $studentId, int $sectionId, string $reason): bool
    {
        $stmt = Database::connection()->prepare(
            "UPDATE enrollment SET status = 'Dropped', reason = ?
             WHERE student_id = ? AND section_id = ? AND status = 'Enlisted'"
        );
        $stmt->execute([$reason, $studentId, $sectionId]);
        return $stmt->rowCount() > 0;
    }

    // Moves an Enlisted course to another section of the same course.
    // Returns an error message, or null when it worked.
    public static function change(array $student, int $termId, int $fromId, int $toId): ?string
    {
        $studentId = (int) $student['user_id'];
        $pdo = Database::connection();

        $from = Enrollment::section($fromId);
        $to   = Enrollment::section($toId);
        if (!$from || !$to || $from['course_code'] !== $to['course_code']) {
            return 'Pick another section of the same course.';
        }
        if ($fromId === $toId) {
            return 'You are already in that section.';
        }

        $stmt = $pdo->prepare(
            "SELECT 1 FROM enrollment WHERE student_id = ? AND section_id = ? AND status = 'Enlisted'"
        );
        $stmt->execute([$studentId, $fromId]);
        if (!$stmt->fetchColumn()) {
            return 'You are not enlisted in that section.';
        }

        // The old section is ignored, so it does not count as a clash or a duplicate.
        $error = Enrollment::addError($student, $termId, $toId, $fromId);
        if ($error !== null) {
            return $error;
        }

        $pdo->beginTransaction();
        try {
            self::drop($studentId, $fromId, 'Changed section');
            Enrollment::add($studentId, $toId, 'Enlisted');
            $pdo->commit();
        } catch (Throwable $ex) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $ex;
        }
        return null;
    }
}