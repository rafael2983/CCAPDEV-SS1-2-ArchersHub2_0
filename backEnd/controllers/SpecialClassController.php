<?php
require_once __DIR__ . '/../models/Enrollment.php';
require_once __DIR__ . '/../models/Schedule.php';
require_once __DIR__ . '/../models/SpecialClass.php';

class SpecialClassController
{
    private const MAX_REASON = 500;

    // GET: applications of other students, the apply form, and my own applications
    public function index(): void
    {
        require_page_access('special-class');

        $userId = (int) $_SESSION['user']['user_id'];
        $student = Enrollment::student($userId);
        $termId = Schedule::currentTermId();

        $data = ['title' => 'Apply Special Class - ArchersHub', 'active' => 'special-class', 'notice' => null];

        if ($student === null) {
            view('pages/special-class', array_merge($data, ['notice' => 'Only students can apply for a special class.']));
            return;
        }
        if ($termId === null) {
            view('pages/special-class', array_merge($data, ['notice' => 'There is no term set up yet.']));
            return;
        }

        $period = Enrollment::period($termId, 'Special Class');
        $periodOpen = $period !== null && (bool) $period['is_open'];
        $isActive = $student['academic_status'] === 'Active';

        view('pages/special-class', array_merge($data, [
            'canChange'  => $periodOpen && $isActive,
            'period'     => $period,
            'periodOpen' => $periodOpen,
            'isActive'   => $isActive,
            'courses'    => SpecialClass::courses(),
            'applied'    => SpecialClass::applied($userId, $termId),
            'mine'       => SpecialClass::mine($userId, $termId),
            'campuses'   => SpecialClass::CAMPUSES,
        ]));
    }

    // POST: save a new application
    public function apply(): void
    {
        require_page_access('special-class');

        $student = Enrollment::student((int) $_SESSION['user']['user_id']);
        $termId = Schedule::currentTermId();
        if ($student === null || $termId === null) {
            flash('error', 'Special class applications are not available for this account.');
            redirect('special-class');
        }
        if ($student['academic_status'] !== 'Active') {
            flash('error', 'Only active students can apply for a special class.');
            redirect('special-class');
        }
        $period = Enrollment::period($termId, 'Special Class');
        if ($period === null || !$period['is_open']) {
            flash('error', 'The special class application period is closed.');
            redirect('special-class');
        }

        $course = trim($_POST['course'] ?? '');
        $campus = $_POST['campus'] ?? '';
        $reason = trim($_POST['reason'] ?? '');

        if ($course === '') {
            flash('error', 'Please select a course.');
            redirect('special-class');
        }
        if (!in_array($campus, SpecialClass::CAMPUSES, true)) {
            flash('error', 'Please pick a campus.');
            redirect('special-class');
        }
        if ($reason === '') {
            flash('error', 'Please give a reason for the special class.');
            redirect('special-class');
        }
        if (mb_strlen($reason) > self::MAX_REASON) {
            flash('error', 'Keep the reason under ' . self::MAX_REASON . ' characters.');
            redirect('special-class');
        }

        $userId = (int) $student['user_id'];
        $error = SpecialClass::applyError($userId, $termId, $course);
        if ($error !== null) {
            flash('error', $error);
            redirect('special-class');
        }

        SpecialClass::create($userId, $termId, $course, $campus, $reason);
        flash('success', 'Special class application for ' . $course . ' submitted.');
        redirect('special-class');
    }

    // POST: withdraw one of my pending applications
    public function withdraw(): void
    {
        require_page_access('special-class');

        $student = Enrollment::student((int) $_SESSION['user']['user_id']);
        $termId = Schedule::currentTermId();
        if ($student === null || $termId === null) {
            flash('error', 'Special class applications are not available for this account.');
            redirect('special-class');
        }
        $period = Enrollment::period($termId, 'Special Class');
        if ($period === null || !$period['is_open']) {
            flash('error', 'The special class application period is closed.');
            redirect('special-class');
        }

        $id = (int) ($_POST['application_id'] ?? 0);
        if ($id > 0 && SpecialClass::withdraw((int) $student['user_id'], $id)) {
            flash('success', 'Application withdrawn.');
        } else {
            flash('error', 'Only your own pending applications can be withdrawn.');
        }
        redirect('special-class');
    }
}