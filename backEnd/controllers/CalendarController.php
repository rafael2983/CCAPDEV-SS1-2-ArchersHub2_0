<?php
require_once __DIR__ . '/../models/CalendarEvent.php';

class CalendarController
{
    // GET: the university calendar (tabular or list view)
    public function index(): void
    {
        require_page_access('calendar');

        $viewMode = ($_GET['view'] ?? 'table') === 'list' ? 'list' : 'table';

        view('pages/calendar', [
            'title'    => 'University Calendar - ArchersHub',
            'active'   => 'calendar',
            'events'   => CalendarEvent::all(),
            'viewMode' => $viewMode,
        ]);
    }
}