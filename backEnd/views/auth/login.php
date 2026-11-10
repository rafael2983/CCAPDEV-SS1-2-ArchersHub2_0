<?php $title = 'Login - ArchersHub'; ?>
<?php require __DIR__ . '/../partials/header.php'; ?>

<h1>Login</h1>

<?php if (!empty($error)): ?>
    <p style="color: red;"><?= e($error) ?></p>
<?php endif; ?>

<form method="POST" action="<?= url('login') ?>">
    <label>Email <input type="email" name="email" required></label><br>
    <label>Password <input type="password" name="password" required></label><br>
    <button type="submit">Log in</button>
</form>

<?php require __DIR__ . '/../partials/footer.php'; ?>
