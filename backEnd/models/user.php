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
        // Profile info for one user. Students also get college, program and campus;
    // other roles get null for those (LEFT JOIN).
    public static function profile(int $userId): ?array
    {
        $stmt = Database::connection()->prepare(
            "SELECT u.user_id, u.email, u.first_name, u.last_name, u.nickname, u.address,
                    u.contact_number, u.account_status,
                    c.name AS college, p.name AS program, s.campus
             FROM users u
             LEFT JOIN student s ON s.user_id = u.user_id
             LEFT JOIN program p ON p.program_id = s.program_id
             LEFT JOIN college c ON c.college_id = p.college_id
             WHERE u.user_id = ?
             LIMIT 1"
        );
        $stmt->execute([$userId]);
        return $stmt->fetch() ?: null;
    }

    // Saves the fields a user can edit themselves.
    public static function updateInfo(int $userId, ?string $nickname, ?string $address, ?string $contact): void
    {
        $stmt = Database::connection()->prepare(
            "UPDATE users SET nickname = ?, address = ?, contact_number = ? WHERE user_id = ?"
        );
        $stmt->execute([$nickname, $address, $contact, $userId]);
    }
}
