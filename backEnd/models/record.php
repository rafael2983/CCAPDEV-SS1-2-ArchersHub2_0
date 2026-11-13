<?php
require_once __DIR__ . '/../core/Database.php';

class Record
{
    // Every graded course of one student, newest term first.
    public static function forStudent(int $studentId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT t.term_id, t.school_year, t.term_no,
                    c.course_code, c.title, c.units, g.grade_value
             FROM grade g
             JOIN enrollment e ON e.enrollment_id = g.enrollment_id
             JOIN section s    ON s.section_id = e.section_id
             JOIN term t       ON t.term_id = s.term_id
             JOIN course c     ON c.course_code = s.course_code
             WHERE e.student_id = ?
             ORDER BY t.start_date DESC, c.course_code"
        );
        $stmt->execute([$studentId]);
        return $stmt->fetchAll();
    }
}