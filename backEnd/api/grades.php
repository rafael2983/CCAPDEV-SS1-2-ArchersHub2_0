<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/grade.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function gradeJsonResponse(int $statusCode, array $payload): void {
    http_response_code($statusCode);
    echo json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

function gradeCurrentUserId(): ?int {
    $candidates = [
        $_SESSION['user_id'] ?? null,
        $_SESSION['userId'] ?? null,
        is_array($_SESSION['user'] ?? null) ? ($_SESSION['user']['user_id'] ?? null) : null,
        is_array($_SESSION['user'] ?? null) ? ($_SESSION['user']['id'] ?? null) : null,
        is_array($_SESSION['account'] ?? null) ? ($_SESSION['account']['user_id'] ?? null) : null,
        is_array($_SESSION['auth'] ?? null) ? ($_SESSION['auth']['user_id'] ?? null) : null,
    ];

    foreach ($candidates as $candidate) {
        $id = filter_var($candidate, FILTER_VALIDATE_INT);
        if ($id !== false && $id !== null && $id > 0) {
            return (int) $id;
        }
    }

    return null;
}

try {
    $teacherId = gradeCurrentUserId();

    if ($teacherId === null) {
        gradeJsonResponse(401, ['success' => false, 'error' => 'Login is required.']);
    }

    $gradeModel = new Grade();

    if (!$gradeModel->isActiveTeacher($teacherId)) {
        gradeJsonResponse(403, [
            'success' => false,
            'error' => 'This account does not have access to Grade Encoding.'
        ]);
    }

    if (empty($_SESSION['grade_encoding_csrf'])) {
        $_SESSION['grade_encoding_csrf'] = bin2hex(random_bytes(32));
    }

    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

    if ($method === 'GET') {
        $action = trim((string) ($_GET['action'] ?? 'courses'));

        if ($action === 'courses') {
            gradeJsonResponse(200, [
                'success' => true,
                'csrfToken' => $_SESSION['grade_encoding_csrf'],
                'courses' => $gradeModel->getCoursesForTeacher($teacherId)
            ]);
        }

        if ($action === 'sections') {
            $courseCode = trim((string) ($_GET['course_code'] ?? ''));

            if ($courseCode === '') {
                gradeJsonResponse(400, ['success' => false, 'error' => 'Subject code is required.']);
            }

            gradeJsonResponse(200, [
                'success' => true,
                'csrfToken' => $_SESSION['grade_encoding_csrf'],
                'sections' => $gradeModel->getSectionsForTeacher($teacherId, $courseCode)
            ]);
        }

        if ($action === 'students') {
            $sectionId = filter_var($_GET['section_id'] ?? null, FILTER_VALIDATE_INT);

            if ($sectionId === false || $sectionId === null || $sectionId < 1) {
                gradeJsonResponse(400, ['success' => false, 'error' => 'Incorrect class section.']);
            }

            $result = $gradeModel->getStudentsForSection((int) $sectionId, $teacherId);

            gradeJsonResponse(200, [
                'success' => true,
                'csrfToken' => $_SESSION['grade_encoding_csrf'],
                'section' => $result['section'],
                'students' => $result['students']
            ]);
        }

        gradeJsonResponse(400, ['success' => false, 'error' => 'Unsupported request.']);
    }

    if ($method === 'POST') {
        $providedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken = $_SESSION['grade_encoding_csrf'] ?? '';

        if ($sessionToken === '' || !is_string($providedToken) ||
            !hash_equals($sessionToken, $providedToken)) {
            gradeJsonResponse(403, [
                'success' => false,
                'error' => 'Request token is invalid. Please refresh the page and try again.'
            ]);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!is_array($input)) {
            gradeJsonResponse(400, ['success' => false, 'error' => 'Request data format is incorrect.']);
        }

        $sectionId = filter_var($input['sectionId'] ?? null, FILTER_VALIDATE_INT);
        $grades = $input['grades'] ?? null;

        if ($sectionId === false || $sectionId === null || $sectionId < 1 || !is_array($grades)) {
            gradeJsonResponse(400, ['success' => false, 'error' => 'Class section or grade data is incorrect.']);
        }

        $savedCount = $gradeModel->saveGrades($teacherId, (int) $sectionId, $grades);

        gradeJsonResponse(200, [
            'success' => true,
            'savedCount' => $savedCount,
            'message' => $savedCount . 'grades have been saved to the database.'
        ]);
    }

    gradeJsonResponse(405, ['success' => false, 'error' => 'This request method is not allowed.']);
} catch (DomainException $e) {
    gradeJsonResponse(404, ['success' => false, 'error' => $e->getMessage()]);
} catch (InvalidArgumentException $e) {
    gradeJsonResponse(400, ['success' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    error_log('[ArchersHub Grade Encoding] ' . $e->getMessage());
    gradeJsonResponse(500, [
        'success' => false,
        'error' => 'Server error occurred while processing grades. Please check the server error logs..'
    ]);
}
