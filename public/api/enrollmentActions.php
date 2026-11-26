<?php

/* =========================================
   ARCHERSHUB ENROLLMENT ACTIONS API

   MILESTONE 7B-C:
   POST = Add or Drop a class

   Existing enrollment.php remains read-only.
========================================= */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

require_once __DIR__ .
    "/../../backEnd/config/database.php";


function sendActionResponse(
    int $status,
    array $data
): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// =========================================
// PROTECT ENROLLMENTS WITH EXISTING GRADES
// MILESTONE 8E-A
// =========================================

function ensureEnrollmentHasNoGrade(
    PDO $pdo,
    int $studentId,
    int $sectionId
): void {

    // Lock the existing enrollment record.
    $enrollmentStatement = $pdo->prepare(
        "SELECT enrollment_id
         FROM enrollments
         WHERE student_id = ?
           AND section_id = ?
         FOR UPDATE"
    );

    $enrollmentStatement->execute([
        $studentId,
        $sectionId
    ]);

    $enrollmentId =
        $enrollmentStatement->fetchColumn();

    // No existing enrollment means no grade.
    if ($enrollmentId === false) {
        return;
    }

    // Check for an associated grade record.
    $gradeStatement = $pdo->prepare(
        "SELECT grade_id, status
         FROM grades
         WHERE enrollment_id = ?
         FOR UPDATE"
    );

    $gradeStatement->execute([
        $enrollmentId
    ]);

    $grade = $gradeStatement->fetch();

    if (!$grade) {
        return;
    }

    $gradeStatus = $grade["status"];

    $pdo->rollBack();

    sendActionResponse(409, [
        "success" => false,
        "message" =>
            "Enrollment changes are not allowed " .
            "because this class has an existing " .
            $gradeStatus . " grade.",
        "grade_status" => $gradeStatus
    ]);
}


// =========================================
// ALLOW POST REQUESTS ONLY
// =========================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");

    sendActionResponse(405, [
        "success" => false,
        "message" => "Method not allowed."
    ]);
}


// =========================================
// VERIFY LOGIN
// =========================================

session_start();

if (!isset($_SESSION["user_id"])) {
    sendActionResponse(401, [
        "success" => false,
        "message" => "Please log in first."
    ]);
}


// =========================================
// VERIFY CSRF TOKEN
// =========================================

$csrfToken =
    $_SERVER["HTTP_X_CSRF_TOKEN"] ?? "";

if (
    empty($_SESSION["csrf_token"]) ||
    !is_string($csrfToken) ||
    !hash_equals(
        $_SESSION["csrf_token"],
        $csrfToken
    )
) {
    sendActionResponse(403, [
        "success" => false,
        "message" => "Invalid CSRF token."
    ]);
}


// =========================================
// READ JSON REQUEST
// =========================================

$rawInput = file_get_contents("php://input");

$data = json_decode($rawInput, true);

if (
    !is_array($data) ||
    json_last_error() !== JSON_ERROR_NONE
) {
    sendActionResponse(400, [
        "success" => false,
        "message" => "Invalid JSON request."
    ]);
}

$action = $data["action"] ?? null;
$sectionId = $data["section_id"] ?? null;

if (!in_array($action, ["add", "drop", "change"], true)) {
    sendActionResponse(400, [
        "success" => false,
        "message" => "Unsupported enrollment action."
    ]);
}

if (
    filter_var(
        $sectionId,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1]]
    ) === false
) {
    sendActionResponse(400, [
        "success" => false,
        "message" => "A valid section_id is required."
    ]);
}

$sectionId = (int) $sectionId;


