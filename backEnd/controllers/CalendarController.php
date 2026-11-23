<?php
require_once __DIR__ . '/../models/CalendarEvent.php';

class CalendarController
{
    // GET: the university calendar. Office staff also get the add / edit form.
    public function index(): void
    {
        require_page_access('calendar');

        $viewMode = ($_GET['view'] ?? 'table') === 'list' ? 'list' : 'table';
        $editing = null;
        $editId = (int) ($_GET['edit'] ?? 0);
        if ($editId > 0 && can_manage_office()) {
            $editing = CalendarEvent::find($editId);
        }

        view('pages/calendar', [
            'title'    => 'University Calendar - ArchersHub',
            'active'   => 'calendar',
            'events'   => CalendarEvent::all(),
            'viewMode' => $viewMode,
            'canEdit'  => can_manage_office(),
            'editing'  => $editing,
        ]);
    }

    // POST: create or update one event.
    public function save(): void
    {
        $this->requireEditor();

        $eventId = (int) ($_POST['event_id'] ?? 0);
        $viewMode = ($_POST['view'] ?? 'table') === 'list' ? 'list' : 'table';
        $back = ['view' => $viewMode];

        $title = trim($_POST['title'] ?? '');
        $start = parse_datetime($_POST['start_date'] ?? '');
        $end = parse_datetime($_POST['end_date'] ?? '');
        $important = isset($_POST['is_important']);

        if ($title === '' || mb_strlen($title) > 200) {
            flash('error', 'Enter an event title of 200 characters or fewer.');
            redirect('calendar', $eventId > 0 ? $back + ['edit' => $eventId] : $back);
        }
        if ($start === null) {
            flash('error', 'Enter a valid start date.');
            redirect('calendar', $eventId > 0 ? $back + ['edit' => $eventId] : $back);
        }
        if (trim($_POST['end_date'] ?? '') !== '' && $end === null) {
            flash('error', 'Enter a valid end date, or leave it blank.');
            redirect('calendar', $eventId > 0 ? $back + ['edit' => $eventId] : $back);
        }
        if ($end !== null && $end < $start) {
            flash('error', 'The end date cannot be earlier than the start date.');
            redirect('calendar', $eventId > 0 ? $back + ['edit' => $eventId] : $back);
        }

        if ($eventId > 0) {
            if (CalendarEvent::find($eventId) === null) {
                flash('error', 'That calendar event no longer exists.');
                redirect('calendar', $back);
            }
            CalendarEvent::update($eventId, $title, $start, $end, $important);
            flash('success', 'Calendar event updated.');
        } else {
            $provostId = CalendarEvent::provostId((int) $_SESSION['user']['user_id']);
            CalendarEvent::create($provostId, $title, $start, $end, $important);
            flash('success', 'Calendar event added.');
        }
        redirect('calendar', $back);
    }

    // POST: remove one event.
    public function delete(): void
    {
        $this->requireEditor();

        $eventId = (int) ($_POST['event_id'] ?? 0);
        $viewMode = ($_POST['view'] ?? 'table') === 'list' ? 'list' : 'table';
        if ($eventId > 0 && CalendarEvent::find($eventId) !== null) {
            CalendarEvent::delete($eventId);
            flash('success', 'Calendar event removed.');
        } else {
            flash('error', 'That calendar event no longer exists.');
        }
        redirect('calendar', ['view' => $viewMode]);
    }

    private function requireEditor(): void
    {
        require_page_access('calendar');
        if (!can_manage_office()) {
            flash('error', 'Only the Provost office can edit the calendar.');
            redirect('calendar');
        }
    }
}
