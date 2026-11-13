<?php
require_once __DIR__ . '/../core/Database.php';

class Curriculum
{
    // Codes of the courses a student has passed (any attempt with a passing grade).
    public static function passedCourses(int $studentId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT DISTINCT sec.course_code
             FROM grade g
             JOIN enrollment e   ON e.enrollment_id = g.enrollment_id
             JOIN section sec    ON sec.section_id = e.section_id
             JOIN grade_scale gs ON gs.grade_value = g.grade_value
             WHERE e.student_id = ? AND gs.is_passing = TRUE"
        );
        $stmt->execute([$studentId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    // The courses of the student's program, each with a status:
    //   'taken'     = passed already
    //   'available' = all prerequisites passed (or none)
    //   'locked'    = a prerequisite is still missing
    // Returns null when the user has no program (not a student).
    public static function forStudent(int $studentId): ?array
    {
        $pdo = Database::connection();

        $stmt = $pdo->prepare("SELECT program_id FROM student WHERE user_id = ?");
        $stmt->execute([$studentId]);
        $programId = $stmt->fetchColumn();
        if ($programId === false) {
            return null;
        }

        // Majors first, then GEs, then the rest
        $stmt = $pdo->prepare(
            "SELECT cc.course_code, c.title, c.units, cc.category, cc.year_lvl, cc.term_no
             FROM curriculum_course cc
             JOIN course c ON c.course_code = cc.course_code
             WHERE cc.program_id = ?
             ORDER BY (cc.category = 'Major') DESC, (cc.category = 'GE') DESC,
                      cc.year_lvl, cc.term_no, cc.course_code"
        );
        $stmt->execute([$programId]);
        $courses = $stmt->fetchAll();

        // prerequisites, grouped by course
        $prereqs = [];
        foreach ($pdo->query("SELECT course_code, pre_req_code FROM course_requirements ORDER BY pre_req_code") as $row) {
            $prereqs[$row['course_code']][] = $row['pre_req_code'];
        }

        $passed = array_flip(self::passedCourses($studentId));

        foreach ($courses as &$c) {
            $c['prereqs'] = $prereqs[$c['course_code']] ?? [];
            if (isset($passed[$c['course_code']])) {
                $c['status'] = 'taken';
            } else {
                $missing = array_filter($c['prereqs'], fn($code) => !isset($passed[$code]));
                $c['status'] = $missing ? 'locked' : 'available';
            }
        }
        unset($c);

        return $courses;
    }
}