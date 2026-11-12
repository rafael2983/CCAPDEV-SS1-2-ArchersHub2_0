<?php
require_once __DIR__ . '/../models/Enrollment.php';
require_once __DIR__ . '/../models/AddDrop.php';
require_once __DIR__ . '/../models/Schedule.php';

class AddDropController
{
    private const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    private const CAMPUSES = ['Laguna', 'Manila'];
    private const SORTS = ['code-asc', 'code-desc', 'name-asc', 'name-desc'];
    private const REASONS = [
        'Schedule conflict',
        'Wrong section',
        'Prerequisite issue',
        'Too heavy or too light a load',
        'Personal reasons',
        'Other',
    ];

    // GET: courses to add on the left, enlisted courses (drop / change) on the right
    public function index(): void
    {
        require_page_access('add-drop');

        $userId = (int) $_SESSION['user']['user_id'];
        $student = Enrollment::student($userId);
        $termId = Schedule::currentTermId();

        $data = ['title' => 'Add / Drop - ArchersHub', 'active' => 'add-drop', 'notice' => null];

        if ($student === null) {
            view('pages/add-drop', array_merge($data, ['notice' => 'Only students can add or drop courses.']));
            return;
        }
        if ($termId === null) {
            view('pages/add-drop', array_merge($data, ['notice' => 'There is no term set up yet.']));
            return;
        }

        $period = Enrollment::period($termId, 'Add/Drop');
        $periodOpen = $period !== null && (bool) $period['is_open'];
        $isActive = $student['academic_status'] === 'Active';

        $campus = $_GET['campus'] ?? $student['campus'];
        if (!in_array($campus, self::CAMPUSES, true)) {
            $campus = $student['campus'];
        }
        $q = trim($_GET['q'] ?? '');
        $sort = in_array($_GET['sort'] ?? '', self::SORTS, true) ? $_GET['sort'] : 'code-asc';
        $tab = ($_GET['tab'] ?? '') === 'schedule' ? 'schedule' : 'chosen';

        $mine = Enrollment::mySections($userId, $termId, ['Pending', 'Enlisted']);
        $chosenByCourse = [];
        foreach ($mine as $m) {
            $chosenByCourse[$m['course_code']] = $m;
        }
        $passed = array_flip(Curriculum::passedCourses($userId));

        $all = Enrollment::sectionsFor($userId, (int) $student['program_id'], $termId);

        // Left table: every section of the chosen campus, with what the student can do with it
        $rows = [];
        foreach ($all as $s) {
            if ($s['campus'] !== $campus) {
                continue;
            }
            if ($q !== '' && stripos($s['course_code'] . ' ' . $s['title'], $q) === false) {
                continue;
            }

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
            $cmp = str_starts_with($sort, 'name')
                ? strcasecmp($a['title'], $b['title'])
                : strcmp($a['course_code'], $b['course_code']);
            if ($cmp === 0) {
                $cmp = strcmp($a['section_code'], $b['section_code']);
            }
            return str_ends_with($sort, 'desc') ? -$cmp : $cmp;
        });

        // Right panel: enlisted courses, each with the other sections it could change to
        $enlisted = array_values(array_filter($mine, fn($m) => $m['status'] === 'Enlisted'));
        foreach ($enlisted as &$e) {
            $e['others'] = array_values(array_filter(
                $all,
                fn($s) => $s['course_code'] === $e['course_code'] && (int) $s['section_id'] !== (int) $e['section_id']
            ));
        }
        unset($e);
        $pending = array_values(array_filter($mine, fn($m) => $m['status'] === 'Pending'));

        view('pages/add-drop', array_merge($data, [
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
            'enlisted'      => $enlisted,
            'pending'       => $pending,
            'reasons'       => self::REASONS,
            'days'          => self::DAYS,
            'grid'          => $this->grid($enlisted),
        ]));
    }

    // POST: add a section straight to the enlisted courses
    public function add(): void
    {
        [$student, $termId] = $this->guard();

        $sectionId = (int) ($_POST['section_id'] ?? 0);
        $error = Enrollment::addError($student, $termId, $sectionId);
        if ($error !== null) {
            flash('error', $error);
        } else {
            Enrollment::add((int) $student['user_id'], $sectionId, 'Enlisted');
            flash('success', 'Course added.');
        }
        redirect('add-drop', $this->filters());
    }

    // POST: drop an enlisted course (a reason is required)
    public function drop(): void
    {
        [$student] = $this->guard();

        $reason = $this->reason();
        if ($reason === null) {
            flash('error', 'Pick a reason for dropping. If you pick Other, explain it in under 255 characters.');
            redirect('add-drop', $this->filters());
        }

        if (AddDrop::drop((int) $student['user_id'], (int) ($_POST['section_id'] ?? 0), $reason)) {
            flash('success', 'Course dropped.');
        } else {
            flash('error', 'You are not enlisted in that section.');
        }
        redirect('add-drop', $this->filters());
    }

    // POST: move an enlisted course to another section of the same course
    public function change(): void
    {
        [$student, $termId] = $this->guard();

        $error = AddDrop::change(
            $student,
            $termId,
            (int) ($_POST['section_id'] ?? 0),
            (int) ($_POST['to_section_id'] ?? 0)
        );
        if ($error !== null) {
            flash('error', $error);
        } else {
            flash('success', 'Section changed.');
        }
        redirect('add-drop', $this->filters());
    }

    // Same checks for every POST: student, term, Active status, Add/Drop period open.
    private function guard(): array
    {
        require_page_access('add-drop');

        $student = Enrollment::student((int) $_SESSION['user']['user_id']);
        $termId = Schedule::currentTermId();
        if ($student === null || $termId === null) {
            flash('error', 'Add / Drop is not available for this account.');
            redirect('add-drop');
        }
        if ($student['academic_status'] !== 'Active') {
            flash('error', 'Only active students can add or drop courses.');
            redirect('add-drop');
        }
        $period = Enrollment::period($termId, 'Add/Drop');
        if ($period === null || !$period['is_open']) {
            flash('error', 'The add / drop period is closed.');
            redirect('add-drop');
        }
        return [$student, $termId];
    }

    // The reason text to store, or null if it is missing or not one of the choices.
    private function reason(): ?string
    {
        $choice = $_POST['reason'] ?? '';
        if (!in_array($choice, self::REASONS, true)) {
            return null;
        }
        if ($choice !== 'Other') {
            return $choice;
        }
        // The reason column holds 255 characters; strlen counts bytes, so this is always safe.
        $text = trim($_POST['reason_other'] ?? '');
        return ($text === '' || strlen($text) > 255) ? null : $text;
    }

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
                            $cells[$day][] = $s['course_code'];
                        }
                    }
                }
            }
            $grid[] = ['time' => format_time($start), 'cells' => $cells];
        }
        return $grid;
    }
}