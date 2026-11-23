<?php
require_once __DIR__ . '/../models/Announcement.php';
require_once __DIR__ . '/../models/CalendarEvent.php';

class AnnouncementController
{
    private const MAX_CONTENT = 8000;
    private const MAX_BYTES = 5 * 1024 * 1024;
    private const ALLOWED = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'txt', 'doc', 'docx'];

    public function index(): void
    {
        require_page_access('announcements');

        $editing = null;
        $files = [];
        $editId = (int) ($_GET['edit'] ?? 0);
        if ($editId > 0) {
            $editing = Announcement::find($editId);
            $files = $editing ? Announcement::attachments($editId) : [];
        }

        view('pages/announcements', [
            'title'         => 'Make Announcements - ArchersHub',
            'active'        => 'announcements',
            'announcements' => Announcement::all(),
            'editing'       => $editing,
            'files'         => $files,
        ]);
    }

    public function save(): void
    {
        require_page_access('announcements');

        $id = (int) ($_POST['announcement_id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $content = trim($_POST['content'] ?? '');
        $start = parse_datetime($_POST['start_date'] ?? '');
        $end = parse_datetime($_POST['end_date'] ?? '');
        $important = isset($_POST['is_important']);

        if ($id > 0 && Announcement::find($id) === null) {
            flash('error', 'That announcement no longer exists.');
            redirect('announcements');
        }
        if ($title === '' || mb_strlen($title) > 200) {
            flash('error', 'Enter a title of 200 characters or fewer.');
            $this->back($id);
        }
        if ($content === '' || mb_strlen($content) > self::MAX_CONTENT) {
            flash('error', 'Enter the announcement text, up to ' . self::MAX_CONTENT . ' characters.');
            $this->back($id);
        }
        if ($start === null) {
            flash('error', 'Enter a valid start date.');
            $this->back($id);
        }
        if (trim($_POST['end_date'] ?? '') !== '' && $end === null) {
            flash('error', 'Enter a valid end date, or leave it blank.');
            $this->back($id);
        }
        if ($end !== null && $end < $start) {
            flash('error', 'The end date cannot be earlier than the start date.');
            $this->back($id);
        }

        $uploads = $this->collectUploads();
        if ($uploads === null) {
            $this->back($id);
        }

        $provostId = CalendarEvent::provostId((int) $_SESSION['user']['user_id']);
        if ($id > 0) {
            Announcement::update($id, $title, $content, $important, $start, $end);
        } else {
            $id = Announcement::create($provostId, $title, $content, $important, $start, $end);
        }

        foreach ($_POST['remove_file'] ?? [] as $attachmentId) {
            $path = Announcement::removeAttachment($id, (int) $attachmentId);
            if ($path !== null) {
                $this->unlinkStored($path);
            }
        }
        foreach ($uploads as $file) {
            Announcement::addAttachment($id, $file['name'], $file['path']);
        }

        flash('success', 'Announcement saved.');
        redirect('announcements');
    }

    public function delete(): void
    {
        require_page_access('announcements');

        $id = (int) ($_POST['announcement_id'] ?? 0);
        if ($id > 0 && Announcement::find($id) !== null) {
            foreach (Announcement::delete($id) as $path) {
                $this->unlinkStored($path);
            }
            flash('success', 'Announcement removed.');
        } else {
            flash('error', 'That announcement no longer exists.');
        }
        redirect('announcements');
    }

    private function back(int $id): void
    {
        redirect('announcements', $id > 0 ? ['edit' => $id] : []);
    }

    // Moves uploaded files into frontEnd/uploads/announcements. Returns null after flashing an error.
    private function collectUploads(): ?array
    {
        if (empty($_FILES['files']) || !is_array($_FILES['files']['name'])) {
            return [];
        }

        $dir = __DIR__ . '/../../frontEnd/uploads/announcements';
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            flash('error', 'The upload folder could not be created.');
            return null;
        }

        $saved = [];
        $count = count($_FILES['files']['name']);
        for ($i = 0; $i < $count; $i++) {
            $error = (int) $_FILES['files']['error'][$i];
            if ($error === UPLOAD_ERR_NO_FILE) {
                continue;
            }
            if ($error !== UPLOAD_ERR_OK) {
                $this->discardUploads($saved);
                flash('error', 'One of the files could not be uploaded.');
                return null;
            }

            $original = (string) $_FILES['files']['name'][$i];
            $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
            if (!in_array($ext, self::ALLOWED, true)) {
                $this->discardUploads($saved);
                flash('error', 'Files must be pdf, png, jpg, gif, txt, doc, or docx.');
                return null;
            }
            if ((int) $_FILES['files']['size'][$i] > self::MAX_BYTES) {
                $this->discardUploads($saved);
                flash('error', 'Each file must be 5 MB or smaller.');
                return null;
            }

            $safe = preg_replace('/[^A-Za-z0-9._-]/', '_', basename($original)) ?: ('file.' . $ext);
            $stored = date('YmdHis') . '_' . bin2hex(random_bytes(4)) . '_' . $safe;
            $target = $dir . '/' . $stored;
            if (!move_uploaded_file($_FILES['files']['tmp_name'][$i], $target)) {
                $this->discardUploads($saved);
                flash('error', 'One of the files could not be saved.');
                return null;
            }
            $saved[] = [
                'name' => $original,
                'path' => 'frontEnd/uploads/announcements/' . $stored,
            ];
        }
        return $saved;
    }

    private function discardUploads(array $saved): void
    {
        foreach ($saved as $file) {
            $this->unlinkStored($file['path']);
        }
    }

    private function unlinkStored(string $relative): void
    {
        $full = __DIR__ . '/../../' . ltrim($relative, '/');
        $root = realpath(__DIR__ . '/../../frontEnd/uploads/announcements');
        $file = realpath($full);
        if ($root && $file && str_starts_with($file, $root) && is_file($file)) {
            unlink($file);
        }
    }
}
