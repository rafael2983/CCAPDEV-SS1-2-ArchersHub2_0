<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Enlistment</h1>

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
$base = url('enlistment');
?>

<?php if (!$isActive): ?>
    <p class="period-note">Only students with Active status can enlist.</p>
<?php elseif ($period === null): ?>
    <p class="period-note">No enlistment period has been set for this term.</p>
<?php elseif (!$periodOpen): ?>
    <p class="period-note">Enlistment is closed. It runs <?= e(date('M j, Y g:i A', strtotime($period['start_date']))) ?>
        to <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php else: ?>
    <p class="period-note">Enlistment is open until <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php endif; ?>

<div class="enlist-layout">
    <!-- Left Side / Available Courses -->
    <section class="enlist-left" aria-label="Available courses">

        <div class="campus-switch" role="group" aria-label="Campus">
            <?php foreach ($campuses as $c): ?>
                <a class="campus-btn <?= $c === $campus ? 'active' : '' ?>"
                   href="<?= e($base . '&campus=' . urlencode($c) . '&sort=' . urlencode($sort) . '&tab=' . urlencode($tab)) ?>"
                   aria-pressed="<?= $c === $campus ? 'true' : 'false' ?>"><?= e($c) ?></a>
            <?php endforeach; ?>
        </div>

        <!-- Search / sort -->
        <form method="GET" action="<?= e(index_url()) ?>" class="course-tools">
            <input type="hidden" name="route" value="enlistment">
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
                                    <form method="POST" action="<?= e(url('enlistment-add')) ?>" style="display:inline">
                                        <?= $keep ?>
                                        <input type="hidden" name="section_id" value="<?= e((string) $r['section_id']) ?>">
                                        <button class="row-btn add" type="submit" <?= $canChange ? '' : 'disabled' ?>>Add</button>
                                    </form>
                                <?php elseif ($r['state'] === 'pending'): ?>
                                    <form method="POST" action="<?= e(url('enlistment-remove')) ?>" style="display:inline">
                                        <?= $keep ?>
                                        <input type="hidden" name="section_id" value="<?= e((string) $r['section_id']) ?>">
                                        <button class="row-btn drop" type="submit" <?= $canChange ? '' : 'disabled' ?>>Remove</button>
                                    </form>
                                <?php elseif ($r['state'] === 'enlisted'): ?>
                                    <small>Enlisted</small>
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
    </section>

    <!-- Right Side / Chosen courses -->
    <section class="enlist-right" aria-label="Chosen courses">

        <div class="view-switch" role="tablist" aria-label="Chosen courses view">
            <a class="view-btn <?= $tab === 'chosen' ? 'active' : '' ?>"
               href="<?= e($base . '&campus=' . urlencode($campus) . '&q=' . urlencode($q) . '&sort=' . urlencode($sort) . '&tab=chosen') ?>">Chosen courses</a>
            <a class="view-btn <?= $tab === 'schedule' ? 'active' : '' ?>"
               href="<?= e($base . '&campus=' . urlencode($campus) . '&q=' . urlencode($q) . '&sort=' . urlencode($sort) . '&tab=schedule') ?>">Schedule</a>
        </div>

        <?php if ($tab === 'chosen'): ?>
            <div class="chosen-panel">
                <h2>Saved, not yet submitted</h2>
                <ul class="chosen-list">
                    <?php if (!$pending): ?>
                        <li class="empty">No courses chosen yet. Press Add on a course to start.</li>
                    <?php endif; ?>
                    <?php foreach ($pending as $p): ?>
                        <li>
                            <strong><?= e($p['course_code']) ?></strong> <?= e($p['section_code']) ?> &ndash; <?= e($p['title']) ?>
                            (<?= e((string) $p['units']) ?> units)
                            <form method="POST" action="<?= e(url('enlistment-remove')) ?>" style="display:inline">
                                <?= $keep ?>
                                <input type="hidden" name="section_id" value="<?= e((string) $p['section_id']) ?>">
                                <button class="row-btn drop" type="submit" <?= $canChange ? '' : 'disabled' ?>>Remove</button>
                            </form>
                        </li>
                    <?php endforeach; ?>
                </ul>
                <p class="chosen-total">Courses chosen: <span><?= e((string) count($pending)) ?></span>
                    &middot; Units: <span><?= e((string) $pendingUnits) ?></span></p>

                <h2>Enlisted</h2>
                <ul class="chosen-list">
                    <?php if (!$enlisted): ?>
                        <li class="empty">You are not enlisted in any course yet.</li>
                    <?php endif; ?>
                    <?php foreach ($enlisted as $p): ?>
                        <li>
                            <strong><?= e($p['course_code']) ?></strong> <?= e($p['section_code']) ?> &ndash; <?= e($p['title']) ?>
                            (<?= e((string) $p['units']) ?> units)
                        </li>
                    <?php endforeach; ?>
                </ul>
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

        <!-- Policy + submit -->
        <form method="POST" action="<?= e(url('enlistment-submit')) ?>" class="enlist-actions">
            <?= $keep ?>
            <label class="policy-check" for="agree-policy">
                <input type="checkbox" id="agree-policy" name="agree" value="1">
                I agree to the school policy
            </label>
            <button class="btn primary" type="submit" <?= $canChange && $pending ? '' : 'disabled' ?>>Submit</button>
        </form>
    </section>
</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>