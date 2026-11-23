<?php
require_once __DIR__ . '/../core/Database.php';

class Announcement
{
    public static function all(): array
    {
        return Database::connection()->query(
            "SELECT announcement_id, title, content, is_important, start_date, end_date
             FROM announcement
             ORDER BY start_date DESC, announcement_id DESC"
        )->fetchAll();
    }

    // Announcements whose posting window includes right now.
    public static function active(): array
    {
        return Database::connection()->query(
            "SELECT announcement_id, title, content, is_important, start_date, end_date
             FROM announcement
             WHERE start_date <= NOW()
               AND (end_date IS NULL OR end_date >= NOW())
             ORDER BY is_important DESC, start_date DESC"
        )->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $stmt = Database::connection()->prepare(
            "SELECT announcement_id, provost_id, title, content, is_important, start_date, end_date
             FROM announcement WHERE announcement_id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function attachments(int $id): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT attachment_id, file_name, file_path
             FROM announcement_attachment
             WHERE announcement_id = ?
             ORDER BY attachment_id"
        );
        $stmt->execute([$id]);
        return $stmt->fetchAll();
    }

    public static function create(?int $provostId, string $title, string $content, bool $important, string $start, ?string $end): int
    {
        $stmt = Database::connection()->prepare(
            "INSERT INTO announcement (provost_id, title, content, is_important, start_date, end_date)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$provostId, $title, $content, $important ? 1 : 0, $start, $end]);
        return (int) Database::connection()->lastInsertId();
    }

    public static function update(int $id, string $title, string $content, bool $important, string $start, ?string $end): void
    {
        $stmt = Database::connection()->prepare(
            "UPDATE announcement
             SET title = ?, content = ?, is_important = ?, start_date = ?, end_date = ?
             WHERE announcement_id = ?"
        );
        $stmt->execute([$title, $content, $important ? 1 : 0, $start, $end, $id]);
    }

    public static function addAttachment(int $announcementId, string $fileName, string $filePath): void
    {
        $stmt = Database::connection()->prepare(
            "INSERT INTO announcement_attachment (announcement_id, file_name, file_path)
             VALUES (?, ?, ?)"
        );
        $stmt->execute([$announcementId, $fileName, $filePath]);
    }

    // Removes one attachment and returns its stored path so the file can be deleted.
    public static function removeAttachment(int $announcementId, int $attachmentId): ?string
    {
        $stmt = Database::connection()->prepare(
            "SELECT file_path FROM announcement_attachment
             WHERE attachment_id = ? AND announcement_id = ?"
        );
        $stmt->execute([$attachmentId, $announcementId]);
        $path = $stmt->fetchColumn();
        if ($path === false) {
            return null;
        }
        $del = Database::connection()->prepare(
            "DELETE FROM announcement_attachment WHERE attachment_id = ? AND announcement_id = ?"
        );
        $del->execute([$attachmentId, $announcementId]);
        return (string) $path;
    }

    // Deletes the announcement (attachments cascade) and returns file paths to unlink.
    public static function delete(int $id): array
    {
        $paths = array_column(self::attachments($id), 'file_path');
        $stmt = Database::connection()->prepare("DELETE FROM announcement WHERE announcement_id = ?");
        $stmt->execute([$id]);
        return $paths;
    }
}
