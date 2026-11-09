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
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        $user = User::findByEmail($email);

        if (!$user || !$this->passwordMatches($password, $user['password_hash'])) {
            http_response_code(401);
            view('auth/login', ['error' => 'Invalid email or password']);
            return;
        }

        if ($user['account_status'] === 'Disabled') {
            http_response_code(403);
            view('auth/login', ['error' => 'Account is disabled']);
            return;
        }

        $_SESSION['user'] = [
            'user_id'    => $user['user_id'],
            'role'       => $user['role'],
            'first_name' => $user['first_name'],
        ];
        redirect('home');
    }

    // Plain-text for this phase. Only this function changes when hashing is added.
    private function passwordMatches(string $plain, string $stored): bool
    {
        return $plain === $stored;
    }
}
