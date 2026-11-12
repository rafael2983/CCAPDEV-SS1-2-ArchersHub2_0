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
