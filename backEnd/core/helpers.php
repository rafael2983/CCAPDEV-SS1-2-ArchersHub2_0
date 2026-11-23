<?php
function config(): array
{
    static $c = null;
    return $c ??= require __DIR__ . '/../config/config.php';
}

// Builds a link that works under any subfolder (local or CCS Cloud).
function url(string $route = 'home'): string
{
    return config()['base_url'] . '/index.php?route=' . urlencode($route);
}

// Loads a view file and gives it the data as variables.
function view(string $name, array $data = []): void
{
    extract($data);
    require __DIR__ . '/../../frontEnd/views/' . $name . '.php';
}

// $params are extra query values (for example the filters of the page).
function redirect(string $route, array $params = []): void
{
    $extra = $params ? '&' . http_build_query($params) : '';
    header('Location: ' . url($route) . $extra);
    exit;
}

// Escapes text before printing it in HTML.
function e(?string $text): string
{
    return htmlspecialchars($text ?? '', ENT_QUOTES, 'UTF-8');
}
// Builds a link to a static file (CSS, JS, images) under any subfolder.
function asset(string $path): string
{
    return config()['base_url'] . '/' . ltrim($path, '/');
}

// Sends visitors who aren't logged in to the login page.
function require_login(): void
{
    if (empty($_SESSION['user'])) {
        redirect('login');
    }
}

// One-time message shown on the next page (success / error / info).
function flash(string $type, string $message): void
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function take_flash(): ?array
{
    $flash = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $flash;
}
// The address GET forms send to (the route goes in a hidden field).
function index_url(): string
{
    return config()['base_url'] . '/index.php';
}

// "08:00:00" -> "8:00 AM"
function format_time(?string $time): string
{
    return $time === null ? '' : date('g:i A', strtotime($time));
}

// A meeting row -> "Mon 8:00 AM-9:30 AM | G201"
function format_meeting(array $m): string
{
    return $m['day'] . ' ' . format_time($m['start_time']) . '-' . format_time($m['end_time'])
        . ' | ' . ($m['room'] ?? '-');
}


// "2026-11-23 08:00:00" -> "Nov 23, 2026 8:00 AM" (no time shown for midnight)
function format_event_date(?string $dateTime): string
{
    if ($dateTime === null) {
        return '';
    }
    $stamp = strtotime($dateTime);
    $text = date('M j, Y', $stamp);
    return date('H:i:s', $stamp) === '00:00:00' ? $text : $text . ' ' . date('g:i A', $stamp);
}

// "2026-11-23 08:00:00" -> "2026-11-23T08:00" for a datetime-local input.
function datetime_local(?string $dateTime): string
{
    return $dateTime === null || $dateTime === '' ? '' : date('Y-m-d\TH:i', strtotime($dateTime));
}

// A date or datetime-local value -> "Y-m-d H:i:s", or null when it is empty or invalid.
function parse_datetime(?string $value): ?string
{
    $value = trim(str_replace('T', ' ', (string) $value));
    if ($value === '') {
        return null;
    }
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        $value .= ' 00:00:00';
    } elseif (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value)) {
        $value .= ':00';
    } elseif (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $value)) {
        return null;
    }
    $stamp = strtotime($value);
    return $stamp === false ? null : date('Y-m-d H:i:s', $stamp);
}

// Provost, APO and Admin can post announcements and edit the calendar.
function can_manage_office(): bool
{
    return !empty($_SESSION['user'])
        && in_array('office', role_access($_SESSION['user']['role']), true);
}