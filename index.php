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
require __DIR__ . '/backEnd/controllers/RecordsController.php';
require __DIR__ . '/backEnd/controllers/CurriculumController.php';
require __DIR__ . '/backEnd/controllers/ScheduleController.php';
require __DIR__ . '/backEnd/controllers/EnlistmentController.php';
require __DIR__ . '/backEnd/controllers/AddDropController.php';
require __DIR__ . '/backEnd/controllers/WithdrawalController.php';
require __DIR__ . '/backEnd/controllers/SpecialClassController.php';

$router = new Router();

// Login / logout
$router->get('login', [new AuthController(), 'showLogin']);
$router->post('login', [new AuthController(), 'login']);
$router->post('logout', [new AuthController(), 'logout']);
$router->get('forgot-password', [new AuthController(), 'showForgot']);
$router->post('forgot-password', [new AuthController(), 'forgot']);
$router->post('profile-info', [new ProfileController(), 'updateInfo']);


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
$router->get('records', [new RecordsController(), 'index']);
$router->get('curriculum', [new CurriculumController(), 'index']);
$router->get('schedule', [new ScheduleController(), 'index']);

// Enlistment
$enlistment = new EnlistmentController();
$router->get('enlistment', [$enlistment, 'index']);
$router->post('enlistment-add', [$enlistment, 'add']);
$router->post('enlistment-remove', [$enlistment, 'remove']);
$router->post('enlistment-submit', [$enlistment, 'submit']);

// Add / Drop
$addDrop = new AddDropController();
$router->get('add-drop', [$addDrop, 'index']);
$router->post('add-drop-add', [$addDrop, 'add']);
$router->post('add-drop-drop', [$addDrop, 'drop']);
$router->post('add-drop-change', [$addDrop, 'change']);

// Course Withdrawal
$withdrawal = new WithdrawalController();
$router->get('withdrawal', [$withdrawal, 'index']);
$router->post('withdrawal-submit', [$withdrawal, 'submit']);

// Special Class
$specialClass = new SpecialClassController();
$router->get('special-class', [$specialClass, 'index']);
$router->post('special-class-apply', [$specialClass, 'apply']);
$router->post('special-class-withdraw', [$specialClass, 'withdraw']);

$router->dispatch();