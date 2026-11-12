<?php
require_once __DIR__ . '/../models/ProgramExchange.php';

class ProgramExchangeController
{
    // GET: the application form and the student's earlier applications
    public function index(): void
    {
        require_page_access('program-exchange');

        $userId  = (int) $_SESSION['user']['user_id'];
        $current = ProgramExchange::currentProgram($userId);

        if ($current === null) {
            view('pages/program-exchange', [
                'title' => 'Program Exchange - ArchersHub', 'active' => 'program-exchange', 'isStudent' => false,
            ]);
            return;
        }

        view('pages/program-exchange', [
            'title'        => 'Program Exchange - ArchersHub',
            'active'       => 'program-exchange',
            'isStudent'    => true,
            'current'      => $current['name'],
            'targets'      => ProgramExchange::targets((int) $current['program_id']),
            'period'       => ProgramExchange::period(),
            'applications' => ProgramExchange::applications($userId),
            'hasPending'   => ProgramExchange::hasPending($userId),
        ]);
    }

    // POST: send a new application
    public function apply(): void
    {
        require_page_access('program-exchange');

        $error = ProgramExchange::apply(
            (int) $_SESSION['user']['user_id'],
            (int) ($_POST['target_program_id'] ?? 0),
            trim($_POST['reason'] ?? '')
        );
        if ($error === null) {
            flash('success', 'Program exchange application submitted.');
        } else {
            flash('error', $error);
        }
        redirect('program-exchange');
    }

    // POST: cancel one of the student's pending applications
    public function cancel(): void
    {
        require_page_access('program-exchange');

        ProgramExchange::cancel((int) $_SESSION['user']['user_id'], (int) ($_POST['application_id'] ?? 0));
        flash('success', 'Application cancelled.');
        redirect('program-exchange');
    }
}