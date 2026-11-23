<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Add / Drop</h1>

<?php if ($notice): ?>
    <section class="card"><p class="empty"><?= e($notice) ?></p></section>
    <?php require __DIR__ . '/../partials/app_footer.php'; return; ?>
<?php endif; ?>

<?php
// Hidden inputs that keep the page filters after a save
$keep = '<input type="hidden" name="campus" value="' . e($campus) . '">'
      . '<input type="hidden" name="q" value="' . e($q) . '">'
      . '<input type="hidden" name="sort" value="' . e($sort) . '">'
      . '<input type="hidden" name="tab" value="' . e($tab) . '">';
$base = url('add-drop');
$off = $canChange ? '' : 'disabled';
?>

<?php if (!$isActive): ?>
    <p class="period-note">Only students with Active status can add or drop courses.</p>
<?php elseif ($period === null): ?>
    <p class="period-note">No add / drop period has been set for this term.</p>
<?php elseif (!$periodOpen): ?>
    <p class="period-note">Add / Drop is closed. It runs <?= e(date('M j, Y g:i A', strtotime($period['start_date']))) ?>
        to <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php else: ?>
    <p class="period-note">Add / Drop is open until <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php endif; ?>

<div class="enlist-layout">

    <!-- LEFT: campus + course table + special class -->
    <section class="enlist-left" aria-label="Available courses">

        <div class="campus-switch" role="group" aria-label="Campus">
            <?php foreach ($campuses as $c): ?>
                <a class="campus-btn <?= $c === $campus ? 'active' : '' ?>"
                   href="<?= e($base . '&campus=' . urlencode($c) . '&sort=' . urlencode($sort) . '&tab=' . urlencode($tab)) ?>"
                   aria-pressed="<?= $c === $campus ? 'true' : 'false' ?>"><?= e($c) ?></a>
            <?php endforeach; ?>
        </div>

        <form method="GET" action="<?= e(index_url()) ?>" class="course-tools">
            <input type="hidden" name="route" value="add-drop">
            <input type="hidden" name="campus" value="<?= e($campus) ?>">
            <input type="hidden" name="tab" value="<?= e($tab) ?>">

            <label for="course-search" class="sr-only">Search courses</label>
            <input type="search" id="course-search" name="q" value="<?= e($q) ?>" placeholder="Search by course code or name">

            <label for="course-sort" class="sr-only">Sort courses</label>
            <select id="course-sort" name="sort">
                <option value="code-asc"  <?= $sort === 'code-asc' ? 'selected' : '' ?>>Course code (A-Z)</option>
                <option value="code-desc" <?= $sort === 'code-desc' ? 'selected' : '' ?>>Course code (Z-A)</option>
                <option value="name-asc"  <?= $sort === 'name-asc' ? 'selected' : '' ?>>Course name (A-Z)</option>
                <option value="name-desc" <?= $sort === 'name-desc' ? 'selected' : '' ?>>Course name (Z-A)</option>
            </select>
            <button class="filter-btn" type="submit">Search</button>
        </form>

        <div class="table-wrap">
            <table class="course-table" id="course-table">
                <thead>
                    <tr>
                        <th scope="col">Course code</th>
                        <th scope="col">Course name</th>
                        <th scope="col">Section</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!$rows): ?>
                        <tr><td colspan="4" class="empty">No courses match.</td></tr>
                    <?php endif; ?>
                    <?php foreach ($rows as $r): ?>
                        <tr>
                            <td><?= e($r['course_code']) ?></td>
                            <td><?= e($r['title']) ?></td>
                            <td class="section-cell">
                                <span><?= e($r['section_code']) ?></span>
                                <small>
                                    <?php foreach ($r['meetings'] as $i => $m): ?>
                                        <?= $i > 0 ? '<br>' : '' ?><?= e(format_meeting($m)) ?>
                                    <?php endforeach; ?>
                                    <?php if (!$r['meetings']): ?>TBA<?php endif; ?>
                                    <br><?= e((string) $r['taken']) ?>/<?= e((string) $r['slots']) ?> slots
                                    <?php if ($r['campus'] !== $studentCampus): ?> &middot; inter-campus<?php endif; ?>
                                </small>
                            </td>
                            <td>
                                <?php if ($r['state'] === 'available'): ?>
                                    <form method="POST" action="<?= e(url('add-drop-add')) ?>" style="display:inline">
                                        <?= $keep ?>
                                        <input type="hidden" name="section_id" value="<?= e((string) $r['section_id']) ?>">
                                        <button class="row-btn add" type="submit" <?= $off ?>>Add</button>
                                    </form>
                                <?php elseif ($r['state'] === 'enlisted'): ?>
                                    <small>Enlisted</small>
                                <?php elseif ($r['state'] === 'pending'): ?>
                                    <small>Saved in Enlistment</small>
                                <?php elseif ($r['state'] === 'other-section'): ?>
                                    <small>Another section chosen</small>
                                <?php elseif ($r['state'] === 'passed'): ?>
                                    <small>Already passed</small>
                                <?php elseif ($r['state'] === 'locked'): ?>
                                    <small>Needs <?= e($r['note']) ?></small>
                                <?php elseif ($r['state'] === 'full'): ?>
                                    <small>Full</small>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div class="special-class-box">
            <p>Can't find the course you need?</p>
            <a href="<?= e(url('special-class')) ?>" class="btn secondary">Apply Special Class</a>
        </div>
    </section>

    <!-- RIGHT: enlisted courses (drop / change) and schedule -->
    <section class="enlist-right" aria-label="Your courses">

        <div class="view-switch" role="tablist" aria-label="Courses view">
            <a class="view-btn <?= $tab === 'chosen' ? 'active' : '' ?>"
               href="<?= e($base . '&campus=' . urlencode($campus) . '&q=' . urlencode($q) . '&sort=' . urlencode($sort) . '&tab=chosen') ?>">Enrolled courses</a>
            <a class="view-btn <?= $tab === 'schedule' ? 'active' : '' ?>"
               href="<?= e($base . '&campus=' . urlencode($campus) . '&q=' . urlencode($q) . '&sort=' . urlencode($sort) . '&tab=schedule') ?>">Schedule</a>
        </div>

        <?php if ($tab === 'chosen'): ?>
            <div class="chosen-panel">
                <?php if (!$enlisted): ?>
                    <ul class="chosen-list"><li class="empty">No enrolled courses.</li></ul>
                <?php endif; ?>

                <?php foreach ($enlisted as $c): ?>
                    <section class="changes-panel" aria-label="<?= e($c['course_code']) ?>">
                        <h2><?= e($c['course_code']) ?> <?= e($c['section_code']) ?> &ndash; <?= e($c['title']) ?></h2>
                        <p class="chosen-total"><?= e((string) $c['units']) ?> units &middot; <?= e($c['campus']) ?></p>

                        <!-- Drop -->
                        <form method="POST" action="<?= e(url('add-drop-drop')) ?>">
                            <?= $keep ?>
                            <input type="hidden" name="section_id" value="<?= e((string) $c['section_id']) ?>">

                            <label for="reason-<?= e((string) $c['section_id']) ?>">Reason for dropping</label>
                            <select id="reason-<?= e((string) $c['section_id']) ?>" name="reason">
                                <option value="">Select a reason</option>
                                <?php foreach ($reasons as $r): ?>
                                    <option value="<?= e($r) ?>"><?= e($r) ?></option>
                                <?php endforeach; ?>
                            </select>
                            <input type="text" name="reason_other" maxlength="200" placeholder="If you picked Other, explain here">

                            <button class="row-btn drop" type="submit" <?= $off ?>>Drop</button>
                        </form>

                        <!-- Change section -->
                        <?php if ($c['others']): ?>
                            <form method="POST" action="<?= e(url('add-drop-change')) ?>">
                                <?= $keep ?>
                                <input type="hidden" name="section_id" value="<?= e((string) $c['section_id']) ?>">

                                <label for="to-<?= e((string) $c['section_id']) ?>">Change to another section</label>
                                <select id="to-<?= e((string) $c['section_id']) ?>" name="to_section_id">
                                    <?php foreach ($c['others'] as $o): ?>
                                        <option value="<?= e((string) $o['section_id']) ?>">
                                            <?= e($o['section_code']) ?> &ndash; <?= e($o['campus']) ?>
                                            (<?= e((string) $o['taken']) ?>/<?= e((string) $o['slots']) ?> slots)
                                            <?php foreach ($o['meetings'] as $m): ?>
                                                &middot; <?= e($m['day'] . ' ' . format_time($m['start_time'])) ?>
                                            <?php endforeach; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                                <button class="row-btn change" type="submit" <?= $off ?>>Change</button>
                            </form>
                        <?php endif; ?>
                    </section>
                <?php endforeach; ?>

                <p class="chosen-total">Courses enrolled: <span><?= e((string) count($enlisted)) ?></span></p>

                <?php if ($pending): ?>
                    <p class="chosen-total">Saved in Enlistment, not yet submitted:
                        <?= e(implode(', ', array_column($pending, 'course_code'))) ?></p>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="schedule-panel">
                <div class="table-wrap">
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th scope="col">Time</th>
                                <?php foreach ($days as $day): ?><th scope="col"><?= e($day) ?></th><?php endforeach; ?>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (!$grid): ?>
                                <tr><td colspan="<?= count($days) + 1 ?>" class="empty">Nothing to show yet.</td></tr>
                            <?php endif; ?>
                            <?php foreach ($grid as $row): ?>
                                <tr>
                                    <td><?= e($row['time']) ?></td>
                                    <?php foreach ($days as $day): ?>
                                        <td><?= e(implode(', ', $row['cells'][$day])) ?></td>
                                    <?php endforeach; ?>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php endif; ?>
    </section>
</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>