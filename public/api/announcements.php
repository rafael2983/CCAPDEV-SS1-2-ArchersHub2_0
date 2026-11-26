<?php

/* =========================================
   ANNOUNCEMENTS API
   GET  = Retrieve announcements
   POST = Save draft or publish
========================================= */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

require_once __DIR__ .
    "/../../backEnd/config/database.php";

function sendResponse(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];


if (!in_array($method, ["GET", "POST", "PUT", "DELETE"], true)) {
    header("Allow: GET, POST, PUT, DELETE");


    sendResponse(405, [
        "success" => false,
        "message" => "Method not allowed."
    ]);
}

session_start();

if (!isset($_SESSION["user_id"])) {
    sendResponse(401, [
        "success" => false,
        "message" => "Please log in first."
    ]);
}

try {

    $pdo = getDatabaseConnection();

    // Verify the authenticated user against MariaDB.
    $statement = $pdo->prepare(
        "SELECT user_id, role, status
         FROM users
         WHERE user_id = ?
         LIMIT 1"
    );

    $statement->execute([$_SESSION["user_id"]]);

    $currentUser = $statement->fetch();

    if (
        !$currentUser ||
        $currentUser["status"] !== "active"
    ) {
        sendResponse(403, [
            "success" => false,
            "message" => "Account is not active."
        ]);
    }

    // =====================================
    // GET: PUBLISHED ANNOUNCEMENTS
    // =====================================

    if ($method === "GET") {


        // =====================================
// ADMIN: GET ALL ANNOUNCEMENTS
// =====================================

        if (isset($_GET["scope"]) && $_GET["scope"] === "manage") {

            if ($currentUser["role"] !== "admin") {
                sendResponse(403, [
                    "success" => false,
                    "message" => "Admin access required."
                ]);
            }

            $statement = $pdo->query(
                "SELECT announcement_id,
                title,
                contents,
                is_important,
                start_date,
                end_date,
                status,
                created_by,
                created_at,
                updated_at
         FROM announcements
         ORDER BY created_at DESC,
                  announcement_id DESC"
            );

            sendResponse(200, [
                "success" => true,
                "announcements" => $statement->fetchAll()
            ]);
        }


        $statement = $pdo->query(
            "SELECT announcement_id,
                    title,
                    contents,
                    is_important,
                    start_date,
                    end_date,
                    created_at
             FROM announcements
             WHERE status = 'published'
               AND start_date <= CURRENT_DATE()
               AND end_date >= CURRENT_DATE()
             ORDER BY is_important DESC,
                      created_at DESC,
                      announcement_id DESC"
        );

        sendResponse(200, [
            "success" => true,
            "announcements" => $statement->fetchAll()
        ]);
    }

    // =====================================
    // POST: ADMIN ONLY
    // =====================================

    if ($currentUser["role"] !== "admin") {
        sendResponse(403, [
            "success" => false,
            "message" => "Admin access required."
        ]);
    }

    // Check request origin when supplied.
    $origin = $_SERVER["HTTP_ORIGIN"] ?? "";

    if ($origin !== "") {

        $expectedOrigin =
            (!empty($_SERVER["HTTPS"]) &&
                $_SERVER["HTTPS"] !== "off"
                ? "https://"
                : "http://") .
            $_SERVER["HTTP_HOST"];

        if ($origin !== $expectedOrigin) {
            sendResponse(403, [
                "success" => false,
                "message" => "Invalid request origin."
            ]);
        }
    }

    // CSRF protection.
    $csrfToken = $_SERVER["HTTP_X_CSRF_TOKEN"] ?? "";

    if (
        empty($_SESSION["csrf_token"]) ||
        !hash_equals($_SESSION["csrf_token"], $csrfToken)
    ) {
        sendResponse(403, [
            "success" => false,
            "message" => "Invalid CSRF token."
        ]);
    }


    // =====================================
// DELETE: REMOVE AN ANNOUNCEMENT
// =====================================

    if ($method === "DELETE") {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (
            !is_array($data) ||
            !isset($data["announcement_id"]) ||
            filter_var(
                $data["announcement_id"],
                FILTER_VALIDATE_INT,
                ["options" => ["min_range" => 1]]
            ) === false
        ) {
            sendResponse(422, [
                "success" => false,
                "message" => "Valid announcement ID required."
            ]);
        }

        $announcementId = (int) $data["announcement_id"];

        $delete = $pdo->prepare(
            "DELETE FROM announcements
         WHERE announcement_id = ?"
        );

        $delete->execute([$announcementId]);

        if ($delete->rowCount() === 0) {
            sendResponse(404, [
                "success" => false,
                "message" => "Announcement not found."
            ]);
        }

        sendResponse(200, [
            "success" => true,
            "message" => "Announcement deleted successfully!"
        ]);
    }


    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($data)) {
        sendResponse(400, [
            "success" => false,
            "message" => "Invalid JSON request."
        ]);
    }

    // Validate field types before using them.
    foreach (
        [
            "title",
            "contents",
            "startDate",
            "endDate",
            "status"
        ] as $field
    ) {
        if (
            !isset($data[$field]) ||
            !is_string($data[$field])
        ) {
            sendResponse(422, [
                "success" => false,
                "message" => "Invalid field: " . $field
            ]);
        }
    }

    if (
        !isset($data["important"]) ||
        !is_bool($data["important"])
    ) {
        sendResponse(422, [
            "success" => false,
            "message" => "Invalid important flag."
        ]);
    }

    $title = trim($data["title"]);
    $contents = trim($data["contents"]);
    $startDate = $data["startDate"];
    $endDate = $data["endDate"];
    $status = strtolower($data["status"]);
    $important = $data["important"] ? 1 : 0;

    if (
        $title === "" ||
        mb_strlen($title) > 150
    ) {
        sendResponse(422, [
            "success" => false,
            "message" => "Title must contain 1 to 150 characters."
        ]);
    }

    if (!in_array($status, ["draft", "published"], true)) {
        sendResponse(422, [
            "success" => false,
            "message" => "Invalid announcement status."
        ]);
    }

    if ($status === "published" && $contents === "") {
        sendResponse(422, [
            "success" => false,
            "message" => "Published announcements require contents."
        ]);
    }

    // Validate actual calendar dates.
    $validDate = function (string $value): bool {

        if ($value === "")
            return true;

        $date = DateTimeImmutable::createFromFormat(
            "!Y-m-d",
            $value
        );

        return $date !== false &&
            $date->format("Y-m-d") === $value;
    };

    if (
        !$validDate($startDate) ||
        !$validDate($endDate)
    ) {
        sendResponse(422, [
            "success" => false,
            "message" => "Invalid announcement dates."
        ]);
    }

    if (
        $status === "published" &&
        ($startDate === "" || $endDate === "")
    ) {
        sendResponse(422, [
            "success" => false,
            "message" => "Published announcements require both dates."
        ]);
    }

    if (
        $startDate !== "" &&
        $endDate !== "" &&
        $endDate < $startDate
    ) {
        sendResponse(422, [
            "success" => false,
            "message" => "End date cannot precede start date."
        ]);
    }

    // Attachments are intentionally not accepted yet.
    if (!empty($data["attachments"])) {
        sendResponse(422, [
            "success" => false,
            "message" => "File attachments are not supported yet."
        ]);
    }


    // =====================================
