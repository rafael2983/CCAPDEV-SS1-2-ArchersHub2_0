<?php
require_once __DIR__ . '/../models/user.php';

class ProfileController
{
    public function show(): void
    {
        require_login();

        $profile = User::profile((int) $_SESSION['user']['user_id']);
        if ($profile === null) {
            // The account no longer exists, so end the session.
            $_SESSION = [];
            redirect('login');
        }

        view('pages/profile', [
            'title'   => 'Profile - ArchersHub',
            'active'  => 'profile',
            'profile' => $profile,
        ]);
    }
        // POST: save nickname, address and contact number
    public function updateInfo(): void
    {
        require_login();

        $nickname = trim($_POST['nickname'] ?? '');
        $address  = trim($_POST['address'] ?? '');
        $contact  = trim($_POST['contact'] ?? '');

        if ($contact !== '' && !preg_match('/^[0-9+\-\s]{7,15}$/', $contact)) {
            flash('error', 'Enter a valid contact number.');
            redirect('profile');
        }
        // Column sizes in the users table: nickname 100, address 255
        if (strlen($nickname) > 100 || strlen($address) > 255) {
            flash('error', 'Nickname or address is too long.');
            redirect('profile');
        }

        User::updateInfo(
            (int) $_SESSION['user']['user_id'],
            $nickname === '' ? null : $nickname,
            $address === '' ? null : $address,
            $contact === '' ? null : $contact
        );

        flash('success', 'Profile information saved.');
        redirect('profile');
    }
}
