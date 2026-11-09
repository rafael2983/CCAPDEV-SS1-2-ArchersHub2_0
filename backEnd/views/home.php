<!DOCTYPE html>
<html>
<head><title>ArchersHub</title></head>
<body>

    <h1>ArchersHub</h1>
    <?php if (!empty($_SESSION['user'])): ?>
        <p>Logged in as <?= e($_SESSION['user']['first_name']) ?> (<?= e($_SESSION['user']['role']) ?>)</p>
    <?php else: ?>
        <p><a href="<?= url('login') ?>">Log in</a></p>
    <?php endif; ?>
</body>
</html>
