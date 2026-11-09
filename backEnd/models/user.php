<?php
require_once __DIR__ . '/../core/Database.php';

class User
{
    // Returns the user row as an array, or null if the email isn't found.
    public static function findByEmail(string $email): ?array
    {
        $stmt = Database::connection()->prepare(
            "SELECT * FROM users WHERE email = ? LIMIT 1"
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
