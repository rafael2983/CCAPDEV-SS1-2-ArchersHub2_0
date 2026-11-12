<?php
class PageController
{
    public function show(string $route): void
    {
        require_login();

        $page = page_info($route);
        if ($page === null) {
            http_response_code(404);
            echo 'Page not found';
            return;
        }

        // Role check: a Student can't open an admin page by typing its URL.
        if (!in_array($page['access'], role_access($_SESSION['user']['role']), true)) {
            http_response_code(403);
            view('pages/forbidden', ['title' => 'Access denied - ArchersHub', 'active' => '']);
            return;
        }

        // Use the page's own view if it exists, otherwise the placeholder.
        $name = view_exists('pages/' . $route) ? 'pages/' . $route : 'pages/placeholder';
        view($name, [
            'title'     => $page['label'] . ' - ArchersHub',
            'active'    => $route,
            'pageTitle' => $page['label'],
        ]);
    }
}