// PUT: UPDATE EXISTING ANNOUNCEMENT
// =====================================

    if ($method === "PUT") {

        if (
            !isset($data["announcement_id"]) ||
            filter_var(
                $data["announcement_id"],
                FILTER_VALIDATE_INT,
                ["options" => ["min_range" => 1]]
            ) === false
        ) {
            sendResponse(422, [
                "success" => false,
                "message" => "Valid announcement ID required."
            ]);
        }

        $announcementId = (int) $data["announcement_id"];

        // Confirm the announcement exists.
        $check = $pdo->prepare(
            "SELECT announcement_id
         FROM announcements
         WHERE announcement_id = ?
         LIMIT 1"
        );

        $check->execute([$announcementId]);

        if (!$check->fetch()) {
            sendResponse(404, [
                "success" => false,
                "message" => "Announcement not found."
            ]);
        }

        $update = $pdo->prepare(
            "UPDATE announcements
         SET title = ?,
             contents = ?,
             is_important = ?,
             start_date = ?,
             end_date = ?,
             status = ?
         WHERE announcement_id = ?"
        );

        $update->execute([
            $title,
            $contents === "" ? null : $contents,
            $important,
            $startDate === "" ? null : $startDate,
            $endDate === "" ? null : $endDate,
            $status,
            $announcementId
        ]);

        sendResponse(200, [
            "success" => true,
            "message" => "Announcement updated successfully!"
        ]);
    }


    $insert = $pdo->prepare(
        "INSERT INTO announcements
            (title, contents, is_important,
             start_date, end_date, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    $insert->execute([
        $title,
        $contents === "" ? null : $contents,
        $important,
        $startDate === "" ? null : $startDate,
        $endDate === "" ? null : $endDate,
        $status,
        $currentUser["user_id"]
    ]);

    sendResponse(201, [
        "success" => true,
        "announcement_id" => $pdo->lastInsertId(),
        "message" => $status === "published"
            ? "Announcement published successfully!"
            : "Announcement saved as draft!"
    ]);

} catch (Throwable $error) {

    error_log($error->getMessage());

    sendResponse(500, [
        "success" => false,
        "message" => "Unable to process announcement."
    ]);
}
