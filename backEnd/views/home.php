<?php
$title = 'Home - ArchersHub';
$active = 'home';
require __DIR__ . '/partials/app_header.php';
?>

<section class="greeting-row" aria-label="Greeting">
    <div class="greeting">
        <p class="greeting-sub">Welcome, <span id="user-name"><?= e($_SESSION['user']['first_name']) ?></span></p>
        <h1 id="greeting-text">Good Day</h1>
    </div>

    <div class="filter-wrap">
        <button class="filter-btn" id="filter-btn" aria-expanded="false" aria-controls="filter-panel">
            Filter
        </button>
        <div class="filter-panel" id="filter-panel" hidden>
            <label for="filter-campus">Campus</label>
            <select id="filter-campus">
                <option value="all">All</option>
                <option value="manila">Manila</option>
                <option value="laguna">Laguna</option>
            </select>

            <label for="filter-events">Show events</label>
            <select id="filter-events">
                <option value="all">All events</option>
                <option value="important">Important only</option>
                <option value="org">Organizations only</option>
            </select>
        </div>
    </div>
</section>

<div class="dashboard">
    <div class="dashboard-left">
        <section class="card" id="class-schedule">
            <h2>Class Schedule</h2>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Section</th>
                            <th>Day / Time</th>
                            <th>Room</th>
                        </tr>
                    </thead>
                    <tbody id="schedule-body">
                        <tr>
                            <td colspan="4" class="empty">No classes yet. Enlist in a course to see your schedule here</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="card" id="school-calendar">
            <h2>School Calendar</h2>
            <div class="calendar-view">
                <p>calendar goes here</p>
            </div>
        </section>
    </div>

    <div class="dashboard-right">
        <section class="card" id="events">
            <h2>Events</h2>
            <ul class="event-list" id="events-list">
                <li class="empty">No upcoming events.</li>
            </ul>
        </section>

        <section class="card" id="announcements">
            <h2>Announcements</h2>
            <ul class="event-list" id="announcements-list">
                <li class="empty">No announcements from the Provost.</li>
            </ul>
        </section>

        <section class="card" id="other-events">
            <h2>Other Events</h2>
            <h3>Organization posts</h3>
            <ul class="event-list" id="org-posts-list">
                <li class="empty">No organization posts yet. Join an organization to see its updates.</li>
            </ul>
        </section>
    </div>
</div>

<?php require __DIR__ . '/partials/app_footer.php'; ?>
