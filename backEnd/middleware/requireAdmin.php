<?php

/* =========================================
   ADMIN AUTHORIZATION MIDDLEWARE
========================================= */

function requireAdmin(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    if (
        !isset($_SESSION["user_id"]) ||
        ($_SESSION["role"] ?? null) !== "admin"
    ) {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Admin access required."
        ]);

        exit;
    }
}
