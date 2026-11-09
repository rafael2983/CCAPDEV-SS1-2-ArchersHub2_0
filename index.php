<?php
require __DIR__ . '/backEnd/core/helpers.php';
require __DIR__ . '/backEnd/core/Router.php';
require __DIR__ . '/backEnd/controllers/HomeController.php';

$router = new Router();
$router->get('home', [new HomeController(), 'index']);
$router->dispatch();
