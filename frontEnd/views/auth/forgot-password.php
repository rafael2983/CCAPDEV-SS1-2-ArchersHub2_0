<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Forgot Password</title>
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/style.css') ?>">
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/index.css') ?>">
</head>

<body>
    <main class="forgot-pwd-page">
        <form class="forgot-pwd-form" method="POST" action="<?= url('forgot-password') ?>">
            <div class="forgot-pwd-container">
                <div class="logo-container">
                    <img src="<?= asset('frontEnd/views/images/school-logo.png') ?>" alt="School Logo" class="school-logo">
                </div>

                <?php if (!empty($message)): ?>
                    <p><?= e($message) ?></p>
                <?php endif; ?>

                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="Email" required>
                </div>

                <button type="submit" class="forgot-pwd-submit">Submit</button>
                <a href="<?= url('login') ?>" class="back-to-login">Back to Login</a>
            </div>
        </form>
    </main>
</body>
</html>
