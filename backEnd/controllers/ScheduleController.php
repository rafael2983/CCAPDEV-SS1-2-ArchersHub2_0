<?php
require_once __DIR__ . '/../models/Schedule.php';

class ScheduleController
{
    private const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // GET: the schedule of one term, as a weekly table or a list
    public function index(): void
    {
        require_page_access('schedule');

        $terms = Schedule::terms();

        // The term from the filter, otherwise the current one
        $selected = (int) ($_GET['term'] ?? 0);
        if (!in_array($selected, array_map('intval', array_column($terms, 'term_id')), true)) {
            $selected = (int) Schedule::currentTermId();
        }

        $viewMode = ($_GET['view'] ?? 'week') === 'list' ? 'list' : 'week';

        $meetings = $selected
            ? Schedule::meetings((int) $_SESSION['user']['user_id'], $_SESSION['user']['role'], $selected)
            : [];

        // List view: one entry per section, with its meeting times
        $entries = [];
        foreach ($meetings as $m) {
            $key = $m['course_code'] . '|' . $m['section_code'];
            $entries[$key] ??= [
                'code'    => $m['course_code'],
                'title'   => $m['title'],
                'section' => $m['section_code'],
                'slots'   => [],
            ];
            if ($m['day'] !== null) {
                $entries[$key]['slots'][] = $m['day'] . ' ' . format_time($m['start_time'])
                    . '-' . format_time($m['end_time']) . ' | ' . ($m['room'] ?? '-');
            }
        }

        // Weekly view: one row for each start time that is used, one column per day
        $starts = [];
        foreach ($meetings as $m) {
            if ($m['day'] !== null) {
                $starts[$m['start_time']] = true;
            }
        }
        ksort($starts);

        $grid = [];
        foreach (array_keys($starts) as $start) {
            $cells = [];
            foreach (self::DAYS as $day) {
                $cells[$day] = [];
                foreach ($meetings as $m) {
                    if ($m['day'] === $day && $m['start_time'] === $start) {
                        $cells[$day][] = $m['course_code'];
                    }
                }
            }
            $grid[] = ['time' => format_time($start), 'cells' => $cells];
        }

        view('pages/schedule', [
            'title'    => 'View Schedule - ArchersHub',
            'active'   => 'schedule',
            'terms'    => $terms,
            'selected' => $selected,
            'viewMode' => $viewMode,
            'days'     => self::DAYS,
            'grid'     => $grid,
            'entries'  => array_values($entries),
        ]);
    }
}