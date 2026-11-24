<?php
require_once __DIR__ . '/../models/Announcement.php';
require_once __DIR__ . '/../models/CalendarEvent.php';
require_once __DIR__ . '/../models/Schedule.php';

class HomeController
{
    public function index(): void
    {
        require_login();

        // Class schedule card: this term's meetings for the logged-in user
        $termId = Schedule::currentTermId();
        $schedule = $termId
            ? Schedule::meetings((int) $_SESSION['user']['user_id'], $_SESSION['user']['role'], $termId)
            : [];

            // Each announcement also gets its image list
            $announcements = Announcement::active();
            foreach ($announcements as $i => $item) {
                $announcements[$i]['images'] = Announcement::attachments((int) $item['announcement_id']);
            }        
            view('home', [
                'schedule'      => $schedule,
                'events'        => CalendarEvent::upcoming(),
                'announcements' => $announcements,
            ]);
    }
}