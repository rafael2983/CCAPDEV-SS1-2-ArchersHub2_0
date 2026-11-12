<?php
require_once __DIR__ . '/../models/Enrollment.php';
require_once __DIR__ . '/../models/Schedule.php';

class EnlistmentController
{
    private const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    private const CAMPUSES = ['Laguna', 'Manila'];
    private const SORTS = ['code-asc', 'code-desc', 'name-asc', 'name-desc'];

    // GET: available sections on the left, the student's choices on the right
    public function index(): void
    {
        require_page_access('enlistment');

        $userId = (int) $_SESSION['user']['user_id'];
        $student = Enrollment::student($userId);
        $termId = Schedule::currentTermId();

        $data = [
            'title'      => 'Enlistment - ArchersHub',
            'active'     => 'enlistment',
            'notice'     => null,
            'canChange'  => false,
        ];

        // Admins have no program, so there is nothing to enlist in.
        if ($student === null) {
            view('pages/enlistment', array_merge($data, ['notice' => 'Only students can enlist in courses.']));
            return;
        }
        if ($termId === null) {
            view('pages/enlistment', array_merge($data, ['notice' => 'There is no term set up yet.']));
            return;
        }

        $period = Enrollment::period($termId, 'Enlistment');
        $periodOpen = $period !== null && (bool) $period['is_open'];
        $isActive = $student['academic_status'] === 'Active';

        // Filters (kept in the URL)
        $campus = $_GET['campus'] ?? $student['campus'];
        if (!in_array($campus, self::CAMPUSES, true)) {
            $campus = $student['campus'];
        }
        $q = trim($_GET['q'] ?? '');
        $sort = in_array($_GET['sort'] ?? '', self::SORTS, true) ? $_GET['sort'] : 'code-asc';
        $tab = ($_GET['tab'] ?? '') === 'schedule' ? 'schedule' : 'chosen';

        // Courses the student already chose this term, and passed courses
        $mine = Enrollment::mySections($userId, $termId, ['Pending', 'Enlisted']);
        $chosenByCourse = [];
        foreach ($mine as $m) {
            $chosenByCourse[$m['course_code']] = $m;
        }
        $passed = array_flip(Curriculum::passedCourses($userId));

        $rows = [];
        foreach (Enrollment::sectionsFor($userId, (int) $student['program_id'], $termId) as $s) {
            if ($s['campus'] !== $campus) {
                continue;
            }
            if ($q !== '' && stripos($s['course_code'] . ' ' . $s['title'], $q) === false) {
                continue;
            }

            // What the Action column shows for this row
            $s['state'] = 'available';
            $s['note'] = '';
            if ($s['my_status'] === 'Enlisted') {
                $s['state'] = 'enlisted';
            } elseif ($s['my_status'] === 'Pending') {
                $s['state'] = 'pending';
            } elseif (isset($chosenByCourse[$s['course_code']])) {
                $s['state'] = 'other-section';
            } elseif (isset($passed[$s['course_code']])) {
                $s['state'] = 'passed';
            } else {
                $missing = Enrollment::missingPrereqs($userId, $s['course_code']);
                if ($missing) {
                    $s['state'] = 'locked';
                    $s['note'] = implode(', ', $missing);
                } elseif ((int) $s['taken'] >= (int) $s['slots']) {
                    $s['state'] = 'full';
                }
            }
            $rows[] = $s;
        }

        usort($rows, function ($a, $b) use ($sort) {
            $byName = str_starts_with($sort, 'name');
            $cmp = $byName
                ? strcasecmp($a['title'], $b['title'])
                : strcmp($a['course_code'], $b['course_code']);
            if ($cmp === 0) {
                $cmp = strcmp($a['section_code'], $b['section_code']);
            }
            return str_ends_with($sort, 'desc') ? -$cmp : $cmp;
        });

        $pending = array_values(array_filter($mine, fn($m) => $m['status'] === 'Pending'));
        $enlisted = array_values(array_filter($mine, fn($m) => $m['status'] === 'Enlisted'));

        view('pages/enlistment', $data + [
            'canChange'     => $periodOpen && $isActive,
            'period'        => $period,
            'periodOpen'    => $periodOpen,
            'isActive'      => $isActive,
            'studentCampus' => $student['campus'],
            'campuses'      => self::CAMPUSES,
            'campus'        => $campus,
            'q'             => $q,
            'sort'          => $sort,
            'tab'           => $tab,
            'rows'          => $rows,
            'pending'       => $pending,
            'enlisted'      => $enlisted,
            'pendingUnits'  => array_sum(array_column($pending, 'units')),
            'days'          => self::DAYS,
            'grid'          => $this->grid($mine),
        ]);
    }

