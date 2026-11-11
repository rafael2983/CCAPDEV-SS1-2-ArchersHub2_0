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
}