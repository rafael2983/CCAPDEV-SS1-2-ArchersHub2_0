<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Program Exchange</h1>

<?php if (!$isStudent): ?>
    <section class="card">
        <p class="empty">Program exchange is only available to students.</p>
    </section>
<?php else: ?>
<?php
    $open = $period !== null && $period['open'];
    $canApply = $open && !$hasPending;
?>
<div class="program-exchange">

    <section class="card" id="px-form">
        <h2>Apply for a program exchange</h2>

        <p class="period-note" id="px-period">
            <?php if ($period === null): ?>
                Application period: not set yet.
            <?php else: ?>
                Application period: <?= e(date('M j, Y', strtotime($period['start']))) ?> to <?= e(date('M j, Y', strtotime($period['end']))) ?>
                (<?= $open ? 'open' : 'closed' ?>).
            <?php endif; ?>
            <?php if ($hasPending): ?>
                You already have a pending application.
            <?php endif; ?>
        </p>

        <form method="POST" action="<?= e(url('program-exchange-apply')) ?>">
            <label for="px-current">Current program</label>
            <input type="text" id="px-current" value="<?= e($current) ?>" readonly>

            <label for="px-target">Target program</label>
            <select id="px-target" name="target_program_id" required>
                <option value="">Select a program</option>
                <?php foreach ($targets as $t): ?>
                    <option value="<?= e((string) $t['program_id']) ?>"><?= e($t['name']) ?></option>
                <?php endforeach; ?>
            </select>

            <label for="px-reason">Reason</label>
            <textarea id="px-reason" name="reason" rows="4" maxlength="500" required
                      placeholder="Why do you want to change programs?"></textarea>

            <div class="enlist-actions">
                <button class="btn primary" id="px-submit" type="submit" <?= $canApply ? '' : 'disabled' ?>>Submit application</button>
            </div>
        </form>
    </section>

    <section class="card" id="px-history">
        <h2>My applications</h2>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Target program</th>
                        <th>Date applied</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="px-body">
                    <?php if (!$applications): ?>
                        <tr>
                            <td colspan="4" class="empty">You have no program exchange applications.</td>
                        </tr>
                    <?php endif; ?>
                    <?php foreach ($applications as $a): ?>
                        <tr>
                            <td><?= e($a['target']) ?></td>
                            <td><?= e(date('M j, Y', strtotime($a['created_at']))) ?></td>
                            <td><?= e($a['status']) ?></td>
                            <td>
                                <?php if ($a['status'] === 'Pending'): ?>
                                    <form method="POST" action="<?= e(url('program-exchange-cancel')) ?>">
                                        <input type="hidden" name="application_id" value="<?= e((string) $a['application_id']) ?>">
                                        <button class="row-btn drop" type="submit">Cancel</button>
                                    </form>
                                <?php else: ?>
                                    -
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>

</div>
<?php endif; ?>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>