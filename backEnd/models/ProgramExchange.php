<?php
require_once __DIR__ . '/../core/Database.php';

class ProgramExchange
{
    // The student's current program (program_id, name), or null when the user is not a student.
    public static function currentProgram(int $studentId): ?array
    {
        $stmt = Database::connection()->prepare(
            "SELECT p.program_id, p.name
             FROM student s JOIN program p ON p.program_id = s.program_id
             WHERE s.user_id = ?"
        );
        $stmt->execute([$studentId]);
        return $stmt->fetch() ?: null;
    }

    // Programs a student can apply to: every program except the current one.
    public static function targets(int $currentProgramId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT program_id, name FROM program WHERE program_id <> ? ORDER BY name"
        );
        $stmt->execute([$currentProgramId]);
        return $stmt->fetchAll();
    }

    // This term's program exchange period: start, end and whether it is open right now.
    // Returns null when no period is set.
    public static function period(): ?array
    {
        $termId = self::currentTermId();
        if ($termId === null) {
            return null;
        }
        $stmt = Database::connection()->prepare(
            "SELECT start_date, end_date, (NOW() BETWEEN start_date AND end_date) AS is_open
             FROM term_period WHERE term_id = ? AND period_type = 'Program Exchange'"
        );
        $stmt->execute([$termId]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        return ['start' => $row['start_date'], 'end' => $row['end_date'], 'open' => (bool) $row['is_open']];
    }

    // The student's applications, newest first.
    public static function applications(int $studentId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT a.application_id, p.name AS target, a.created_at, a.status
             FROM program_exchange_application a
             JOIN program p ON p.program_id = a.target_program_id
             WHERE a.student_id = ?
             ORDER BY a.created_at DESC, a.application_id DESC"
        );
        $stmt->execute([$studentId]);
        return $stmt->fetchAll();
    }

    public static function hasPending(int $studentId): bool
    {
        $stmt = Database::connection()->prepare(
            "SELECT COUNT(*) FROM program_exchange_application WHERE student_id = ? AND status = 'Pending'"
        );
        $stmt->execute([$studentId]);
        return (int) $stmt->fetchColumn() > 0;
    }

    // Saves a new Pending application if the rules allow it.
    // Returns null on success, or the reason it was refused.
    public static function apply(int $studentId, int $targetProgramId, string $reason): ?string
    {
        $current = self::currentProgram($studentId);
        if ($current === null) {
            return 'Only students can apply for a program exchange.';
        }

        $period = self::period();
        if ($period === null || !$period['open']) {
            return 'The program exchange period is closed.';
        }

        $stmt = Database::connection()->prepare("SELECT COUNT(*) FROM program WHERE program_id = ?");
        $stmt->execute([$targetProgramId]);
        if ((int) $stmt->fetchColumn() === 0) {
            return 'Please choose a target program.';
        }
        if ($targetProgramId === (int) $current['program_id']) {
            return 'You are already in that program.';
        }

        if ($reason === '') {
            return 'Please give a reason.';
        }
        if (strlen($reason) > 500) {
            return 'The reason is too long (500 characters at most).';
        }

        if (self::hasPending($studentId)) {
            return 'You already have a pending application. Cancel it before applying again.';
        }

        $stmt = Database::connection()->prepare(
            "INSERT INTO program_exchange_application (student_id, target_program_id, reason, status)
             VALUES (?, ?, ?, 'Pending')"
        );
        $stmt->execute([$studentId, $targetProgramId, $reason]);
        return null;
    }

    // Cancels (deletes) one of the student's own Pending applications.
    public static function cancel(int $studentId, int $applicationId): void
    {
        $stmt = Database::connection()->prepare(
            "DELETE FROM program_exchange_application
             WHERE application_id = ? AND student_id = ? AND status = 'Pending'"
        );
        $stmt->execute([$applicationId, $studentId]);
    }

    // The term that includes today, or the newest term if none does.
    private static function currentTermId(): ?int
    {
        $pdo = Database::connection();
        $id = $pdo->query("SELECT term_id FROM term WHERE CURDATE() BETWEEN start_date AND end_date ORDER BY start_date DESC LIMIT 1")
                  ->fetchColumn();
        if ($id === false) {
            $id = $pdo->query("SELECT term_id FROM term ORDER BY start_date DESC LIMIT 1")->fetchColumn();
        }
        return $id === false ? null : (int) $id;
    }
}