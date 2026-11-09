<!DOCTYPE html>
<html>
<head><title>Login - ArchersHub</title></head>
<body>
    <h1>Login</h1>

    <?php if (!empty($error)): ?>
        <p style="color: red;"><?= e($error) ?></p>
    <?php endif; ?>

    <form method="POST" action="<?= url('login') ?>">
        <label>Email <input type="email" name="email" required></label><br>
        <label>Password <input type="password" name="password" required></label><br>
        <button type="submit">Log in</button>
    </form>

    <p><a href="<?= url('home') ?>">Back to home</a></p>
</body>
</html>
