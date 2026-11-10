<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>University Login</title>
    <script src="<?= asset('frontEnd/scripts/index.js') ?>"></script>
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/style.css') ?>">
    <link rel="stylesheet" href="<?= asset('frontEnd/styles/index.css') ?>">
</head>

<body>
    <main class="login-page">

        <!-- LEFT SIDE -->
        <section class="school-section">
            <div class="slides-container">
                <div class="slide fade active">
                    <div class="number-page">1/3</div>
                    <img src="<?= asset('frontEnd/views/images/school-picture.png') ?>" class="school-image" alt="image">
                </div>
                <div class="slide fade">
                    <div class="number-page">2/3</div>
                    <img src="<?= asset('frontEnd/views/images/lasalle_hall.jpg') ?>" class="school-image" alt="image">
                </div>
                <div class="slide fade">
                    <div class="number-page">3/3</div>
                    <img src="<?= asset('frontEnd/views/images/FounderLSU.jpg') ?>" class="school-image" alt="image">
                </div>

                <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                <a class="next" onclick="plusSlides(1)">&#10095;</a>
            </div>

            <div class="dots-container">
                <span class="dot" onclick="currentSlide(1)"></span>
                <span class="dot" onclick="currentSlide(2)"></span>
                <span class="dot" onclick="currentSlide(3)"></span>
            </div>
        </section>

        <!-- RIGHT SIDE -->
        <section class="login-section">
            <div class="login-container">
                <div class="banner"></div>
                <div class="logo-container">
                    <img src="<?= asset('frontEnd/views/images/school-logo.png') ?>" alt="School Logo" class="school-logo">
                </div>

                <div class="banner-area"></div>

                <!-- LOGIN FORM -->
                <form class="login-form" method="POST" action="<?= url('login') ?>">

                    <?php if (!empty($error)): ?>
                        <p style="color: #c0392b; margin: 0 0 8px;"><?= e($error) ?></p>
                    <?php endif; ?>

                    <div class="input-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="Enter your email"
                               value="<?= e($email ?? '') ?>" required>
                    </div>

                    <div class="input-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter your password" required>
                    </div>

                    <div class="cloudflare">CLOUDFLARE</div>

                    <div class="button-row">
                        <a href="<?= url('forgot-password') ?>" class="secondary-button">Forgot Password</a>
                        <button type="submit" class="login-button">Login</button>
                    </div>

                    <button type="button" class="google-button">Google Login</button>
                </form>
            </div>
        </section>
    </main>
</body>
</html>
