<?php
require __DIR__ . '/backEnd/models/user.php';

$user = User::findByEmail('lean_gutierrez@dlsu.edu.ph');
echo $user
    ? htmlspecialchars($user['first_name'] . ' - ' . $user['role'])
    : 'Not found';
