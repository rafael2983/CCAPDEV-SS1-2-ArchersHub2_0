<?php
session_start();

require __DIR__ . '/backEnd/core/helpers.php';
require __DIR__ . '/backEnd/core/menu.php';
require __DIR__ . '/backEnd/core/pages.php';
require __DIR__ . '/backEnd/core/Router.php';
require __DIR__ . '/backEnd/controllers/HomeController.php';
require __DIR__ . '/backEnd/controllers/AuthController.php';
require __DIR__ . '/backEnd/controllers/PageController.php';
require __DIR__ . '/backEnd/controllers/ProfileController.php';

$router = new Router();

// Login / logout
$router->get('login', [new AuthController(), 'showLogin']);
$router->post('login', [new AuthController(), 'login']);
$router->post('logout', [new AuthController(), 'logout']);
$router->get('forgot-password', [new AuthController(), 'showForgot']);
$router->post('forgot-password', [new AuthController(), 'forgot']);

// Home
$router->get('home', [new HomeController(), 'index']);

// Every other sidebar page, plus profile
$pages = new PageController();
foreach (menu_items() as $item) {
    if ($item['route'] === 'home') {
        continue;
    }
    $route = $item['route'];
    $router->get($route, fn() => $pages->show($route));
}
$router->get('profile', [new ProfileController(), 'show']);

$router->dispatch();
