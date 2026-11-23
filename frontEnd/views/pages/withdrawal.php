<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Course Withdrawal</h1>

<?php if ($notice): ?>
    <section class="card"><p class="empty"><?= e($notice) ?></p></section>
    <?php require __DIR__ . '/../partials/app_footer.php'; return; ?>
<?php endif; ?>

<?php $off = $canChange ? '' : 'disabled'; ?>

<?php if (!$isActive): ?>
    <p class="period-note">Only students with Active status can withdraw from courses.</p>
<?php elseif ($period === null): ?>
    <p class="period-note">No withdrawal period has been set for this term.</p>
<?php elseif (!$periodOpen): ?>
    <p class="period-note">Withdrawal is closed. It runs <?= e(date('M j, Y g:i A', strtotime($period['start_date']))) ?>
        to <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php else: ?>
    <p class="period-note">Withdrawal is open until <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php endif; ?>

<!-- One form around both cards, so the ticked courses and the reason are sent together -->
<form method="POST" action="<?= e(url('withdrawal-submit')) ?>" style="display: contents;">
<div class="withdrawal">

    <section class="card" id="wd-courses">
        <h2>Enrolled courses</h2>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Withdraw</th>
                        <th>Course code</th>
                        <th>Course name</th>
                        <th>Section</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!$enlisted): ?>
                        <tr><td colspan="4" class="empty">You are not enrolled in any course this term.</td></tr>
                    <?php endif; ?>
                    <?php foreach ($enlisted as $c): ?>
                        <tr>
                            <td>
                                <input type="checkbox" name="sections[]" value="<?= e((string) $c['section_id']) ?>"
                                       id="wd-<?= e((string) $c['section_id']) ?>"
                                       aria-label="Withdraw from <?= e($c['course_code']) ?>" <?= $off ?>>
                            </td>
                            <td><?= e($c['course_code']) ?></td>
                            <td><?= e($c['title']) ?></td>
                            <td><?= e($c['section_code']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>

    <section class="card" id="wd-request">
        <h2>Withdrawal request</h2>
        <p class="chosen-total">Tick the courses on the left. The reason below applies to all of them.</p>

        <label for="wd-reason">Reason</label>
        <select id="wd-reason" name="reason" <?= $off ?>>
            <option value="">Select a reason</option>
            <?php foreach ($reasons as $r): ?>
                <option value="<?= e($r) ?>"><?= e($r) ?></option>
            <?php endforeach; ?>
        </select>
        <input type="text" name="reason_other" maxlength="200" placeholder="If you picked Other, explain here" <?= $off ?>>

        <label class="policy-check" for="wd-agree">
            <input type="checkbox" id="wd-agree" name="agree" value="1" <?= $off ?>>
            I understand a withdrawal cannot be undone
        </label>

        <div class="enlist-actions">
            <button class="btn primary" type="submit" <?= $off ?>>Submit withdrawal</button>
        </div>
    </section>

    <?php if ($history): ?>
        <section class="card" id="wd-history">
            <h2>Withdrawn this term</h2>
            <ul class="chosen-list">
                <?php foreach ($history as $h): ?>
                    <li>
                        <strong><?= e($h['course_code']) ?></strong> <?= e($h['section_code']) ?> &ndash; <?= e($h['title']) ?>
                        <small>(<?= e($h['reason'] ?? 'no reason given') ?>)</small>
                    </li>
                <?php endforeach; ?>
            </ul>
        </section>
    <?php endif; ?>

</div>
</form>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>