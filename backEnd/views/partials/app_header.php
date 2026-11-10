<?php
$user = $_SESSION['user'];
$allowed = role_access($user['role']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($title ?? 'ArchersHub') ?></title>

    <link rel="icon" href="<?= asset('frontEnd/views/images/school-logo.png') ?>">
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/style.css') ?>">
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/menu.css') ?>">
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/student.css') ?>">
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/teacher.css') ?>">
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/admin.css') ?>">
    <script src="<?= asset('frontEnd/scripts/nav.js') ?>" defer></script>
</head>

<body>
    <header class="top-bar">
        <button class="menu-btn" id="menu-btn" aria-label="Toggle navigation menu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </button>

        <a href="<?= url('home') ?>" class="logo-link" aria-label="Go to homepage">
            <img src="<?= asset('frontEnd/views/images/school-logo.png') ?>" alt="DLSU school logo">
        </a>

        <div class="header-fill"></div>

        <button class="theme-toggle" id="theme-toggle" aria-label="Switch between dark and light mode">
            <span class="theme-icon">&#9728;</span>
        </button>

        <a href="<?= url('profile') ?>" class="user-id" aria-label="Go to profile">ID<?= e((string) $user['user_id']) ?></a>
    </header>

    <div class="layout" id="layout">
        <nav class="sidebar" id="sidebar" aria-label="Main navigation">
            <ul class="side-menu">
                <?php foreach (menu_items() as $item): ?>
                    <?php if (in_array($item['access'], $allowed, true)): ?>
                        <li>
                            <a href="<?= url($item['route']) ?>"
                               class="<?= ($active ?? '') === $item['route'] ? 'active' : '' ?>">
                                <?= e($item['label']) ?>
                            </a>
                        </li>
                    <?php endif; ?>
                <?php endforeach; ?>
            </ul>

            <ul class="sidebar-bottom">
                <li>
                    <form method="POST" action="<?= url('logout') ?>">
                        <button type="submit" class="logout"
                                style="background:none;border:none;font:inherit;color:inherit;cursor:pointer;padding:0;">
                            Log out
                        </button>
                    </form>
                </li>
            </ul>
        </nav>

        <main class="main-section" id="main-content">