try {

    $pdo = getDatabaseConnection();

    // =====================================
    // VERIFY ACTIVE STUDENT
    // =====================================

    $userStatement = $pdo->prepare(
        "SELECT user_id, role, status
         FROM users
         WHERE user_id = ?
         LIMIT 1"
    );

    $userStatement->execute([
        $_SESSION["user_id"]
    ]);

    $user = $userStatement->fetch();

    if (!$user || $user["status"] !== "active") {
        sendActionResponse(403, [
            "success" => false,
            "message" => "Account is not active."
        ]);
    }

    if ($user["role"] !== "student") {
        sendActionResponse(403, [
            "success" => false,
            "message" => "Student access required."
        ]);
    }

    $studentId = (int) $user["user_id"];


    // =====================================
    // DROP ENROLLMENT
    // =====================================

    if ($action === "drop") {

        $pdo->beginTransaction();

        // Lock the student row to serialize
        // enrollment changes for this student.
        $studentLock = $pdo->prepare(
            "SELECT user_id
             FROM users
             WHERE user_id = ?
             FOR UPDATE"
        );

        $studentLock->execute([$studentId]);
        $studentLock->fetch();


        // =================================
        // FIND AND LOCK ENROLLMENT
        // =================================

        $dropStatement = $pdo->prepare(
            "SELECT
                e.enrollment_id,
                e.status AS enrollment_status,

                s.section_id,
                s.term_id,

                c.course_code,

                t.is_active AS term_active,
                t.enrollment_start,
                t.enrollment_end

             FROM enrollments e

             INNER JOIN sections s
                ON s.section_id = e.section_id

             INNER JOIN courses c
                ON c.course_id = s.course_id

             INNER JOIN academic_terms t
                ON t.term_id = s.term_id

             WHERE e.student_id = ?
               AND e.section_id = ?

             FOR UPDATE"
        );

        $dropStatement->execute([
            $studentId,
            $sectionId
        ]);

        $enrollment = $dropStatement->fetch();

        if (
            !$enrollment ||
            $enrollment["enrollment_status"] !== "enrolled"
        ) {

            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "You are not currently enrolled in this class."
            ]);
        }


        // =================================
        // VERIFY ACTIVE TERM
        // =================================

        if ((int) $enrollment["term_active"] !== 1) {

            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "Enrollment changes are not allowed for this term."
            ]);
        }


        // =================================
        // VERIFY ENROLLMENT WINDOW
        // =================================

        $dateStatement = $pdo->query(
            "SELECT CURRENT_DATE() AS today"
        );

        $today = $dateStatement->fetch()["today"];

        if (
            $enrollment["enrollment_start"] !== null &&
            $today < $enrollment["enrollment_start"]
        ) {

            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "The enrollment period has not opened yet."
            ]);
        }

        if (
            $enrollment["enrollment_end"] !== null &&
            $today > $enrollment["enrollment_end"]
        ) {

            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "The enrollment period has ended."
            ]);
        }

        // Protect existing academic grades.
        ensureEnrollmentHasNoGrade(
            $pdo,
            $studentId,
            $sectionId
        );

        // =================================
        // UPDATE ENROLLMENT STATUS
        // =================================

        $updateStatement = $pdo->prepare(
            "UPDATE enrollments
             SET
                status = 'dropped',
                dropped_at = CURRENT_TIMESTAMP
             WHERE enrollment_id = ?
               AND student_id = ?
               AND status = 'enrolled'"
        );

        $updateStatement->execute([
            $enrollment["enrollment_id"],
            $studentId
        ]);

        if ($updateStatement->rowCount() !== 1) {
            throw new RuntimeException(
                "Enrollment update failed."
            );
        }

        $pdo->commit();


        // =================================
        // SUCCESS RESPONSE
        // =================================

        sendActionResponse(200, [
            "success" => true,
            "message" =>
                "Successfully dropped " .
                $enrollment["course_code"] . ".",
            "section_id" => $sectionId
        ]);
    }


    // =====================================
    // CHANGE CLASS SECTION
    // =====================================

    if ($action === "change") {

        $sourceSectionId = filter_var(
            $data["source_section_id"] ?? null,
            FILTER_VALIDATE_INT,
            ["options" => ["min_range" => 1]]
        );

        if ($sourceSectionId === false) {
            sendActionResponse(400, [
                "success" => false,
                "message" => "A valid source_section_id is required."
            ]);
        }

        $sourceSectionId = (int) $sourceSectionId;

        if ($sourceSectionId === $sectionId) {
            sendActionResponse(400, [
                "success" => false,
                "message" => "Choose a different section."
            ]);
        }

        $pdo->beginTransaction();

        // Serialize enrollment changes for this student.
        $studentLock = $pdo->prepare(
            "SELECT user_id
             FROM users
             WHERE user_id = ?
             FOR UPDATE"
        );

        $studentLock->execute([$studentId]);
        $studentLock->fetch();


        // =================================
        // LOCK DESTINATION SECTION
        // =================================

        $targetStatement = $pdo->prepare(
            "SELECT
                s.section_id,
                s.course_id,
                s.term_id,
                s.capacity,
                s.status AS section_status,
                c.course_code,
                c.is_active AS course_active,
                t.is_active AS term_active,
                t.enrollment_start,
                t.enrollment_end

             FROM sections s
             INNER JOIN courses c
                ON c.course_id = s.course_id
             INNER JOIN academic_terms t
                ON t.term_id = s.term_id

             WHERE s.section_id = ?
             FOR UPDATE"
        );

        $targetStatement->execute([$sectionId]);
        $target = $targetStatement->fetch();

        if (!$target) {
            $pdo->rollBack();

            sendActionResponse(404, [
                "success" => false,
                "message" => "Destination section not found."
            ]);
        }


        // =================================
        // VERIFY CURRENT ENROLLMENT
        // =================================

        $sourceStatement = $pdo->prepare(
            "SELECT
                e.enrollment_id,
                e.status AS enrollment_status,
                s.course_id,
                s.term_id

             FROM enrollments e
             INNER JOIN sections s
                ON s.section_id = e.section_id

             WHERE e.student_id = ?
               AND e.section_id = ?

             FOR UPDATE"
        );

        $sourceStatement->execute([
            $studentId,
            $sourceSectionId
        ]);

        $source = $sourceStatement->fetch();

        if (
            !$source ||
            $source["enrollment_status"] !== "enrolled"
        ) {
            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "You are not enrolled in the original section."
            ]);
        }


        // =================================
        // VERIFY SAME COURSE AND TERM
        // =================================

        if (
            (int) $source["course_id"] !==
            (int) $target["course_id"] ||
            (int) $source["term_id"] !==
            (int) $target["term_id"]
        ) {
            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "Section changes must be within the same course and term."
            ]);
        }


        // =================================
        // VERIFY DESTINATION IS OPEN
        // =================================

        if (
            $target["section_status"] !== "open" ||
            (int) $target["course_active"] !== 1 ||
            (int) $target["term_active"] !== 1
        ) {
            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "The destination section is not available."
            ]);
        }


        // =================================
        // VERIFY ENROLLMENT WINDOW
        // =================================

        $today = $pdo->query(
            "SELECT CURRENT_DATE()"
        )->fetchColumn();

        if (
            $target["enrollment_start"] !== null &&
            $today < $target["enrollment_start"]
        ) {
            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "The enrollment period has not opened."
            ]);
        }

        if (
            $target["enrollment_end"] !== null &&
            $today > $target["enrollment_end"]
        ) {
            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "The enrollment period has ended."
            ]);
        }


        // =================================
        // CHECK DESTINATION ENROLLMENT
        // =================================

        $existingStatement = $pdo->prepare(
            "SELECT enrollment_id
             FROM enrollments
             WHERE student_id = ?
               AND section_id = ?
               AND status = 'enrolled'
             LIMIT 1"
        );

        $existingStatement->execute([
            $studentId,
            $sectionId
        ]);

        if ($existingStatement->fetch()) {
            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "You are already enrolled in the destination section."
            ]);
        }


        // =================================
        // CHECK DESTINATION CAPACITY
        // =================================

        $capacityStatement = $pdo->prepare(
            "SELECT COUNT(*)
             FROM enrollments
             WHERE section_id = ?
               AND status = 'enrolled'"
        );

        $capacityStatement->execute([$sectionId]);

        $enrolledCount =
            (int) $capacityStatement->fetchColumn();

        if (
            $enrolledCount >=
            (int) $target["capacity"]
        ) {
            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "The destination section is full."
            ]);
        }


        // =================================
        // CHECK SCHEDULE CONFLICTS
        // =================================

        // Exclude the original section because
        // the student is transferring out of it.

        $conflictStatement = $pdo->prepare(
            "SELECT
                c.course_code,
                ss.day_of_week

             FROM section_schedules target_schedule

             INNER JOIN section_schedules ss
                ON ss.day_of_week =
                    target_schedule.day_of_week

             INNER JOIN enrollments e
                ON e.section_id = ss.section_id
               AND e.student_id = ?
               AND e.status = 'enrolled'

             INNER JOIN sections existing_section
                ON existing_section.section_id =
                    e.section_id
               AND existing_section.term_id = ?

             INNER JOIN courses c
                ON c.course_id =
                    existing_section.course_id

             WHERE target_schedule.section_id = ?

               AND e.section_id <> ?

               AND target_schedule.start_time <
                   ss.end_time

               AND target_schedule.end_time >
                   ss.start_time

             LIMIT 1"
        );

        $conflictStatement->execute([
            $studentId,
            $target["term_id"],
            $sectionId,
            $sourceSectionId
        ]);

        $conflict = $conflictStatement->fetch();

        if ($conflict) {
            $pdo->rollBack();

            sendActionResponse(409, [
                "success" => false,
                "message" =>
                    "Schedule conflict with " .
                    $conflict["course_code"] .
                    " on " .
                    $conflict["day_of_week"] . "."
            ]);
        }


        // Protect grades in the original section.
        ensureEnrollmentHasNoGrade(
            $pdo,
            $studentId,
            $sourceSectionId
        );

        // Prevent reactivating a destination
