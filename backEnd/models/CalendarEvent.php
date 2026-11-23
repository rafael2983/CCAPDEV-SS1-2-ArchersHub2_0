<?php
require_once __DIR__ . '/../core/Database.php';

class CalendarEvent
{
    // Every event, earliest first.
    public static function all(): array
    {
        return Database::connection()->query(
            "SELECT event_id, title, start_date, end_date, is_important
             FROM calendar_event
             ORDER BY start_date, event_id"
        )->fetchAll();
    }
}