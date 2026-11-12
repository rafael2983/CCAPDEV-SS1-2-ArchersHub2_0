<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/style.css') ?>">
    <title><?= e($title ?? 'ArchersHub') ?></title>
</head>
<body>
    <nav>
        <a href="<?= url('home') ?>">Home</a>

        <?php if (!empty($_SESSION['user'])): ?>
            <span>Hi, <?= e($_SESSION['user']['first_name']) ?> (<?= e($_SESSION['user']['role']) ?>)</span>
            <form method="POST" action="<?= url('logout') ?>" style="display:inline;">
                <button type="submit">Log out</button>
            </form>
        <?php else: ?>
            <a href="<?= url('login') ?>">Log in</a>
        <?php endif; ?>
    </nav>
    <hr>
