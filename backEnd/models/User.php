<?php

class User
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // EXISTING LOGIN METHOD

    public function findBySchoolId(string $schoolId): array|false
    {
        $stmt = $this->pdo->prepare(
            "SELECT user_id, school_id, first_name,
                    last_name, email, password_hash,
                    role, status
             FROM users
             WHERE school_id = ?
             LIMIT 1"
        );

        $stmt->execute([$schoolId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // RETRIEVE AVAILABLE PROGRAMS

    public function getPrograms(): array
    {
        $stmt = $this->pdo->query(
            "SELECT program_id, program_code, program_name
             FROM programs
             ORDER BY program_code ASC"
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // CHECK WHETHER A PROGRAM EXISTS

    public function programExists(int $programId): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT program_id
             FROM programs
             WHERE program_id = ?
             LIMIT 1"
        );

        $stmt->execute([$programId]);

        return $stmt->fetchColumn() !== false;
    }


    // REGISTER A STUDENT ACCOUNT

    public function registerStudent(array $student): int
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (
                school_id,
                first_name,
                middle_name,
                last_name,
                email,
                password_hash,
                role,
                status,
                program_id
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                'student',
                'active',
                ?
            )"
        );

        $stmt->execute([
            $student["school_id"],
            $student["first_name"],
            $student["middle_name"],
            $student["last_name"],
            $student["email"],
            password_hash(
                $student["password"],
                PASSWORD_DEFAULT
            ),
            $student["program_id"]
        ]);

        return (int) $this->pdo->lastInsertId();
    }
}