    // POST: save a section as a Pending choice
    public function add(): void
    {
        [$student, $termId] = $this->guard();

        $sectionId = (int) ($_POST['section_id'] ?? 0);
        $error = Enrollment::addError($student, $termId, $sectionId);
        if ($error !== null) {
            flash('error', $error);
        } else {
            Enrollment::add((int) $student['user_id'], $sectionId, 'Pending');
            flash('success', 'Course saved to your chosen courses.');
        }
        redirect('enlistment', $this->filters());
    }

    // POST: take a Pending choice back out
    public function remove(): void
    {
        [$student] = $this->guard();

        if (Enrollment::removePending((int) $student['user_id'], (int) ($_POST['section_id'] ?? 0))) {
            flash('success', 'Course removed from your chosen courses.');
        } else {
            flash('error', 'Only saved courses can be removed here. Use Add / Drop for enlisted courses.');
        }
        redirect('enlistment', $this->filters());
    }

    // POST: enlist every chosen course
    public function submit(): void
    {
        [$student, $termId] = $this->guard();

        if (empty($_POST['agree'])) {
            flash('error', 'Please agree to the school policy first.');
            redirect('enlistment', $this->filters());
        }

        $result = Enrollment::submitPending((int) $student['user_id'], $termId);
        if (isset($result['error'])) {
            flash('error', $result['error']);
        } else {
            flash('success', 'Enlisted in ' . $result['count'] . ' course(s).');
        }
        redirect('enlistment', $this->filters());
    }

    // Shared checks for every POST: logged in, a student, term set, period open, active status.
    // Returns [student row, term id]; otherwise flashes a message and redirects.
    private function guard(): array
    {
        require_page_access('enlistment');

        $student = Enrollment::student((int) $_SESSION['user']['user_id']);
        $termId = Schedule::currentTermId();
        if ($student === null || $termId === null) {
            flash('error', 'Enlistment is not available for this account.');
            redirect('enlistment');
        }
        if ($student['academic_status'] !== 'Active') {
            flash('error', 'Only active students can enlist.');
            redirect('enlistment');
        }
        $period = Enrollment::period($termId, 'Enlistment');
        if ($period === null || !$period['is_open']) {
            flash('error', 'The enlistment period is closed.');
            redirect('enlistment');
        }
        return [$student, $termId];
    }

    // The page filters sent back by the forms, so the page looks the same after a save.
    private function filters(): array
    {
        $out = [];
        foreach (['campus', 'q', 'sort', 'tab'] as $key) {
            if (($_POST[$key] ?? '') !== '') {
                $out[$key] = (string) $_POST[$key];
            }
        }
        return $out;
    }

    // Weekly table: one row per start time used, one column per day
    private function grid(array $sections): array
    {
        $starts = [];
        foreach ($sections as $s) {
            foreach ($s['meetings'] as $m) {
                $starts[$m['start_time']] = true;
            }
        }
        ksort($starts);

        $grid = [];
        foreach (array_keys($starts) as $start) {
            $cells = [];
            foreach (self::DAYS as $day) {
                $cells[$day] = [];
                foreach ($sections as $s) {
                    foreach ($s['meetings'] as $m) {
                        if ($m['day'] === $day && $m['start_time'] === $start) {
                            $cells[$day][] = $s['course_code'] . ($s['status'] === 'Pending' ? ' (saved)' : '');
                        }
                    }
                }
            }
            $grid[] = ['time' => format_time($start), 'cells' => $cells];
        }
        return $grid;
    }
}