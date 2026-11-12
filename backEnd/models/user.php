<?php
require_once __DIR__ . '/../core/Database.php';

class User
{
    // Returns the user row as an array, or null if the email isn't found.
    public static function findByEmail(string $email): ?array {
        $stmt = Database::connection()->prepare(
            "SELECT * FROM users WHERE email = ? LIMIT 1"
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // Accepts either an email or a numeric user ID.
    public static function findByLogin(string $identifier): ?array {
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
    public static function profile(int $userId): ?array {
        $stmt = Database::connection()->prepare(
            "SELECT u.user_id, u.email, u.first_name, u.middle_name, u.last_name, u.nickname, 
                    u.address, u.contact_number, u.account_status, u.role, 
                    c.name AS college, p.name AS program, s.campus
             FROM users u
             LEFT JOIN student s ON s.user_id = u.user_id
             LEFT JOIN program p ON p.program_id = s.program_id
             LEFT JOIN college c ON c.college_id = p.college_id
             WHERE u.user_id = ?
             LIMIT 1"
        );
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    // Saves the fields a user can edit themselves.
    public static function updateInfo(int $userId, ?string $nickname, ?string $address, ?string $contact): void {
        $stmt = Database::connection()->prepare(
            "UPDATE users SET nickname = ?, address = ?, contact_number = ? WHERE user_id = ?"
        );
        $stmt->execute([$nickname, $address, $contact, $userId]);
    }

    public static function getAll(): array {
        $stmt = Database::connection()->query(
            "SELECT user_id, first_name, last_name, role, account_status
            FROM users
            WHERE LOWER(TRIM(role)) <> 'admin'
            ORDER BY user_id ASC"
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getEnlistment(int $userId): array {
        $stmt = Database::connection()->prepare(
            "SELECT c.course_code AS course, sec.section_code AS section,
                    CONCAT('AY', t.school_year, ' T', t.term_no) AS term, e.status
            FROM enrollment e
            INNER JOIN section sec ON sec.section_id = e.section_id
            INNER JOIN course c ON c.course_code = sec.course_code
            INNER JOIN term t ON t.term_id = sec.term_id
            WHERE e.student_id = ?
            ORDER BY t.start_date DESC, c.course_code ASC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getGrades(int $userId): array {
        $stmt = Database::connection()->prepare(
            "SELECT c.course_code AS course, g.grade_value AS grade,
                    CONCAT('AY', t.school_year, ' T', t.term_no) AS term
            FROM grade g
            INNER JOIN enrollment e ON e.enrollment_id = g.enrollment_id
            INNER JOIN section sec ON sec.section_id = e.section_id
            INNER JOIN course c ON c.course_code = sec.course_code
            INNER JOIN term t ON t.term_id = sec.term_id
            WHERE e.student_id = ?
            ORDER BY t.start_date DESC, c.course_code ASC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getTimeline(int $userId): array {
        $stmt = Database::connection()->prepare(
            "SELECT DATE_FORMAT(start_date, '%Y-%m-%d') AS date, 
                    COALESCE(NULLIF(TRIM(note), ''), status) AS event
            FROM student_status_history
            WHERE student_id = ?
            ORDER BY start_date ASC, history_id ASC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function saveAccount(array $account, string $action): int {
        $pdo = Database::connection();
        $pdo->beginTransaction();

        try {
            $userId = filter_var($account['id'] ?? null, FILTER_VALIDATE_INT);

            if (!$userId || $userId <= 0) {
                throw new InvalidArgumentException('Required valid account ID.');
            }

            $firstName = trim((string) ($account['firstName'] ?? ''));
            $middleName = trim((string) ($account['middleName'] ?? ''));
            $lastName = trim((string) ($account['surname'] ?? ''));
            $email = trim((string) ($account['email'] ?? ''));
            $role = trim((string) ($account['type'] ?? ''));
            $status = trim((string) ($account['status'] ?? ''));
            $address = trim((string) ($account['address'] ?? ''));
            $contact = trim((string) ($account['contactNumber'] ?? ''));

            if ($firstName === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException('Required First Name and a valid email address.');
            }

            if ($role !== 'Student' && !in_array($status, ['Active', 'Disabled'], true)) {
                throw new InvalidArgumentException(
                    'LOA, Discontinued, Expulsion, and Graduate can only be used for student.'
                );
            }

            if ($role === 'Officer') {
                $role = 'APO';
            }

            $allowedRoles = ['Student', 'Teacher', 'APO', 'Provost', 'Admin'];

            if (!in_array($role, $allowedRoles, true)) {
                throw new InvalidArgumentException('Invalid Account Type.');
            }

            $academicStatuses = ['Active', 'LOA', 'Discontinued', 'Expulsion', 'Graduate'];

            if ($status === 'Disabled') {
                $accountStatus = 'Disabled';
                $academicStatus = null;
            } elseif (in_array($status, $academicStatuses, true)) {
                $accountStatus = 'Active';
                $academicStatus = $status;
            } else {
                throw new InvalidArgumentException('Invalid Account Status.');
            }

            $check = $pdo->prepare(
                "SELECT role FROM users WHERE user_id = ? FOR UPDATE"
            );
            $check->execute([$userId]);
            $existing = $check->fetch(PDO::FETCH_ASSOC);

            if ($action === 'create' && $existing) {
                throw new RuntimeException('Already Existed Account ID.');
            }

            if ($action === 'update' && !$existing) {
                throw new RuntimeException('Could not find the account to modify.');
            }

            if ($action === 'update' && $existing['role'] === 'Admin' && $role !== 'Admin') {
                throw new RuntimeException('Admin cannot be changed.');
            }

            if ($action === 'update' && $existing['role'] !== 'Admin' && $role === 'Admin') {
                throw new RuntimeException('An existing account cannot be changed to Admin.');
            }

            $createdDate = trim((string) ($account['createdDate'] ?? ''));

            if ($createdDate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $createdDate)) {
                throw new InvalidArgumentException('Invalid Created Date type.');
            }

            if ($createdDate === '') {
                $createdDate = date('Y-m-d');
            }

            if ($action === 'create') {
                $stmt = $pdo->prepare(
                    "INSERT INTO users (
                        user_id, email, first_name, middle_name, last_name, 
                        role, account_status, address, contact_number, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                );
                $stmt->execute([
                    $userId, $email, $firstName, $middleName, $lastName, $role,
                    $accountStatus, $address, $contact, $createdDate . ' 00:00:00'
                ]);
            } elseif ($action === 'update') {
                $stmt = $pdo->prepare(
                    "UPDATE users
                    SET email = ?, first_name = ?, middle_name = ?, last_name = ?, role = ?,
                        account_status = ?, address = ?, contact_number = ?, created_at = ?
                    WHERE user_id = ?"
                );
                $stmt->execute([
                    $email, $firstName, $middleName, $lastName, $role, $accountStatus, 
                    $address, $contact, $createdDate . ' 00:00:00', $userId
                ]);
            } else {
                throw new InvalidArgumentException('Unsupported save operation.');
            }

            if ($role === 'Student') {
                $studentCheck = $pdo->prepare(
                    "SELECT user_id FROM student WHERE user_id = ?"
                );
                $studentCheck->execute([$userId]);

                if (!$studentCheck->fetchColumn()) {
                    $stmt = $pdo->prepare(
                        "INSERT INTO student (user_id, academic_status) VALUES (?, ?)"
                    );
                    $stmt->execute([$userId, $academicStatus ?? 'Active']);
                } elseif ($academicStatus !== null) {
                    $stmt = $pdo->prepare(
                        "UPDATE student
                        SET academic_status = ?
                        WHERE user_id = ?"
                    );
                    $stmt->execute([$academicStatus, $userId]);
                }
            }

            if ($role === 'Student') {
                self::saveTimeline($pdo, $userId, $account['timelineEvents'] ?? [], $academicStatus ?? 'Active');
            }

            $pdo->commit();
            return $userId;
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    private static function saveTimeline(PDO $pdo, int $userId, array $events, string $defaultStatus): void {
        $allowedStatuses = ['Active', 'LOA', 'Discontinued', 'Expulsion', 'Graduate'];
        $existingStmt = $pdo->prepare(
            "SELECT history_id
            FROM student_status_history
            WHERE student_id = ?"
        );
        $existingStmt->execute([$userId]);
        $existingIds = array_map('intval', $existingStmt->fetchAll(PDO::FETCH_COLUMN));
        $keptIds = [];
        $updateStmt = $pdo->prepare(
            "UPDATE student_status_history
            SET start_date = ?, note = ?, status = ?
            WHERE history_id = ? AND student_id = ?"
        );
        $insertStmt = $pdo->prepare(
            "INSERT INTO student_status_history (student_id, status, start_date, note) VALUES (?, ?, ?, ?)"
        );

        foreach ($events as $event) {
            if (!is_array($event)) continue;

            $date = trim((string) ($event['date'] ?? ''));
            $note = trim((string) ($event['event'] ?? ''));

            if ($date === '' || $note === '') continue;

            $parsedDate = DateTime::createFromFormat('!Y-m-d', $date);

            if (!$parsedDate || $parsedDate->format('Y-m-d') !== $date) {
                throw new InvalidArgumentException('timeline date is incorrect.');
            }

            $eventId = filter_var($event['id'] ?? null, FILTER_VALIDATE_INT);

            $eventStatus = trim((string) ($event['status'] ?? ''));

            if (!in_array($eventStatus, $allowedStatuses, true)) {
                $eventStatus = $defaultStatus;
            }

            if (!in_array($eventStatus, $allowedStatuses, true)) {
                $eventStatus = 'Active';
            }

            if ($eventId && in_array($eventId, $existingIds, true)) {
                $updateStmt->execute([$date, $note, $eventStatus, $eventId, $userId]);
                $keptIds[] = $eventId;
            } else {
                $insertStmt->execute([$userId, $eventStatus, $date, $note]);
                $keptIds[] = (int) $pdo->lastInsertId();
            }
        }

        $deleteIds = array_diff($existingIds, $keptIds);

        if ($deleteIds) {
            $placeholders = implode(',', array_fill(0, count($deleteIds), '?'));
            $stmt = $pdo->prepare(
                "DELETE FROM student_status_history
                WHERE student_id = ?
                AND history_id IN ($placeholders)"
            );
            $stmt->execute([$userId, ...array_values($deleteIds)]);
        }
    }
}
