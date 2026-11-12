<?php
require_once __DIR__ . '/../models/Schedule.php';

class HomeController
{
    public function index(): void
    {
        require_login();

        // Class schedule card: this term's meetings for the logged-in user
        $termId = Schedule::currentTermId();
        $schedule = $termId
            ? Schedule::meetings((int) $_SESSION['user']['user_id'], $_SESSION['user']['role'], $termId)
            : [];

        view('home', ['schedule' => $schedule]);
    }
}