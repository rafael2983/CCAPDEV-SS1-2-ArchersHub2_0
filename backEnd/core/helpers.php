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
    require __DIR__ . '/../views/' . $name . '.php';
}

function redirect(string $route): void
{
    header('Location: ' . url($route));
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