<?php

/* =========================================
   ARCHERSHUB FACULTY GRADES API

   MILESTONE 8C:
   GET = Retrieve assigned classes
   GET = Retrieve student rosters

   Read-only for now.
========================================= */

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

require_once __DIR__ .
    "/../../backEnd/config/database.php";


// =========================================
// JSON RESPONSE HELPER
// =========================================

function sendGradeResponse(
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

    sendGradeResponse(405, [
        "success" => false,
        "message" => "Method not allowed."
    ]);
}


// =========================================
// VERIFY LOGIN SESSION
// =========================================

session_start();

if (!isset($_SESSION["user_id"])) {

    sendGradeResponse(401, [
        "success" => false,
        "message" => "Please log in first."
    ]);
}


try {

    $pdo = getDatabaseConnection();


    // =====================================
    // VERIFY AUTHENTICATED USER
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

    $currentUser =
        $userStatement->fetch(PDO::FETCH_ASSOC);

    if (
        !$currentUser ||
        $currentUser["status"] !== "active"
    ) {

        sendGradeResponse(403, [
            "success" => false,
            "message" => "Account is not active."
        ]);
    }


    // =====================================
    // FACULTY ACCESS ONLY
    // =====================================

    if ($currentUser["role"] !== "faculty") {

        sendGradeResponse(403, [
            "success" => false,
            "message" => "Faculty access required."
        ]);
    }

    $facultyId = (int) $currentUser["user_id"];

    $view = $_GET["view"] ?? "classes";


    // =====================================
    // RETRIEVE ACTIVE ACADEMIC TERM
    // =====================================

    $termStatement = $pdo->query(
        "SELECT
            term_id,
            academic_year,
            term_number
         FROM academic_terms
         WHERE is_active = 1
         ORDER BY term_id DESC
         LIMIT 1"
    );

    $activeTerm =
        $termStatement->fetch(PDO::FETCH_ASSOC);

    if (!in_array($view, ["classes", "roster"], true)) {

        sendGradeResponse(400, [
            "success" => false,
            "message" => "Unsupported view."
        ]);
    }

    if (!$activeTerm) {

        if ($view === "roster") {

            sendGradeResponse(409, [
                "success" => false,
                "message" => "No active academic term."
            ]);
        }

        sendGradeResponse(200, [
            "success" => true,
            "term" => null,
            "classes" => [],
            "message" => "No active academic term."
        ]);
    }

    $termId = (int) $activeTerm["term_id"];


    // =====================================
    // GET: ASSIGNED FACULTY CLASSES
    // =====================================

    if ($view === "classes") {

        $classStatement = $pdo->prepare(
            "SELECT
                s.section_id,
                c.course_code AS code,
                c.course_name AS name,
                s.section_code AS section,
                s.campus,
                s.status AS section_status,

                COUNT(e.enrollment_id)
                    AS enrolled_count,

                COUNT(g.grade_id)
                    AS encoded_count,

                COALESCE(
                    SUM(
                        CASE
                            WHEN g.status = 'finalized'
                            THEN 1
                            ELSE 0
                        END
                    ), 0
                ) AS finalized_count

             FROM faculty_assignments fa

             INNER JOIN sections s
                ON s.section_id = fa.section_id

             INNER JOIN courses c
                ON c.course_id = s.course_id

             LEFT JOIN enrollments e
                ON e.section_id = s.section_id
               AND e.status = 'enrolled'

             LEFT JOIN grades g
                ON g.enrollment_id = e.enrollment_id

             WHERE fa.faculty_id = ?
               AND s.term_id = ?
               AND s.status <> 'cancelled'

             GROUP BY
                s.section_id,
                c.course_code,
                c.course_name,
                s.section_code,
                s.campus,
                s.status

             ORDER BY
                c.course_code ASC,
                s.section_code ASC"
        );

        $classStatement->execute([
            $facultyId,
            $termId
        ]);

        $classes =
            $classStatement->fetchAll(PDO::FETCH_ASSOC);

        foreach ($classes as &$class) {

            $class["section_id"] =
                (int) $class["section_id"];

            $class["enrolled_count"] =
                (int) $class["enrolled_count"];

            $class["encoded_count"] =
                (int) $class["encoded_count"];

            $class["finalized_count"] =
                (int) $class["finalized_count"];
        }

        unset($class);

        sendGradeResponse(200, [
            "success" => true,

            "term" => [
                "term_id" => $termId,

                "academic_year" =>
                    $activeTerm["academic_year"],

                "term_number" =>
                    (int) $activeTerm["term_number"]
            ],

            "classes" => $classes
        ]);
    }


    // =====================================
    // GET: STUDENT ROSTER
    // =====================================

    if ($view === "roster") {

        $sectionId = filter_var(
            $_GET["section_id"] ?? null,
            FILTER_VALIDATE_INT,
            ["options" => ["min_range" => 1]]
        );

        if ($sectionId === false) {

            sendGradeResponse(400, [
                "success" => false,
                "message" =>
                    "A valid section_id is required."
            ]);
        }


        // =================================
        // VERIFY FACULTY CLASS ASSIGNMENT
        // =================================

        $assignmentStatement = $pdo->prepare(
            "SELECT
                s.section_id,
                c.course_code AS code,
                c.course_name AS name,
                s.section_code AS section,
                s.campus

             FROM faculty_assignments fa

             INNER JOIN sections s
                ON s.section_id = fa.section_id

             INNER JOIN courses c
                ON c.course_id = s.course_id

             WHERE fa.faculty_id = ?
               AND s.section_id = ?
               AND s.term_id = ?
               AND s.status <> 'cancelled'

             LIMIT 1"
        );

        $assignmentStatement->execute([
            $facultyId,
            $sectionId,
            $termId
        ]);

        $assignedClass =
            $assignmentStatement->fetch(PDO::FETCH_ASSOC);

        if (!$assignedClass) {

            sendGradeResponse(403, [
                "success" => false,
                "message" =>
                    "You are not authorized to access this class."
            ]);
        }

        $assignedClass["section_id"] =
            (int) $assignedClass["section_id"];


        // =================================
        // RETRIEVE ENROLLED STUDENTS
        // =================================

        $rosterStatement = $pdo->prepare(
            "SELECT
                e.enrollment_id,
                e.student_id,

                u.school_id AS student_number,

                CONCAT(
                    u.first_name,
                    ' ',
                    u.last_name
                ) AS student_name,

                g.grade,
                g.status AS grade_status,
                g.finalized_at

             FROM enrollments e

             INNER JOIN users u
                ON u.user_id = e.student_id

             INNER JOIN sections s
                ON s.section_id = e.section_id

             INNER JOIN faculty_assignments fa
                ON fa.section_id = s.section_id

             LEFT JOIN grades g
                ON g.enrollment_id = e.enrollment_id

             WHERE e.section_id = ?
               AND fa.faculty_id = ?
               AND s.term_id = ?
               AND s.status <> 'cancelled'
               AND e.status = 'enrolled'
               AND u.role = 'student'

             ORDER BY
                u.last_name ASC,
                u.first_name ASC"
        );

        $rosterStatement->execute([
            $sectionId,
            $facultyId,
            $termId
        ]);

        $students =
            $rosterStatement->fetchAll(PDO::FETCH_ASSOC);


        // =================================
        // FORMAT STUDENT RECORDS
        // =================================

        foreach ($students as &$student) {

            $student["enrollment_id"] =
                (int) $student["enrollment_id"];

            $student["student_id"] =
                (int) $student["student_id"];

            $student["grade"] =
                $student["grade"] === null
                ? null
                : (float) $student["grade"];

            $student["grade_status"] =
                $student["grade_status"] ?? "ungraded";
        }

        unset($student);


        // =================================
        // RETURN STUDENT ROSTER
        // =================================

        sendGradeResponse(200, [
            "success" => true,
            "class" => $assignedClass,
            "students" => $students,
            "total_students" => count($students)
        ]);
    }


} catch (Throwable $error) {

    error_log($error->getMessage());

    sendGradeResponse(500, [
        "success" => false,
        "message" =>
            "Unable to retrieve faculty grade information."
    ]);
}
