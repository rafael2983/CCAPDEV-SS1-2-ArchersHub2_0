<?php
/* ARCHERSHUB - MILESTONE 8E-B: SAVE DRAFT GRADES */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once __DIR__ . '/../../backEnd/config/database.php';

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}
function reject(int $status, string $message, ?PDO $pdo = null): void
{
    if ($pdo && $pdo->inTransaction())
        $pdo->rollBack();
    respond($status, ['success' => false, 'message' => $message]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    reject(405, 'Method not allowed.');
}
session_start();
if (!isset($_SESSION['user_id']))
    reject(401, 'Please log in first.');
$token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
    reject(403, 'Invalid CSRF token.');
}
$facultyId = (int) $_SESSION['user_id'];
try {
    $pdo = getDatabaseConnection();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $user = $pdo->prepare('SELECT role, status FROM users WHERE user_id = ?');
    $user->execute([$facultyId]);
    $account = $user->fetch(PDO::FETCH_ASSOC);
    if (!$account || $account['status'] !== 'active')
        reject(403, 'Account is not active.');
    if ($account['role'] !== 'faculty')
        reject(403, 'Faculty access required.');

    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE)
        reject(400, 'Invalid JSON request.');
    if (($data['action'] ?? null) !== 'save')
        reject(400, 'Unsupported grade action.');
    $sectionId = $data['section_id'] ?? null;
    if (!is_int($sectionId) || $sectionId < 1)
        reject(400, 'A valid section_id is required.');
    $grades = $data['grades'] ?? null;
    if (!is_array($grades) || !array_is_list($grades) || count($grades) < 1 || count($grades) > 500) {
        reject(400, 'Submit between 1 and 500 grade entries.');
    }
    $valid = ['0.0', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0'];
    $entries = [];
    foreach ($grades as $entry) {
        if (!is_array($entry))
            reject(400, 'Invalid grade entry.');
        $id = $entry['enrollment_id'] ?? null;
        $grade = $entry['grade'] ?? null;
        if (!is_int($id) || $id < 1)
            reject(400, 'A valid enrollment_id is required.');
        if (!is_string($grade) || !in_array($grade, $valid, true))
            reject(400, 'Invalid numerical grade.');
        if (isset($entries[$id]))
            reject(400, 'Duplicate enrollment_id in request.');
        $entries[$id] = $grade;
    }
    ksort($entries, SORT_NUMERIC);
    $pdo->beginTransaction();
    // Discover student IDs without locking enrollment rows first.
    $lookup = $pdo->prepare('SELECT student_id FROM enrollments WHERE enrollment_id = ? AND section_id = ?');
    $studentIds = [];
    foreach ($entries as $id => $grade) {
        $lookup->execute([$id, $sectionId]);
        $studentId = $lookup->fetchColumn();
        if ($studentId === false)
            reject(409, 'Enrollment does not belong to this class.', $pdo);
        $studentIds[$id] = (int) $studentId;
    }
    // Match enrollmentActions.php: lock student rows before section/enrollment rows.
    // Include faculty account in the same deterministic user-lock ordering.
    $lockIds = array_unique(array_merge(array_values($studentIds), [$facultyId]));
    sort($lockIds, SORT_NUMERIC);
    $lockUser = $pdo->prepare('SELECT role, status FROM users WHERE user_id = ? FOR UPDATE');
    foreach ($lockIds as $id) {
        $lockUser->execute([$id]);
        $row = $lockUser->fetch(PDO::FETCH_ASSOC);
        if (!$row)
            reject(409, 'User record no longer exists.', $pdo);
        if ($id === $facultyId) {
            if ($row['role'] !== 'faculty' || $row['status'] !== 'active')
                reject(403, 'Active faculty access required.', $pdo);
        } elseif ($row['role'] !== 'student')
            reject(409, 'Invalid student record.', $pdo);
    }
    $section = $pdo->prepare('SELECT term_id, status FROM sections WHERE section_id = ? FOR UPDATE');
    $section->execute([$sectionId]);
    $class = $section->fetch(PDO::FETCH_ASSOC);
    $termId = $pdo->query('SELECT term_id FROM academic_terms WHERE is_active = 1 ORDER BY term_id DESC LIMIT 1 FOR UPDATE')->fetchColumn();
    if ($termId === false)
        reject(409, 'No active academic term.', $pdo);
    $assignment = $pdo->prepare('SELECT assignment_id FROM faculty_assignments WHERE faculty_id = ? AND section_id = ? FOR UPDATE');
    $assignment->execute([$facultyId, $sectionId]);
    if (!$class || $class['status'] === 'cancelled' || (int) $class['term_id'] !== (int) $termId || $assignment->fetchColumn() === false) {
        reject(403, 'You are not authorized to access this class.', $pdo);
    }
    $lockEnrollment = $pdo->prepare('SELECT student_id, section_id, status FROM enrollments WHERE enrollment_id = ? FOR UPDATE');
    $lockGrade = $pdo->prepare('SELECT grade_id, status FROM grades WHERE enrollment_id = ? FOR UPDATE');
    $insert = $pdo->prepare("INSERT INTO grades (enrollment_id, encoded_by, grade, status) VALUES (?, ?, ?, 'draft')");
    $update = $pdo->prepare("UPDATE grades SET grade = ?, encoded_by = ? WHERE grade_id = ? AND status = 'draft'");
    foreach ($entries as $id => $grade) {
        $lockEnrollment->execute([$id]);
        $enrollment = $lockEnrollment->fetch(PDO::FETCH_ASSOC);
        if (!$enrollment || (int) $enrollment['student_id'] !== $studentIds[$id] || (int) $enrollment['section_id'] !== $sectionId || $enrollment['status'] !== 'enrolled') {
            reject(409, 'Student is not currently enrolled in this class.', $pdo);
        }
        $lockGrade->execute([$id]);
        $existing = $lockGrade->fetch(PDO::FETCH_ASSOC);
        if ($existing && $existing['status'] === 'finalized')
            reject(409, 'Finalized grades cannot be modified.', $pdo);
        if ($existing)
            $update->execute([$grade, $facultyId, $existing['grade_id']]);
        else
            $insert->execute([$id, $facultyId, $grade]);
    }
    $pdo->commit();
    respond(200, ['success' => true, 'message' => 'Draft grades saved successfully.', 'section_id' => $sectionId, 'saved_count' => count($entries)]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction())
        $pdo->rollBack();
    error_log($error->getMessage());
    if ($error instanceof PDOException && in_array((int) ($error->errorInfo[1] ?? 0), [1205, 1213], true)) {
        reject(409, 'Concurrent database operation. Please retry.');
    }
    reject(500, 'Unable to save draft grades.');
}
