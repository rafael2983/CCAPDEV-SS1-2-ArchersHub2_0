<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);
    exit;
}

require_once __DIR__ . "/../../backEnd/config/database.php";
require_once __DIR__ . "/../../backEnd/models/User.php";

session_start();

try {
    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid request."
        ]);
        exit;
    }

    $schoolId = trim((string) ($input["school_id"] ?? ""));
    $password = $input["password"] ?? "";

    if (
        $schoolId === "" ||
        !is_string($password) ||
        $password === ""
    ) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "School ID and password are required."
        ]);
        exit;
    }

    $pdo = getDatabaseConnection();

    $userModel = new User($pdo);

    $user = $userModel->findBySchoolId($schoolId);

    if (
        !$user ||
        $user["status"] !== "active" ||
        !password_verify($password, $user["password_hash"])
    ) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid credentials."
        ]);
        exit;
    }

    // Prevent session fixation.
    session_regenerate_id(true);

    $_SESSION["user_id"] = (int) $user["user_id"];
    $_SESSION["role"] = $user["role"];

    echo json_encode([
        "success" => true,
        "message" => "Login successful.",
        "user" => [
            "school_id" => $user["school_id"],
            "name" => $user["first_name"] . " " .
                $user["last_name"],
            "role" => $user["role"]
        ]
    ]);

} catch (Throwable $error) {

    error_log($error->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "An internal server error occurred."
    ]);
}