// enrollment with an existing grade.
        ensureEnrollmentHasNoGrade(
            $pdo,
            $studentId,
            $sectionId
        );

        // =================================
        // DROP ORIGINAL SECTION
        // =================================

        $dropStatement = $pdo->prepare(
            "UPDATE enrollments
             SET
                status = 'dropped',
                dropped_at = CURRENT_TIMESTAMP

             WHERE enrollment_id = ?
               AND student_id = ?
               AND status = 'enrolled'"
        );

        $dropStatement->execute([
            $source["enrollment_id"],
            $studentId
        ]);

        if ($dropStatement->rowCount() !== 1) {
            throw new RuntimeException(
                "Unable to release original section."
            );
        }


        // =================================
        // ENROLL IN DESTINATION SECTION
        // =================================

        $insertStatement = $pdo->prepare(
            "INSERT INTO enrollments (
                student_id,
                section_id,
                status,
                enrolled_at,
                dropped_at
             )
             VALUES (
                ?,
                ?,
                'enrolled',
                CURRENT_TIMESTAMP,
                NULL
             )

             ON DUPLICATE KEY UPDATE
                status = 'enrolled',
                enrolled_at = CURRENT_TIMESTAMP,
                dropped_at = NULL"
        );

        $insertStatement->execute([
            $studentId,
            $sectionId
        ]);


        // =================================
        // COMMIT ATOMIC TRANSFER
        // =================================

        $pdo->commit();

        sendActionResponse(200, [
            "success" => true,
            "message" =>
                "Successfully changed section for " .
                $target["course_code"] . ".",
            "source_section_id" => $sourceSectionId,
            "section_id" => $sectionId
        ]);
    }



    // =====================================
    // START TRANSACTION
    // =====================================

    $pdo->beginTransaction();

    // Serialize enrollment changes for this
    // student, even across different sections.
    $studentLock = $pdo->prepare(
        "SELECT user_id
         FROM users
         WHERE user_id = ?
         FOR UPDATE"
    );

    $studentLock->execute([$studentId]);
    $studentLock->fetch();


    // =====================================
    // LOCK TARGET SECTION
    // =====================================

    $sectionStatement = $pdo->prepare(
        "SELECT
            s.section_id,
            s.course_id,
            s.term_id,
            s.capacity,
            s.status AS section_status,
            c.course_code,
            c.course_name,
            c.is_active AS course_active,
            t.is_active AS term_active,
            t.enrollment_start,
            t.enrollment_end

         FROM sections s

         INNER JOIN courses c
            ON c.course_id = s.course_id

         INNER JOIN academic_terms t
            ON t.term_id = s.term_id

         WHERE s.section_id = ?

         FOR UPDATE"
    );

    $sectionStatement->execute([$sectionId]);

    $section = $sectionStatement->fetch();

    if (!$section) {
        $pdo->rollBack();

        sendActionResponse(404, [
            "success" => false,
            "message" => "Class section not found."
        ]);
    }


    // =====================================
    // CHECK SECTION AND TERM
    // =====================================

    if (
        $section["section_status"] !== "open" ||
        (int) $section["course_active"] !== 1
    ) {
        $pdo->rollBack();

        sendActionResponse(409, [
            "success" => false,
            "message" => "This class is not open for enrollment."
        ]);
    }

    if ((int) $section["term_active"] !== 1) {
        $pdo->rollBack();

        sendActionResponse(409, [
            "success" => false,
            "message" => "The academic term is not active."
        ]);
    }

    // Enrollment windows use the database
    // server's current calendar date.
    $dateStatement = $pdo->query(
        "SELECT CURRENT_DATE() AS today"
    );

    $today = $dateStatement->fetch()["today"];

    if (
        $section["enrollment_start"] !== null &&
        $today < $section["enrollment_start"]
    ) {
        $pdo->rollBack();

        sendActionResponse(409, [
            "success" => false,
            "message" => "Enrollment has not opened yet."
        ]);
    }

    if (
        $section["enrollment_end"] !== null &&
        $today > $section["enrollment_end"]
    ) {
        $pdo->rollBack();

        sendActionResponse(409, [
            "success" => false,
            "message" => "The enrollment period has ended."
        ]);
    }


    // =====================================
    // CHECK EXISTING ENROLLMENT
    // =====================================

    $duplicateStatement = $pdo->prepare(
        "SELECT
            e.enrollment_id,
            e.status,
            s.course_id

         FROM enrollments e

         INNER JOIN sections s
            ON s.section_id = e.section_id

         WHERE e.student_id = ?
           AND s.term_id = ?
           AND s.course_id = ?
           AND e.status = 'enrolled'

         LIMIT 1"
    );

    $duplicateStatement->execute([
        $studentId,
        $section["term_id"],
        $section["course_id"]
    ]);

    if ($duplicateStatement->fetch()) {
        $pdo->rollBack();

        sendActionResponse(409, [
            "success" => false,
            "message" => "You are already enrolled in this course."
        ]);
    }


    // =====================================
    // CHECK AVAILABLE SEATS
    // =====================================

    $capacityStatement = $pdo->prepare(
        "SELECT COUNT(*)
         FROM enrollments
         WHERE section_id = ?
           AND status = 'enrolled'"
    );

    $capacityStatement->execute([$sectionId]);

    $enrolledCount =
        (int) $capacityStatement->fetchColumn();

    if ($enrolledCount >= (int) $section["capacity"]) {
        $pdo->rollBack();

        sendActionResponse(409, [
            "success" => false,
            "message" => "This class is already full."
        ]);
    }


    // =====================================
    // CHECK SCHEDULE CONFLICTS
    // =====================================

    $conflictStatement = $pdo->prepare(
        "SELECT
            c.course_code,
            ss.day_of_week

         FROM section_schedules target

         INNER JOIN section_schedules ss
            ON ss.day_of_week = target.day_of_week

         INNER JOIN enrollments e
            ON e.section_id = ss.section_id
           AND e.student_id = ?
           AND e.status = 'enrolled'

         INNER JOIN sections existing_section
            ON existing_section.section_id = e.section_id
           AND existing_section.term_id = ?

         INNER JOIN courses c
            ON c.course_id = existing_section.course_id

         WHERE target.section_id = ?

           AND target.start_time < ss.end_time
           AND target.end_time > ss.start_time

         LIMIT 1"
    );

    $conflictStatement->execute([
        $studentId,
        $section["term_id"],
        $sectionId
    ]);

    $conflict = $conflictStatement->fetch();

    if ($conflict) {
        $pdo->rollBack();

        sendActionResponse(409, [
            "success" => false,
            "message" =>
                "Schedule conflict with " .
                $conflict["course_code"] .
                " on " .
                $conflict["day_of_week"] . "."
        ]);
    }


    // Prevent reactivating an enrollment
