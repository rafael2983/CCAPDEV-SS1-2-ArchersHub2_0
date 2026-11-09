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
