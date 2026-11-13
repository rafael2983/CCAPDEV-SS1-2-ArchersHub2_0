<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/Curriculum.php';

class Enrollment
{
    // The student row (program, campus, academic status), or null if the user is not a student.
    public static function student(int $userId): ?array
    {
        $stmt = Database::connection()->prepare(
            "SELECT user_id, program_id, academic_status, campus FROM student WHERE user_id = ?"
        );
        $stmt->execute([$userId]);
        return $stmt->fetch() ?: null;
    }

    // The newest period of one type for a term, with is_open = 1 if it includes right now.
    // $type is one of: Enlistment, Add/Drop, Withdrawal, Special Class, Program Exchange.
    public static function period(int $termId, string $type): ?array
    {
        $stmt = Database::connection()->prepare(
            "SELECT start_date, end_date, (NOW() BETWEEN start_date AND end_date) AS is_open
             FROM term_period
             WHERE term_id = ? AND period_type = ?
             ORDER BY start_date DESC
             LIMIT 1"
        );
        $stmt->execute([$termId, $type]);
        return $stmt->fetch() ?: null;
    }

    // One section with its course info, or null.
    public static function section(int $sectionId): ?array
    {
        $stmt = Database::connection()->prepare(
            "SELECT sec.section_id, sec.section_code, sec.course_code, sec.term_id, sec.campus, sec.slots,
                    c.title, c.units,
                    (SELECT COUNT(*) FROM enrollment x
                     WHERE x.section_id = sec.section_id AND x.status = 'Enlisted') AS taken
             FROM section sec
             JOIN course c ON c.course_code = sec.course_code
             WHERE sec.section_id = ?"
        );
        $stmt->execute([$sectionId]);
        return $stmt->fetch() ?: null;
    }