// with an existing academic grade.
    ensureEnrollmentHasNoGrade(
        $pdo,
        $studentId,
        $sectionId
    );

    // =====================================
    // INSERT OR REACTIVATE ENROLLMENT
    // =====================================

    // The unique student/section constraint
    // allows a previously dropped enrollment
    // to be reactivated.

    $insertStatement = $pdo->prepare(
        "INSERT INTO enrollments (
            student_id,
            section_id,
            status,
            enrolled_at,
            dropped_at
         )
         VALUES (
            ?,
            ?,
            'enrolled',
            CURRENT_TIMESTAMP,
            NULL
         )

         ON DUPLICATE KEY UPDATE
            status = 'enrolled',
            enrolled_at = CURRENT_TIMESTAMP,
            dropped_at = NULL"
    );

    $insertStatement->execute([
        $studentId,
        $sectionId
    ]);

    $pdo->commit();


    // =====================================
    // SUCCESS RESPONSE
    // =====================================

    sendActionResponse(201, [
        "success" => true,
        "message" =>
            "Successfully enrolled in " .
            $section["course_code"] . ".",
        "section_id" => $sectionId
    ]);


} catch (Throwable $error) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log($error->getMessage());

    sendActionResponse(500, [
        "success" => false,
        "message" => "Unable to process enrollment."
    ]);
}
