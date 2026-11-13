<?php
require_once __DIR__ . '/../core/Database.php';

class Schedule
{
    // All terms, newest first. 'is_current' is true for the one that includes today.
    public static function terms(): array
    {
        $terms = Database::connection()
            ->query("SELECT term_id, school_year, term_no, start_date, end_date FROM term ORDER BY start_date DESC")
            ->fetchAll();

        $today = date('Y-m-d');
        foreach ($terms as &$t) {
            $t['is_current'] = $t['start_date'] <= $today && $today <= $t['end_date'];
        }
        unset($t);
        return $terms;
    }

    // The term that includes today, or the newest term if none does.
    public static function currentTermId(): ?int
    {
        $terms = self::terms();
        foreach ($terms as $t) {
            if ($t['is_current']) {
                return (int) $t['term_id'];
            }
        }
        return $terms ? (int) $terms[0]['term_id'] : null;
    }

    // Class meetings of one user in one term.
    //   Student: the sections they are enlisted in.
    //   Teacher: the sections they teach.
    //   Other roles: nothing.
    // A section without meeting times still comes back once, with day = null (TBA).
    public static function meetings(int $userId, string $role, int $termId): array
    {
        if ($role === 'Student') {
            $from  = "FROM enrollment e
                      JOIN section sec ON sec.section_id = e.section_id";
            $where = "e.student_id = ? AND e.status = 'Enlisted' AND sec.term_id = ?";
        } elseif ($role === 'Teacher') {
            $from  = "FROM section sec";
            $where = "sec.teacher_id = ? AND sec.term_id = ?";
        } else {
            return [];
        }

        $stmt = Database::connection()->prepare(
            "SELECT sec.course_code, c.title, sec.section_code,
                    m.day, m.start_time, m.end_time, m.room
             $from
             JOIN course c ON c.course_code = sec.course_code
             LEFT JOIN section_meeting m ON m.section_id = sec.section_id
             WHERE $where
             ORDER BY m.day IS NULL, FIELD(m.day, 'Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
                      m.start_time, sec.course_code"
        );
        $stmt->execute([$userId, $termId]);
        return $stmt->fetchAll();
    }
}