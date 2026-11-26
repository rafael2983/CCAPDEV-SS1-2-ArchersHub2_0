<?php

/* =========================================
   ACCOUNT MANAGEMENT API
   GET  = List accounts
   POST = Create account
   PUT  = Update account
========================================= */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

require_once __DIR__ .
    "/../../backEnd/config/database.php";

require_once __DIR__ .
    "/../../backEnd/middleware/requireAdmin.php";

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];

if (!in_array($method, ["GET", "POST", "PUT"], true)) {
    header("Allow: GET, POST, PUT");

    respond(405, [
        "success" => false,
        "message" => "Method not allowed."
    ]);
}

requireAdmin();

try {

    $pdo = getDatabaseConnection();

    // Verify current database permissions.
    $check = $pdo->prepare(
        "SELECT user_id, role, status
         FROM users
         WHERE user_id = ?
         LIMIT 1"
    );

    $check->execute([$_SESSION["user_id"]]);
    $currentUser = $check->fetch(PDO::FETCH_ASSOC);

    if (
        !$currentUser ||
        $currentUser["role"] !== "admin" ||
        $currentUser["status"] !== "active"
    ) {
        respond(403, [
            "success" => false,
            "message" => "Admin access required."
        ]);
    }

    // =====================================
    // GET: LIST ACCOUNTS
    // =====================================

    if ($method === "GET") {

        $statement = $pdo->query(
            "SELECT school_id, first_name,
                    middle_name, last_name,
                    email, role, status
             FROM users
             ORDER BY last_name, first_name"
        );

        $accounts = [];

        foreach ($statement->fetchAll() as $user) {

            $accounts[] = [
                "id" => $user["school_id"],
                "surname" => $user["last_name"],
                "middleName" => $user["middle_name"] ?? "",
                "firstName" => $user["first_name"],
                "email" => $user["email"],
                "type" => ucfirst($user["role"]),
                "status" => ucfirst($user["status"])
            ];
        }

        respond(200, [
            "success" => true,
            "accounts" => $accounts
        ]);
    }

    // =====================================
    // SECURITY CHECKS FOR POST AND PUT
    // =====================================

    $origin = $_SERVER["HTTP_ORIGIN"] ?? "";

    if ($origin !== "") {

        $expectedOrigin =
            (!empty($_SERVER["HTTPS"]) &&
                $_SERVER["HTTPS"] !== "off"
                ? "https://"
                : "http://") .
            $_SERVER["HTTP_HOST"];

        if ($origin !== $expectedOrigin) {
            respond(403, [
                "success" => false,
                "message" => "Invalid request origin."
            ]);
        }
    }

    $csrfToken = $_SERVER["HTTP_X_CSRF_TOKEN"] ?? "";

    if (
        empty($_SESSION["csrf_token"]) ||
        !hash_equals($_SESSION["csrf_token"], $csrfToken)
    ) {
        respond(403, [
            "success" => false,
            "message" => "Invalid CSRF token. Refresh and try again."
        ]);
    }

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        respond(400, [
            "success" => false,
            "message" => "Invalid JSON request."
        ]);
    }

    $fields = [
        "id",
        "surname",
        "middleName",
        "firstName",
        "email",
        "type",
        "status"
    ];

    foreach ($fields as $field) {

        if (
            !isset($input[$field]) ||
            !is_string($input[$field])
        ) {
            respond(400, [
                "success" => false,
                "message" => "Invalid field: " . $field
            ]);
        }
    }

    $schoolId = trim($input["id"]);
    $surname = trim($input["surname"]);
    $middleName = trim($input["middleName"]);
    $firstName = trim($input["firstName"]);
    $email = trim($input["email"]);
    $role = strtolower(trim($input["type"]));
    $status = strtolower(trim($input["status"]));

    if (!preg_match('/^[A-Za-z0-9]{8}$/', $schoolId)) {
        respond(422, [
            "success" => false,
            "message" => "School ID must contain exactly 8 letters or numbers."
        ]);
    }

    if (
        $firstName === "" ||
        $surname === "" ||
        mb_strlen($firstName) > 100 ||
        mb_strlen($surname) > 100 ||
        mb_strlen($middleName) > 100
    ) {
        respond(422, [
            "success" => false,
            "message" => "Please enter valid account names."
        ]);
    }

    if (
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        strlen($email) > 255
    ) {
        respond(422, [
            "success" => false,
            "message" => "Please enter a valid email address."
        ]);
    }

    if (!in_array($role, ["student", "faculty", "admin"], true)) {
        respond(422, [
            "success" => false,
            "message" => "Invalid account type."
        ]);
    }

    if (!in_array($status, ["active", "inactive"], true)) {
        respond(422, [
            "success" => false,
            "message" => "Invalid account status."
        ]);
    }

    // =====================================
    // POST: CREATE ACCOUNT
    // =====================================

    if ($method === "POST") {

        $password = $input["password"] ?? null;

        if (
            !is_string($password) ||
            strlen($password) < 12 ||
            strlen($password) > 128
        ) {
            respond(422, [
                "success" => false,
                "message" => "Password must contain 12 to 128 characters."
            ]);
        }

        $duplicateCheck = $pdo->prepare(
            "SELECT school_id
             FROM users
             WHERE school_id = ? OR email = ?
             LIMIT 1"
        );

        $duplicateCheck->execute([$schoolId, $email]);

        if ($duplicateCheck->fetch()) {
            respond(409, [
                "success" => false,
                "message" => "Account ID or email already exists."
            ]);
        }

        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $insert = $pdo->prepare(
            "INSERT INTO users
                (school_id, first_name, middle_name,
                 last_name, email, password_hash,
                 role, status, program_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)"
        );

        $insert->execute([
            $schoolId,
            $firstName,
            $middleName === "" ? null : $middleName,
            $surname,
            $email,
            $passwordHash,
            $role,
            $status
        ]);

        respond(201, [
            "success" => true,
            "message" => "Account created successfully!"
        ]);
    }

    // =====================================
    // PUT: UPDATE EXISTING ACCOUNT
    // =====================================

    $originalID = $input["originalID"] ?? null;

    if (
        !is_string($originalID) ||
        $originalID === ""
    ) {
        respond(400, [
            "success" => false,
            "message" => "Original account ID is required."
        ]);
    }

    // Serialize administrative updates to protect
    // against simultaneous role/status changes.
    $pdo->beginTransaction();

    // Lock the current Admin record first.
    $adminCheck = $pdo->prepare(
        "SELECT user_id, role, status
         FROM users
         WHERE user_id = ?
         FOR UPDATE"
    );

    $adminCheck->execute([$_SESSION["user_id"]]);
    $activeAdmin = $adminCheck->fetch(PDO::FETCH_ASSOC);

    if (
        !$activeAdmin ||
        $activeAdmin["role"] !== "admin" ||
        $activeAdmin["status"] !== "active"
    ) {
        $pdo->rollBack();

        respond(403, [
            "success" => false,
            "message" => "Admin access required."
        ]);
    }

    // Lock all active Admin records in a consistent
    // order before changing role or status.
    $adminLocks = $pdo->query(
        "SELECT user_id
         FROM users
         WHERE role = 'admin'
           AND status = 'active'
         ORDER BY user_id
         FOR UPDATE"
    )->fetchAll(PDO::FETCH_COLUMN);

    $find = $pdo->prepare(
        "SELECT user_id, school_id, role, status
         FROM users
         WHERE school_id = ?
         FOR UPDATE"
    );

    $find->execute([$originalID]);
    $existing = $find->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        $pdo->rollBack();

        respond(404, [
            "success" => false,
            "message" => "Account not found."
        ]);
    }

    $isSelf = (int) $existing["user_id"] ===
        (int) $_SESSION["user_id"];

    if (
        $isSelf &&
        ($role !== "admin" || $status !== "active")
    ) {
        $pdo->rollBack();

        respond(403, [
            "success" => false,
            "message" => "You cannot deactivate or demote your own Admin account."
        ]);
    }

    $removingActiveAdmin =
        $existing["role"] === "admin" &&
        $existing["status"] === "active" &&
        ($role !== "admin" || $status !== "active");

    if (
        $removingActiveAdmin &&
        count($adminLocks) <= 1
    ) {
        $pdo->rollBack();

        respond(409, [
            "success" => false,
            "message" => "At least one active Admin account must remain."
        ]);
    }

    $duplicateCheck = $pdo->prepare(
        "SELECT user_id
         FROM users
         WHERE (school_id = ? OR email = ?)
           AND user_id <> ?
         LIMIT 1"
    );

    $duplicateCheck->execute([
        $schoolId,
        $email,
        $existing["user_id"]
    ]);

    if ($duplicateCheck->fetch()) {
        $pdo->rollBack();

        respond(409, [
            "success" => false,
            "message" => "Another account already uses that ID or email."
        ]);
    }

    $update = $pdo->prepare(
        "UPDATE users
         SET school_id = ?,
             first_name = ?,
             middle_name = ?,
             last_name = ?,
             email = ?,
             role = ?,
             status = ?
         WHERE user_id = ?"
    );

    $update->execute([
        $schoolId,
        $firstName,
        $middleName === "" ? null : $middleName,
        $surname,
        $email,
        $role,
        $status,
        $existing["user_id"]
    ]);

    $pdo->commit();

    respond(200, [
        "success" => true,
        "message" => "Account updated successfully!"
    ]);

} catch (PDOException $error) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log($error->getMessage());

    if ($error->getCode() === "23000") {
        respond(409, [
            "success" => false,
            "message" => "Account ID or email already exists, or a database constraint was not satisfied."
        ]);
    }

    respond(500, [
        "success" => false,
        "message" => "Database error while processing accounts."
    ]);

} catch (Throwable $error) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log($error->getMessage());

    respond(500, [
        "success" => false,
        "message" => "Unable to process account request."
    ]);
}
