<?php
class Router
{
    private array $routes = ['GET' => [], 'POST' => []];

    public function get(string $route, callable $handler): void
    {
        $this->routes['GET'][$route] = $handler;
    }

    public function post(string $route, callable $handler): void
    {
        $this->routes['POST'][$route] = $handler;
    }

    public function dispatch(): void
    {
        $route = $_GET['route'] ?? 'home';
        $method = $_SERVER['REQUEST_METHOD'];
        $handler = $this->routes[$method][$route] ?? null;

        if ($handler === null) {
            http_response_code(404);
            echo 'Page not found';
            return;
        }
        $handler();
    }
}
