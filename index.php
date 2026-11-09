<?php
require __DIR__ . '/backEnd/core/Database.php';

$pdo = Database::connection();
$count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
echo "Connected. Users in table: " . $count;
