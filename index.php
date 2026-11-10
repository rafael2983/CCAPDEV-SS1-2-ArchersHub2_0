<?php
session_start();

require __DIR__ . '/backEnd/core/helpers.php';
require __DIR__ . '/backEnd/core/Router.php';
require __DIR__ . '/backEnd/controllers/HomeController.php';
require __DIR__ . '/backEnd/controllers/AuthController.php';
require __DIR__ . '/backEnd/core/menu.php';

$router = new Router();
$router->get('home', [new HomeController(), 'index']);
$router->get('login', [new AuthController(), 'showLogin']);
$router->post('login', [new AuthController(), 'login']);
$router->post('logout', [new AuthController(), 'logout']);
$router->get('forgot-password', [new AuthController(), 'showForgot']);
$router->post('forgot-password', [new AuthController(), 'forgot']);
$router->dispatch();
