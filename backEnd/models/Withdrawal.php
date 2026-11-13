<?php
require_once __DIR__ . '/../core/Database.php';

class Withdrawal
{
    // Withdraws the given sections, all with one reason, all or nothing.
    // Every section must be one the student is Enlisted in during this term.
    // Returns ['count' => n] or ['error' => message].
    public static function withdraw(int $studentId, int $termId, array $sectionIds, string $reason): array
    {
        $pdo = Database::connection();
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare(
                "UPDATE enrollment e
                 JOIN section sec ON sec.section_id = e.section_id
                 SET e.status = 'Withdrawn', e.reason = ?
                 WHERE e.student_id = ? AND e.section_id = ? AND e.status = 'Enlisted' AND sec.term_id = ?"
            );
            foreach ($sectionIds as $sectionId) {
                $stmt->execute([$reason, $studentId, $sectionId, $termId]);
                if ($stmt->rowCount() === 0) {
                    $pdo->rollBack();
                    return ['error' => 'One of the selected courses is not in your enrolled courses.'];
                }
            }
            $pdo->commit();
            return ['count' => count($sectionIds)];
        } catch (Throwable $ex) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $ex;
        }
    }

    // Courses the student already withdrew from in a term, with the reason given.
    public static function history(int $studentId, int $termId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT sec.course_code, sec.section_code, c.title, e.reason
             FROM enrollment e
             JOIN section sec ON sec.section_id = e.section_id
             JOIN course c    ON c.course_code = sec.course_code
             WHERE e.student_id = ? AND sec.term_id = ? AND e.status = 'Withdrawn'
             ORDER BY sec.course_code"
        );
        $stmt->execute([$studentId, $termId]);
        return $stmt->fetchAll();
    }
}