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

    // Accepts either an email or a numeric user ID.
    public static function findByLogin(string $identifier): ?array
    {
        if (str_contains($identifier, '@')) {
            return self::findByEmail($identifier);
        }
        if (ctype_digit($identifier)) {
            $stmt = Database::connection()->prepare(
                "SELECT * FROM users WHERE user_id = ? LIMIT 1"
            );
            $stmt->execute([(int) $identifier]);
            return $stmt->fetch() ?: null;
        }
        return null;
    }
}
