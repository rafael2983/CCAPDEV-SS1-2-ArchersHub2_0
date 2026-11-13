<?php
require_once __DIR__ . '/../models/Curriculum.php';

class CurriculumController
{
    // GET: the student's curriculum, optionally filtered by status
    public function index(): void
    {
        require_page_access('curriculum');

        // null = the user has no program (for example an admin)
        $items = Curriculum::forStudent((int) $_SESSION['user']['user_id']);
        $all = $items ?? [];

        $status = $_GET['status'] ?? '';
        if (!in_array($status, ['taken', 'available', 'locked'], true)) {
            $status = '';
        }

        $totalUnits = 0;
        $doneUnits = 0;
        foreach ($all as $c) {
            $totalUnits += (int) $c['units'];
            if ($c['status'] === 'taken') {
                $doneUnits += (int) $c['units'];
            }
        }
        $percent = $totalUnits > 0 ? (int) round($doneUnits / $totalUnits * 100) : 0;

        $shown = $status === ''
            ? $all
            : array_values(array_filter($all, fn($c) => $c['status'] === $status));

        view('pages/curriculum', [
            'title'      => 'Curriculum Progression - ArchersHub',
            'active'     => 'curriculum',
            'hasProgram' => $items !== null,
            'courses'    => $shown,
            'status'     => $status,
            'doneUnits'  => $doneUnits,
            'totalUnits' => $totalUnits,
            'percent'    => $percent,
        ]);
    }
}