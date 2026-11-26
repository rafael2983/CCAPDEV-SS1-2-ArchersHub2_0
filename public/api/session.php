<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    header("Allow: GET");
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);
    exit;
}

session_start();

if (!isset($_SESSION["user_id"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Not authenticated."
    ]);

    exit;
}

require_once __DIR__ . "/../../backEnd/config/database.php";

try {

    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare(
        "SELECT user_id, school_id, first_name,
                last_name, email, role, status
         FROM users
         WHERE user_id = ?
         LIMIT 1"
    );

    $statement->execute([
        $_SESSION["user_id"]
    ]);

    $user = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user["status"] !== "active") {

        $_SESSION = [];
        session_destroy();

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Session is no longer valid."
        ]);

        exit;
    }


    // Generate a CSRF token for this session
    if (empty($_SESSION["csrf_token"])) {
        $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
    }

    // Return authenticated user information
    // together with the CSRF token
    echo json_encode([
        "success" => true,
        "csrf_token" => $_SESSION["csrf_token"],
        "user" => [
            "school_id" => $user["school_id"],
            "name" => $user["first_name"] . " " .
                $user["last_name"],
            "email" => $user["email"],
            "role" => $user["role"]
        ]
    ]);


} catch (Throwable $error) {

    error_log($error->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to verify session."
    ]);
}
