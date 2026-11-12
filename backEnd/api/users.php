<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../models/user.php';

error_reporting(E_ALL);
ini_set('display_errors', '0');

function respond(int $statusCode, array $data): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET' && isset($_GET['id'])) {
        $userId = filter_var($_GET['id'], FILTER_VALIDATE_INT);

        if (!$userId || $userId <= 0) {
            respond(400, ['success' => false, 'error' => 'Invalid user ID.']);
        }

        $user = User::profile($userId);

        if (!$user) {
            respond(404, ['success' => false, 'error' => 'User not found.']);
        }

        $user['enlistment'] = User::getEnlistment($userId);
        $user['grades'] = User::getGrades($userId);
        $user['timelineEvents'] = User::getTimeline($userId);

        respond(200, ['success' => true, 'account' => $user]);
    }

    if ($method === 'GET') {
        respond(200, ['success' => true, 'accounts' => User::getAll()]);
    }

    if ($method === 'POST') {
        $rawInput = file_get_contents('php://input');
        $payload = json_decode($rawInput, true);

        if (!is_array($payload)) {
            respond(400, ['success' => false, 'error' => 'Invalid JSON request.']);
        }

        $action = $payload['action'] ?? '';
        $account = $payload['account'] ?? null;

        if (!in_array($action, ['create', 'update'], true)) {
            respond(400, ['success' => false, 'error' => 'Invalid action.']);
        }

        if (!is_array($account)) {
            respond(400, ['success' => false, 'error' => 'Account data is required.']);
        }

        $userId = User::saveAccount($account, $action);

        respond(200, [
            'success' => true,
            'message' => $action === 'create'
                ? 'Account created successfully.'
                : 'Account updated successfully.',
            'user_id' => $userId
        ]);
    }

    respond(405, ['success' => false, 'error' => 'Method not allowed.']);

    $users = User::getAll();
} catch (InvalidArgumentException $e) {
    respond(400, ['success' => false, 'error' => $e->getMessage()]);
}  catch (PDOException $e) {
    error_log('[users.php][Database] ' . $e->getMessage());
    respond(500, [
        'success' => false,
        'error' => 'Database operation failed.',
        'debug' => $e->getMessage()
    ]);
} catch (Throwable $e) {
    error_log('[users.php] ' .$e->getMessage() .PHP_EOL .$e->getTraceAsString());
    respond(500, [
        'success' => false,
        'error' => 'Account operation failed.',
        'debug' => $e->getMessage()
    ]);
}