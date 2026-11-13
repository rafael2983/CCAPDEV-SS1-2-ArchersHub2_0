<?php
require_once __DIR__ . '/../models/Enrollment.php';
require_once __DIR__ . '/../models/Withdrawal.php';
require_once __DIR__ . '/../models/Schedule.php';

class WithdrawalController
{
    private const REASONS = [
        'Too heavy a load',
        'Schedule conflict',
        'Financial reasons',
        'Personal reasons',
        'Other',
    ];

    // GET: enrolled courses to pick from, and the withdrawal request form
    public function index(): void
    {
        require_page_access('withdrawal');

        $userId = (int) $_SESSION['user']['user_id'];
        $student = Enrollment::student($userId);
        $termId = Schedule::currentTermId();

        $data = ['title' => 'Course Withdrawal - ArchersHub', 'active' => 'withdrawal', 'notice' => null];

        if ($student === null) {
            view('pages/withdrawal', array_merge($data, ['notice' => 'Only students can withdraw from courses.']));
            return;
        }
        if ($termId === null) {
            view('pages/withdrawal', array_merge($data, ['notice' => 'There is no term set up yet.']));
            return;
        }

        $period = Enrollment::period($termId, 'Withdrawal');
        $periodOpen = $period !== null && (bool) $period['is_open'];
        $isActive = $student['academic_status'] === 'Active';

        view('pages/withdrawal', array_merge($data, [
            'canChange'  => $periodOpen && $isActive,
            'period'     => $period,
            'periodOpen' => $periodOpen,
            'isActive'   => $isActive,
            'enlisted'   => Enrollment::mySections($userId, $termId, ['Enlisted']),
            'history'    => Withdrawal::history($userId, $termId),
            'reasons'    => self::REASONS,
        ]));
    }

    // POST: withdraw from the ticked courses
    public function submit(): void
    {
        require_page_access('withdrawal');

        $student = Enrollment::student((int) $_SESSION['user']['user_id']);
        $termId = Schedule::currentTermId();
        if ($student === null || $termId === null) {
            flash('error', 'Withdrawal is not available for this account.');
            redirect('withdrawal');
        }
        if ($student['academic_status'] !== 'Active') {
            flash('error', 'Only active students can withdraw from courses.');
            redirect('withdrawal');
        }
        $period = Enrollment::period($termId, 'Withdrawal');
        if ($period === null || !$period['is_open']) {
            flash('error', 'The withdrawal period is closed.');
            redirect('withdrawal');
        }

        // Ticked courses: whole numbers only, no repeats
        $ids = array_values(array_unique(array_filter(
            array_map('intval', (array) ($_POST['sections'] ?? [])),
            fn($id) => $id > 0
        )));
        if (!$ids) {
            flash('error', 'Tick at least one course to withdraw from.');
            redirect('withdrawal');
        }

        $reason = $this->reason();
        if ($reason === null) {
            flash('error', 'Pick a reason. If you pick Other, explain it in under 255 characters.');
            redirect('withdrawal');
        }

        if (empty($_POST['agree'])) {
            flash('error', 'Please confirm that you understand the withdrawal cannot be undone.');
            redirect('withdrawal');
        }

        $result = Withdrawal::withdraw((int) $student['user_id'], $termId, $ids, $reason);
        if (isset($result['error'])) {
            flash('error', $result['error']);
        } else {
            flash('success', 'Withdrawn from ' . $result['count'] . ' course(s).');
        }
        redirect('withdrawal');
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
        $text = trim($_POST['reason_other'] ?? '');
        return ($text === '' || strlen($text) > 255) ? null : $text;
    }
}