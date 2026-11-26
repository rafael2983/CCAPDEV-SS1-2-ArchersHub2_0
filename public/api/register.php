<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

require_once __DIR__ . "/../../backEnd/config/database.php";
require_once __DIR__ . "/../../backEnd/models/User.php";

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function readText(array $input, string $key): string
{
    $value = $input[$key] ?? "";

    return is_string($value) ? trim($value) : "";
}

try {

    $method = $_SERVER["REQUEST_METHOD"];

    if (!in_array($method, ["GET", "POST"], true)) {

        header("Allow: GET, POST");

        respond(405, [
            "success" => false,
            "message" => "Method not allowed."
        ]);
    }

    $pdo = getDatabaseConnection();

    $userModel = new User($pdo);


    // GET: RETRIEVE AVAILABLE PROGRAMS

    if ($method === "GET") {

        respond(200, [
            "success" => true,
            "programs" => $userModel->getPrograms()
        ]);
    }


    // POST: REGISTER STUDENT

    $contentType = strtolower(trim(
        explode(";", $_SERVER["CONTENT_TYPE"] ?? "")[0]
    ));

    if ($contentType !== "application/json") {

        respond(415, [
            "success" => false,
            "message" => "JSON content is required."
        ]);
    }

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {

        respond(400, [
            "success" => false,
            "message" => "Invalid request."
        ]);
    }


    // RETRIEVE SUBMITTED INFORMATION

    $schoolId = readText($input, "school_id");
    $firstName = readText($input, "first_name");
    $middleName = readText($input, "middle_name");
    $lastName = readText($input, "last_name");
    $email = strtolower(readText($input, "email"));

    $password = $input["password"] ?? "";
    $confirmPassword = $input["confirm_password"] ?? "";

    $programId = $input["program_id"] ?? null;


    // VALIDATE REQUIRED FIELDS

    if (
        $schoolId === "" ||
        $firstName === "" ||
        $lastName === "" ||
        $email === "" ||
        !is_string($password) ||
        !is_string($confirmPassword) ||
        $password === "" ||
        $confirmPassword === ""
    ) {

        respond(400, [
            "success" => false,
            "message" => "Please complete all required fields."
        ]);
    }


    // VALIDATE SCHOOL ID

    if (!preg_match('/\A[0-9]{8}\z/', $schoolId)) {

        respond(400, [
            "success" => false,
            "message" => "Student ID must contain exactly 8 digits."
        ]);
    }


    // VALIDATE NAME LENGTHS

    if (
        mb_strlen($firstName) > 100 ||
        mb_strlen($middleName) > 100 ||
        mb_strlen($lastName) > 100
    ) {

        respond(400, [
            "success" => false,
            "message" => "Names must not exceed 100 characters."
        ]);
    }


    // VALIDATE DLSU EMAIL

    if (
        strlen($email) > 255 ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        !str_ends_with($email, "@dlsu.edu.ph")
    ) {

        respond(400, [
            "success" => false,
            "message" => "Only valid @dlsu.edu.ph email addresses are accepted."
        ]);
    }


    // VALIDATE PASSWORD

    if (
        mb_strlen($password) < 8 ||
        strlen($password) > 72 ||
        str_contains($password, "\0")
    ) {

        respond(400, [
            "success" => false,
            "message" => "Password must contain at least 8 characters and must not exceed 72 bytes."
        ]);
    }

    if ($password !== $confirmPassword) {

        respond(400, [
            "success" => false,
            "message" => "Passwords do not match."
        ]);
    }


    // VALIDATE PROGRAM

    if (
        !is_int($programId) ||
        $programId < 1 ||
        !$userModel->programExists($programId)
    ) {

        respond(400, [
            "success" => false,
            "message" => "Please select a valid academic program."
        ]);
    }


    // REJECT PRIVILEGED REGISTRATION REQUESTS

    if (
        array_key_exists("role", $input) ||
        array_key_exists("status", $input)
    ) {

        respond(400, [
            "success" => false,
            "message" => "Account role and status cannot be specified during registration."
        ]);
    }


    // CREATE STUDENT ACCOUNT

    $userModel->registerStudent([
        "school_id" => $schoolId,
        "first_name" => $firstName,
        "middle_name" => $middleName !== ""
            ? $middleName
            : null,
        "last_name" => $lastName,
        "email" => $email,
        "password" => $password,
        "program_id" => $programId
    ]);

    respond(201, [
        "success" => true,
        "message" => "Registration successful! You may now log in."
    ]);

} catch (PDOException $error) {

    // MariaDB duplicate unique key error

    if ((int) ($error->errorInfo[1] ?? 0) === 1062) {

        respond(409, [
            "success" => false,
            "message" => "The student ID or email address is already registered."
        ]);
    }

    error_log($error->getMessage());

    respond(500, [
        "success" => false,
        "message" => "Unable to register account."
    ]);

} catch (Throwable $error) {

    error_log($error->getMessage());

    respond(500, [
        "success" => false,
        "message" => "An internal server error occurred."
    ]);
}
