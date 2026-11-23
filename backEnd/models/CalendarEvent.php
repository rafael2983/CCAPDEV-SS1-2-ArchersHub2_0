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

    // Events that have not ended yet (ongoing or still ahead).
    public static function upcoming(): array
    {
        $stmt = Database::connection()->query(
            "SELECT event_id, title, start_date, end_date, is_important
             FROM calendar_event
             WHERE COALESCE(end_date, start_date) >= CURDATE()
             ORDER BY start_date, event_id"
        );
        return $stmt->fetchAll();
    }

    public static function find(int $eventId): ?array
    {
        $stmt = Database::connection()->prepare(
            "SELECT event_id, title, start_date, end_date, is_important
             FROM calendar_event WHERE event_id = ?"
        );
        $stmt->execute([$eventId]);
        return $stmt->fetch() ?: null;
    }

    // created_by must be a provost id, or null (APO and Admin are not in that table).
    public static function create(?int $provostId, string $title, string $start, ?string $end, bool $important): void
    {
        $stmt = Database::connection()->prepare(
            "INSERT INTO calendar_event (created_by, title, start_date, end_date, is_important)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$provostId, $title, $start, $end, $important ? 1 : 0]);
    }

    public static function update(int $eventId, string $title, string $start, ?string $end, bool $important): void
    {
        $stmt = Database::connection()->prepare(
            "UPDATE calendar_event
             SET title = ?, start_date = ?, end_date = ?, is_important = ?
             WHERE event_id = ?"
        );
        $stmt->execute([$title, $start, $end, $important ? 1 : 0, $eventId]);
    }

    public static function delete(int $eventId): void
    {
        $stmt = Database::connection()->prepare("DELETE FROM calendar_event WHERE event_id = ?");
        $stmt->execute([$eventId]);
    }

    // The user's id when they are a provost; otherwise null so the foreign key is satisfied.
    public static function provostId(int $userId): ?int
    {
        $stmt = Database::connection()->prepare("SELECT user_id FROM provost WHERE user_id = ?");
        $stmt->execute([$userId]);
        $id = $stmt->fetchColumn();
        return $id === false ? null : (int) $id;
    }
}
