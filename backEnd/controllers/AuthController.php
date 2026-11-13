<?php
require_once __DIR__ . '/../models/user.php';

class AuthController
{
    // GET: show the login form
    public function showLogin(): void
    {
        view('auth/login');
    }

    // POST: check the credentials
    public function login(): void
    {
        $identifier = trim($_POST['identifier'] ?? '');
        $password = $_POST['password'] ?? '';

        $user = User::findByLogin($identifier);

        if (!$user || !$this->passwordMatches($password, $user['password_hash'])) {
            http_response_code(401);
            view('auth/login', ['error' => 'Invalid email or password', 'identifier' => $identifier]);
            return;
        }

        if ($user['account_status'] === 'Disabled') {
            http_response_code(403);
            view('auth/login', ['error' => 'Account is disabled', 'identifier' => $identifier]);
            return;
        }

        $_SESSION['user'] = [
            'user_id'    => $user['user_id'],
            'role'       => $user['role'],
            'first_name' => $user['first_name'],
        ];
        redirect('home');
    }

    // POST: end the session
    public function logout(): void
    {
        $_SESSION = [];
        session_destroy();
        redirect('home');
    }
    // Plain-text for this phase. Only this function changes when hashing is added.
    private function passwordMatches(string $plain, string $stored): bool
    {
        return $plain === $stored;
    }

    // GET: show the forgot-password form
    public function showForgot(): void
    {
        view('auth/forgot-password');
    }

    // POST: no email sending in this phase, just confirm the request
    public function forgot(): void
    {
        view('auth/forgot-password', [
            'message' => 'If that email is registered, reset instructions will be sent.'
        ]);
    }
}
