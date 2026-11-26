<?php

/* =========================================
   ARCHERSHUB DATABASE CONNECTION TEST
   DEVELOPMENT ONLY
========================================= */

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../../backEnd/config/database.php";

try {

    $pdo = getDatabaseConnection();

    // Count the number of test accounts
    $statement = $pdo->query(
        "SELECT COUNT(*) FROM users"
    );

    $totalUsers = (int) $statement->fetchColumn();

    echo json_encode([
        "success" => true,
        "message" => "Database connection successful!",
        "database" => "archershub_db",
        "total_users" => $totalUsers
    ]);

} catch (PDOException $error) {

    http_response_code(500);

    error_log($error->getMessage());

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

}
