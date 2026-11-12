<?php
class HomeController
{
    public function index(): void
    {
	require_login();
        view('home');
    }
}
