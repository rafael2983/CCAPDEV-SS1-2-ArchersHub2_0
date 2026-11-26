<?php

// DEVELOPMENT ONLY.
// Run once locally, then delete this script.
// Never expose it on a public server.

$pdo = new PDO(
    "mysql:host=127.0.0.1;dbname=archershub_db;charset=utf8mb4",
    "root",
    ""
);

$pdo->setAttribute(
    PDO::ATTR_ERRMODE,
    PDO::ERRMODE_EXCEPTION
);

$accounts = [
    [
        "12345678",
        "Juan",
        "Dela Cruz",
        "juan.demo@example.test",
        "student",
        "BSIT"
    ],
    [
        "FAC10001",
        "Maria",
        "Santos",
        "maria.demo@example.test",
        "faculty",
        null
    ],
    [
        "ADM10001",
        "Alex",
        "Reyes",
        "alex.demo@example.test",
        "admin",
        null
    ]
];

$password = "ArchersDemo2026!";

foreach ($accounts as $account) {

    [
        $schoolId,
        $firstName,
        $lastName,
        $email,
        $role,
        $programCode
    ] = $account;

    $programId = null;

    if ($programCode !== null) {

        $programQuery = $pdo->prepare(
            "SELECT program_id
             FROM programs
             WHERE program_code = ?"
        );

        $programQuery->execute([$programCode]);

        $programId = $programQuery->fetchColumn() ?: null;
    }

    $check = $pdo->prepare(
        "SELECT user_id FROM users WHERE school_id = ?"
    );

    $check->execute([$schoolId]);

    if ($check->fetch()) {
        continue;
    }

    $statement = $pdo->prepare(
        "INSERT INTO users
        (school_id, first_name, last_name,
         email, password_hash, role, program_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    $statement->execute([
        $schoolId,
        $firstName,
        $lastName,
        $email,
        password_hash($password, PASSWORD_DEFAULT),
        $role,
        $programId
    ]);

}

echo "Demo accounts created successfully.";
