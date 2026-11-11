<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Profile</h1>

<div class="user-profile">

    <section class="card" id="pf-info">
        <div class="profile-head">
            <img src="<?= asset('frontEnd/views/images/profile-placeholder.png') ?>" alt="Profile picture" id="pf-pic" onerror="this.style.visibility='hidden'">
            <div>
                <h2 id="pf-name"><?= e($profile['first_name'] . ' ' . $profile['last_name']) ?></h2>
                <p id="pf-id"><?= e((string) $profile['user_id']) ?></p>
            </div>
        </div>

        <ul class="detail-list" id="pf-details">
            <li>Email: <span id="pf-email"><?= e($profile['email']) ?></span></li>
            <li>College: <span id="pf-college"><?= e($profile['college'] ?? 'N/A') ?></span></li>
            <li>Program: <span id="pf-program"><?= e($profile['program'] ?? 'N/A') ?></span></li>
            <li>Campus: <span id="pf-campus"><?= e($profile['campus'] ?? 'N/A') ?></span></li>
            <li>Account status: <span id="pf-status"><?= e($profile['account_status']) ?></span></li>
        </ul>

        <div class="enlist-actions">
            <button class="btn secondary" id="pf-pass-btn" type="button">Change password</button>
            <button class="btn secondary" id="pf-info-btn" type="button">Change self info</button>
        </div>
    </section>

    <!-- Right side: only one of these shows at a time -->
    <section class="card" id="pf-password-panel" hidden>
        <h2>Change password</h2>

        <label for="pf-old">Previous password</label>
        <input type="password" id="pf-old" autocomplete="current-password">

        <label for="pf-new">New password</label>
        <input type="password" id="pf-new" autocomplete="new-password">

        <label for="pf-confirm">Confirm new password</label>
        <input type="password" id="pf-confirm" autocomplete="new-password">

        <div class="enlist-actions">
            <button class="btn secondary" id="pf-pass-cancel" type="button">Do not change</button>
            <button class="btn primary" id="pf-pass-submit" type="button">Submit</button>
        </div>
    </section>

    <section class="card" id="pf-self-panel" hidden>
        <h2>Change self info</h2>

        <label for="pf-nickname">Nickname</label>
        <input type="text" id="pf-nickname">

        <label for="pf-address">Address</label>
        <input type="text" id="pf-address">

        <label for="pf-contact">Contact number</label>
        <input type="text" id="pf-contact">

        <div class="enlist-actions">
            <button class="btn secondary" id="pf-self-cancel" type="button">Cancel</button>
            <button class="btn primary" id="pf-self-submit" type="button">Save</button>
        </div>
    </section>

</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>