    // Every section this term for courses in the student's program, with the student's own
    // status in it (my_status: Pending, Enlisted, ... or null) and its meetings.
    public static function sectionsFor(int $studentId, int $programId, int $termId): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT sec.section_id, sec.section_code, sec.course_code, sec.campus, sec.slots,
                    c.title, c.units,
                    (SELECT COUNT(*) FROM enrollment x
                     WHERE x.section_id = sec.section_id AND x.status = 'Enlisted') AS taken,
                    mine.status AS my_status
             FROM section sec
             JOIN course c            ON c.course_code = sec.course_code
             JOIN curriculum_course cc ON cc.course_code = sec.course_code AND cc.program_id = ?
             LEFT JOIN enrollment mine ON mine.section_id = sec.section_id AND mine.student_id = ?
             WHERE sec.term_id = ?
             ORDER BY sec.course_code, sec.section_code"
        );
        $stmt->execute([$programId, $studentId, $termId]);
        return self::withMeetings($stmt->fetchAll());
    }

    // The student's own sections in a term that have one of the given statuses.
    public static function mySections(int $studentId, int $termId, array $statuses): array
    {
        $marks = implode(',', array_fill(0, count($statuses), '?'));
        $stmt = Database::connection()->prepare(
            "SELECT e.enrollment_id, e.status, sec.section_id, sec.section_code, sec.course_code,
                    sec.campus, c.title, c.units
             FROM enrollment e
             JOIN section sec ON sec.section_id = e.section_id
             JOIN course c    ON c.course_code = sec.course_code
             WHERE e.student_id = ? AND sec.term_id = ? AND e.status IN ($marks)
             ORDER BY sec.course_code"
        );
        $stmt->execute(array_merge([$studentId, $termId], $statuses));
        return self::withMeetings($stmt->fetchAll());
    }

    // Adds a 'meetings' list (day, start_time, end_time, room) to each section row.
    public static function withMeetings(array $rows): array
    {
        if (!$rows) {
            return [];
        }
        $ids = array_map(fn($r) => (int) $r['section_id'], $rows);
        $marks = implode(',', array_fill(0, count($ids), '?'));
        $stmt = Database::connection()->prepare(
            "SELECT section_id, day, start_time, end_time, room
             FROM section_meeting
             WHERE section_id IN ($marks)
             ORDER BY FIELD(day, 'Mon','Tue','Wed','Thu','Fri','Sat','Sun'), start_time"
        );
        $stmt->execute($ids);

        $bySection = [];
        foreach ($stmt->fetchAll() as $m) {
            $bySection[$m['section_id']][] = $m;
        }
        foreach ($rows as &$r) {
            $r['meetings'] = $bySection[$r['section_id']] ?? [];
        }
        unset($r);
        return $rows;
    }

    // Prerequisite codes of a course that the student has not passed yet.
    public static function missingPrereqs(int $studentId, string $courseCode): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT pre_req_code FROM course_requirements WHERE course_code = ? ORDER BY pre_req_code"
        );
        $stmt->execute([$courseCode]);
        $needed = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $passed = Curriculum::passedCourses($studentId);
        return array_values(array_diff($needed, $passed));
    }

    // Why a section cannot be added right now, or null if it can.
    // $ignoreSectionId: a section that is about to be replaced (used when changing section).
    public static function addError(array $student, int $termId, int $sectionId, ?int $ignoreSectionId = null): ?string
    {
        $studentId = (int) $student['user_id'];
        $pdo = Database::connection();

        $sec = self::section($sectionId);
        if (!$sec || (int) $sec['term_id'] !== $termId) {
            return 'That section is not offered this term.';
        }
        $label = $sec['course_code'] . ' ' . $sec['section_code'];

        $stmt = $pdo->prepare("SELECT 1 FROM curriculum_course WHERE program_id = ? AND course_code = ?");
        $stmt->execute([$student['program_id'], $sec['course_code']]);
        if (!$stmt->fetchColumn()) {
            return $sec['course_code'] . ' is not in your curriculum.';
        }

        if (in_array($sec['course_code'], Curriculum::passedCourses($studentId), true)) {
            return 'You already passed ' . $sec['course_code'] . '.';
        }

        $missing = self::missingPrereqs($studentId, $sec['course_code']);
        if ($missing) {
            return $sec['course_code'] . ' needs these prerequisites first: ' . implode(', ', $missing) . '.';
        }

        $mine = self::mySections($studentId, $termId, ['Pending', 'Enlisted']);
        foreach ($mine as $m) {
            if ($ignoreSectionId !== null && (int) $m['section_id'] === $ignoreSectionId) {
                continue;
            }
            if ($m['course_code'] === $sec['course_code']) {
                return 'You already chose ' . $sec['course_code'] . ' (section ' . $m['section_code'] . ').';
            }
        }

        if ((int) $sec['taken'] >= (int) $sec['slots']) {
            return $label . ' is full.';
        }

        $newMeetings = self::withMeetings([$sec])[0]['meetings'];
        foreach ($mine as $m) {
            if ($ignoreSectionId !== null && (int) $m['section_id'] === $ignoreSectionId) {
                continue;
            }
            if (self::overlaps($newMeetings, $m['meetings'])) {
                return $label . ' clashes with ' . $m['course_code'] . ' ' . $m['section_code'] . '.';
            }
        }

        return null;
    }

    // True if any meeting of A shares a day and overlapping time with any meeting of B.
    private static function overlaps(array $a, array $b): bool
    {
        foreach ($a as $x) {
            foreach ($b as $y) {
                if ($x['day'] === $y['day'] && $x['start_time'] < $y['end_time'] && $x['end_time'] > $y['start_time']) {
                    return true;
                }
            }
        }
        return false;
    }

    // Saves a section for the student with the given status (Pending or Enlisted).
    // A row from an earlier drop or withdrawal is reused, because (student, section) is unique.
    public static function add(int $studentId, int $sectionId, string $status): void
    {
        $stmt = Database::connection()->prepare(
            "INSERT INTO enrollment (student_id, section_id, status, enrolled_by)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), reason = NULL,
                                     date_enrolled = NOW(), enrolled_by = VALUES(enrolled_by)"
        );
        $stmt->execute([$studentId, $sectionId, $status, $studentId]);
    }

    // Removes a saved (Pending) choice. Enlisted rows are never deleted here.
    // Returns true if a Pending row was actually removed.
    public static function removePending(int $studentId, int $sectionId): bool
    {
        $stmt = Database::connection()->prepare(
            "DELETE FROM enrollment WHERE student_id = ? AND section_id = ? AND status = 'Pending'"
        );
        $stmt->execute([$studentId, $sectionId]);
        return $stmt->rowCount() > 0;
    }

    // Turns every Pending choice of the term into Enlisted, all or nothing.
    // Returns ['count' => n] on success or ['error' => message].
    public static function submitPending(int $studentId, int $termId): array
    {
        $pdo = Database::connection();
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare(
                "SELECT e.enrollment_id, sec.section_id, sec.section_code, sec.course_code, sec.slots
                 FROM enrollment e
                 JOIN section sec ON sec.section_id = e.section_id
                 WHERE e.student_id = ? AND sec.term_id = ? AND e.status = 'Pending'
                 FOR UPDATE"
            );
            $stmt->execute([$studentId, $termId]);
            $pending = $stmt->fetchAll();

            if (!$pending) {
                $pdo->rollBack();
                return ['error' => 'You have no chosen courses to submit.'];
            }

            $count = $pdo->prepare(
                "SELECT COUNT(*) FROM enrollment WHERE section_id = ? AND status = 'Enlisted'"
            );
            $update = $pdo->prepare("UPDATE enrollment SET status = 'Enlisted', date_enrolled = NOW() WHERE enrollment_id = ?");

            foreach ($pending as $p) {
                $count->execute([$p['section_id']]);
                if ((int) $count->fetchColumn() >= (int) $p['slots']) {
                    $pdo->rollBack();
                    return ['error' => $p['course_code'] . ' ' . $p['section_code'] . ' just became full. Remove it and pick another section.'];
                }
                $update->execute([$p['enrollment_id']]);
            }

            $pdo->commit();
            return ['count' => count($pending)];
        } catch (Throwable $ex) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $ex;
        }
    }
}