<?php
// True if backEnd/views/<name>.php exists.
function view_exists(string $name): bool
{
    return is_file(__DIR__ . '/../views/' . $name . '.php');
}

// Looks up a page's label and access group by its route name.
function page_info(string $route): ?array
{
    foreach (menu_items() as $item) {
        if ($item['route'] === $route) {
            return $item;
        }
    }
    // Profile isn't in the sidebar (it's the ID link in the top bar).
    if ($route === 'profile') {
        return ['route' => 'profile', 'label' => 'Profile', 'access' => 'general'];
    }
    return null;
}

// Stops the request unless the logged-in user's role may open this page.
function require_page_access(string $route): void
{
    require_login();

    $page = page_info($route);
    if ($page === null || !in_array($page['access'], role_access($_SESSION['user']['role']), true)) {
        http_response_code(403);
        view('pages/forbidden', ['title' => 'Access denied - ArchersHub', 'active' => '']);
        exit;
    }
}