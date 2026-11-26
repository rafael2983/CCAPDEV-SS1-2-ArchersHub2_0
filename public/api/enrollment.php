<?php

/* =========================================
   ARCHERSHUB ENROLLMENT API

   MILESTONE 7B-A:
   GET = Retrieve available class sections

   Read-only for now.
========================================= */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

require_once __DIR__ .
    "/../../backEnd/config/database.php";


// =========================================
// JSON RESPONSE HELPER
// =========================================

function sendEnrollmentResponse(
    int $status,
    array $data
): void {

    http_response_code($status);

    echo json_encode($data);

    exit;
}


// =========================================
// ALLOW GET REQUESTS ONLY
// =========================================

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    header("Allow: GET");

    sendEnrollmentResponse(405, [
        "success" => false,
        "message" => "Method not allowed."
    ]);
}


// =========================================
// VERIFY LOGIN SESSION
// =========================================

session_start();

if (!isset($_SESSION["user_id"])) {

    sendEnrollmentResponse(401, [
        "success" => false,
        "message" => "Please log in first."
    ]);
}


try {

    $pdo = getDatabaseConnection();


    // =====================================
    // VERIFY AUTHENTICATED USER
    // =====================================

    $statement = $pdo->prepare(
        "SELECT user_id, role, status
         FROM users
         WHERE user_id = ?
         LIMIT 1"
    );

    $statement->execute([
        $_SESSION["user_id"]
    ]);

    $currentUser = $statement->fetch();

    if (
        !$currentUser ||
        $currentUser["status"] !== "active"
    ) {

        sendEnrollmentResponse(403, [
            "success" => false,
            "message" => "Account is not active."
        ]);
    }


    // =====================================
    // STUDENT ACCESS ONLY
    // =====================================

    if ($currentUser["role"] !== "student") {

        sendEnrollmentResponse(403, [
            "success" => false,
            "message" => "Student access required."
        ]);
    }


    // =====================================
    // GET: LOGGED-IN STUDENT ENROLLMENTS
    // =====================================

    if (($_GET["view"] ?? "") === "mine") {

        $enrollmentStatement = $pdo->prepare(
            "SELECT
                e.enrollment_id,
                e.section_id,

                c.course_code AS code,
                c.course_name AS name,

                s.section_code AS section,
                s.campus,
                s.status AS section_status,

                t.academic_year,
                t.term_number,

                e.status AS enrollment_status,
                e.enrolled_at

             FROM enrollments e

             INNER JOIN sections s
                ON s.section_id = e.section_id

             INNER JOIN courses c
                ON c.course_id = s.course_id

             INNER JOIN academic_terms t
                ON t.term_id = s.term_id

             WHERE e.student_id = ?
               AND e.status = 'enrolled'
               AND t.is_active = 1

             ORDER BY
                c.course_code ASC,
                s.section_code ASC"
        );

        $enrollmentStatement->execute([
            $currentUser["user_id"]
        ]);

        $enrollments = $enrollmentStatement->fetchAll();


        // =================================
        // RETRIEVE SCHEDULES
        // =================================

        $scheduleStatement = $pdo->prepare(
            "SELECT
                ss.section_id,
                ss.day_of_week,
                ss.start_time,
                ss.end_time,
                ss.room,
                ss.delivery_mode

             FROM section_schedules ss

             INNER JOIN enrollments e
                ON e.section_id = ss.section_id

             INNER JOIN sections s
                ON s.section_id = e.section_id

             INNER JOIN academic_terms t
                ON t.term_id = s.term_id

             WHERE e.student_id = ?
               AND e.status = 'enrolled'
               AND t.is_active = 1

             ORDER BY
                FIELD(
                    ss.day_of_week,
                    'MON', 'TUE', 'WED',
                    'THU', 'FRI', 'SAT', 'SUN'
                ),
                ss.start_time"
        );

        $scheduleStatement->execute([
            $currentUser["user_id"]
        ]);

        $schedules = $scheduleStatement->fetchAll();


        // =================================
        // GROUP SCHEDULES BY SECTION
        // =================================

        $scheduleMap = [];

        foreach ($schedules as $schedule) {

            $sectionId = (int) $schedule["section_id"];

            if (!isset($scheduleMap[$sectionId])) {
                $scheduleMap[$sectionId] = [];
            }

            $scheduleMap[$sectionId][] = $schedule;
        }


        // =================================
        // FORMAT ENROLLMENT RESPONSE
        // =================================

        $formattedEnrollments = [];

        foreach ($enrollments as $enrollment) {

            $sectionId = (int) $enrollment["section_id"];

            $sectionSchedules =
                $scheduleMap[$sectionId] ?? [];

            $scheduleLines = [];

            foreach ($sectionSchedules as $schedule) {

                $start = date(
                    "h:iA",
                    strtotime($schedule["start_time"])
                );

                $end = date(
                    "h:iA",
                    strtotime($schedule["end_time"])
                );

                $location =
                    $schedule["delivery_mode"] === "online"
                    ? "online"
                    : ($schedule["room"] ?: "TBA");

                $scheduleLines[] =
                    $schedule["day_of_week"] .
                    " " . $start .
                    "-" . $end .
                    " | " . $location;
            }

            $formattedEnrollments[] = [
                "enrollment_id" =>
                    (int) $enrollment["enrollment_id"],

                "section_id" => $sectionId,

                "code" => $enrollment["code"],

                "name" => $enrollment["name"],

                "section" => $enrollment["section"],

                "campus" => $enrollment["campus"],

                "schedule" => empty($scheduleLines)
                    ? "TBA"
                    : implode("\n", $scheduleLines),

                "schedules" => $sectionSchedules,

                "academic_year" =>
                    $enrollment["academic_year"],

                "term_number" =>
                    (int) $enrollment["term_number"],

                "enrollment_status" =>
                    $enrollment["enrollment_status"],

                "enrolled_at" =>
                    $enrollment["enrolled_at"]
            ];
        }


        // =================================
        // RETURN STUDENT ENROLLMENTS
        // =================================

        sendEnrollmentResponse(200, [
            "success" => true,
            "enrollments" => $formattedEnrollments
        ]);
    }


    // =====================================
    // RETRIEVE ACTIVE TERM
    // =====================================

    $termStatement = $pdo->query(
        "SELECT term_id,
                academic_year,
                term_number
         FROM academic_terms
         WHERE is_active = 1
         ORDER BY term_id DESC
         LIMIT 1"
    );

    $activeTerm = $termStatement->fetch();

    if (!$activeTerm) {

        sendEnrollmentResponse(200, [
            "success" => true,
            "term" => null,
            "courses" => [],
            "message" => "No active academic term."
        ]);
    }


    // =====================================
    // RETRIEVE COURSE SECTIONS
    // =====================================

    $courseStatement = $pdo->prepare(
        "SELECT
            s.section_id,
            c.course_code AS code,
            c.course_name AS name,
            s.section_code AS section,
            s.campus,
            s.capacity,
            s.status AS section_status,

            COUNT(DISTINCT e.enrollment_id)
                AS enrolled_count

         FROM sections s

         INNER JOIN courses c
            ON c.course_id = s.course_id

         LEFT JOIN enrollments e
            ON e.section_id = s.section_id
           AND e.status = 'enrolled'

         WHERE s.term_id = ?
           AND c.is_active = 1

         GROUP BY
            s.section_id,
            c.course_code,
            c.course_name,
            s.section_code,
            s.campus,
            s.capacity,
            s.status

         ORDER BY
            c.course_code ASC,
            s.section_code ASC"
    );

    $courseStatement->execute([
        $activeTerm["term_id"]
    ]);

    $courses = $courseStatement->fetchAll();


    // =====================================
    // RETRIEVE SECTION SCHEDULES
    // =====================================

    $scheduleStatement = $pdo->prepare(
        "SELECT
            ss.section_id,
            ss.day_of_week,
            ss.start_time,
            ss.end_time,
            ss.room,
            ss.delivery_mode

         FROM section_schedules ss

         INNER JOIN sections s
            ON s.section_id = ss.section_id

         WHERE s.term_id = ?

         ORDER BY
            FIELD(
                ss.day_of_week,
                'MON', 'TUE', 'WED',
                'THU', 'FRI', 'SAT', 'SUN'
            ),
            ss.start_time"
    );

    $scheduleStatement->execute([
        $activeTerm["term_id"]
    ]);

    $schedules = $scheduleStatement->fetchAll();


    // =====================================
    // GROUP SCHEDULES BY SECTION
    // =====================================

    $scheduleMap = [];

    foreach ($schedules as $schedule) {

        $sectionId = (int) $schedule["section_id"];

        if (!isset($scheduleMap[$sectionId])) {
            $scheduleMap[$sectionId] = [];
        }

        $scheduleMap[$sectionId][] = $schedule;
    }


    // =====================================
    // FORMAT COURSE RESPONSE
    // =====================================

    $formattedCourses = [];

    foreach ($courses as $course) {

        $sectionId = (int) $course["section_id"];

        $sectionSchedules =
            $scheduleMap[$sectionId] ?? [];

        $scheduleLines = [];

        foreach ($sectionSchedules as $schedule) {

            $start = date(
                "h:iA",
                strtotime($schedule["start_time"])
            );

            $end = date(
                "h:iA",
                strtotime($schedule["end_time"])
            );

            $location =
                $schedule["delivery_mode"] === "online"
                ? "online"
                : ($schedule["room"] ?: "TBA");

            $scheduleLines[] =
                $schedule["day_of_week"] .
                " " . $start .
                "-" . $end .
                " | " . $location;
        }

        $enrolledCount =
            (int) $course["enrolled_count"];

        $capacity =
            (int) $course["capacity"];

        $formattedCourses[] = [
            "section_id" => $sectionId,

            "code" => $course["code"],

            "name" => $course["name"],

            "section" => $course["section"],

            "campus" => $course["campus"],

            "schedule" => empty($scheduleLines)
                ? "TBA"
                : implode("\n", $scheduleLines),

            "schedules" => $sectionSchedules,

            "capacity" => $capacity,

            "enrolled_count" => $enrolledCount,

            "available_seats" =>
                max(0, $capacity - $enrolledCount),

            "section_status" =>
                $course["section_status"]
        ];
    }


    // =====================================
    // SUCCESSFUL RESPONSE
    // =====================================

    sendEnrollmentResponse(200, [
        "success" => true,

        "term" => [
            "term_id" => (int) $activeTerm["term_id"],
            "academic_year" =>
                $activeTerm["academic_year"],
            "term_number" =>
                (int) $activeTerm["term_number"]
        ],

        "courses" => $formattedCourses
    ]);


} catch (Throwable $error) {

    error_log($error->getMessage());

    sendEnrollmentResponse(500, [
        "success" => false,
        "message" =>
            "Unable to retrieve enrollment information."
    ]);
}
