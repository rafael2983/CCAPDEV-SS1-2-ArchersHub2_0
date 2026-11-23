<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Apply Special Class</h1>

<?php if ($notice): ?>
    <section class="card"><p class="empty"><?= e($notice) ?></p></section>
    <?php require __DIR__ . '/../partials/app_footer.php'; return; ?>
<?php endif; ?>

<?php $off = $canChange ? '' : 'disabled'; ?>

<?php if (!$isActive): ?>
    <p class="period-note">Only students with Active status can apply for a special class.</p>
<?php elseif ($period === null): ?>
    <p class="period-note">No special class application period has been set for this term.</p>
<?php elseif (!$periodOpen): ?>
    <p class="period-note">Applications are closed. They run <?= e(date('M j, Y g:i A', strtotime($period['start_date']))) ?>
        to <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php else: ?>
    <p class="period-note">Applications are open until <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php endif; ?>

<div class="enlist-layout">

    <!-- LEFT: campus filter, courses others applied for, apply form -->
    <section class="enlist-left" aria-label="Special class applications">

        <!-- Filters the table below (does not change the form) -->
        <div class="campus-switch" role="group" aria-label="Campus">
            <button type="button" class="campus-btn active" data-campus="either" aria-pressed="true">Either</button>
            <button type="button" class="campus-btn" data-campus="laguna" aria-pressed="false">Laguna</button>
            <button type="button" class="campus-btn" data-campus="manila" aria-pressed="false">Manila</button>
        </div>

        <section class="card" aria-label="Already applied courses">
            <h2>Already applied courses</h2>

            <label for="applied-search" class="sr-only">Search applied courses</label>
            <input type="search" id="applied-search" placeholder="Search by course code or name">

            <div class="table-wrap">
                <table class="course-table" id="applied-table">
                    <thead>
                        <tr>
                            <th scope="col">Course code</th>
                            <th scope="col">Course name</th>
                            <th scope="col">Campus</th>
                            <th scope="col">Students applied</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody id="applied-body">
                        <?php foreach ($applied as $a): ?>
                            <tr data-code="<?= e($a['course_code']) ?>"
                                data-name="<?= e($a['title']) ?>"
                                data-campus="<?= e(strtolower($a['campus'])) ?>">
                                <td><?= e($a['course_code']) ?></td>
                                <td><?= e($a['title']) ?></td>
                                <td><?= e($a['campus']) ?></td>
                                <td class="count-cell"><?= e((string) $a['total']) ?></td>
                                <td>
                                    <?php if ($a['mine']): ?>
                                        <small>Applied</small>
                                    <?php else: ?>
                                        <button type="button" class="row-btn add" data-action="join" <?= $off ?>>Apply</button>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <p class="empty" id="no-applied" <?= $applied ? 'hidden' : '' ?>>
                    <?= $applied ? 'No special class applications match your search.' : 'No one has applied for a special class yet.' ?>
                </p>
            </div>
        </section>

        <!-- New application -->
        <form method="POST" action="<?= e(url('special-class-apply')) ?>" style="display: contents;">
            <section class="card" aria-label="New application">
                <h2>New application</h2>

                <label for="sc-course">Course</label>
                <select id="sc-course" name="course" <?= $off ?>>
                    <option value="">Select a course</option>
                    <?php foreach ($courses as $c): ?>
                        <option value="<?= e($c['course_code']) ?>"><?= e($c['course_code']) ?> - <?= e($c['title']) ?></option>
                    <?php endforeach; ?>
                </select>

                <label for="sc-campus">Campus</label>
                <select id="sc-campus" name="campus" <?= $off ?>>
                    <?php foreach ($campuses as $campus): ?>
                        <option value="<?= e($campus) ?>"><?= e($campus) ?></option>
                    <?php endforeach; ?>
                </select>

                <label for="sc-reason">Reason</label>
                <textarea id="sc-reason" name="reason" rows="4" maxlength="500"
                          placeholder="Why do you need this special class?" <?= $off ?>></textarea>

                <div class="enlist-actions">
                    <button class="btn primary" type="submit" <?= $off ?>>Submit application</button>
                </div>
            </section>
        </form>
    </section>

    <!-- RIGHT: my applications this term -->
    <section class="enlist-right" aria-label="Currently requested courses">
        <section class="card" aria-label="Currently requested courses">
            <h2>Currently requested courses</h2>
            <ul class="chosen-list" id="requested-list">
                <?php if (!$mine): ?>
                    <li class="empty">You haven't applied for any special class yet.</li>
                <?php endif; ?>
                <?php $activeCount = 0; ?>
                <?php foreach ($mine as $m): ?>
                    <?php if (in_array($m['status'], ['Pending', 'Approved'], true)) { $activeCount++; } ?>
                    <li>
                        <span><strong><?= e($m['course_code']) ?></strong> - <?= e($m['title']) ?> (<?= e($m['campus']) ?>)</span>
                        <small><?= e($m['status']) ?></small>
                        <?php if ($m['status'] === 'Pending' && $canChange): ?>
                            <form method="POST" action="<?= e(url('special-class-withdraw')) ?>">
                                <input type="hidden" name="application_id" value="<?= e((string) $m['application_id']) ?>">
                                <button type="submit" class="row-btn drop">Withdraw</button>
                            </form>
                        <?php endif; ?>
                    </li>
                <?php endforeach; ?>
            </ul>
            <p class="chosen-total">Active requests: <span id="requested-count"><?= e((string) $activeCount) ?></span></p>
        </section>
    </section>
</div>

<script src="<?= asset('frontEnd/scripts/special-class.js') ?>"></script>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>