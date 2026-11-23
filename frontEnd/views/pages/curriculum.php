<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Curriculum Progression</h1>

<?php if (!$hasProgram): ?>
    <section class="card">
        <p class="empty">Curriculum progression is only available to students with a program.</p>
    </section>
<?php else: ?>
<div class="curriculum">

    <section class="card" id="cp-summary">
        <h2>My progress</h2>
        <p>Units completed: <span id="cp-done"><?= e((string) $doneUnits) ?></span> of <span id="cp-total"><?= e((string) $totalUnits) ?></span></p>
        <progress id="cp-bar" value="<?= e((string) $percent) ?>" max="100"></progress>
    </section>

    <section class="card" id="cp-courses">
        <h2>Courses</h2>

        <!-- Filter by status. Taken / Can take now / Needs a prerequisite -->
        <form method="GET" action="<?= e(index_url()) ?>" class="view-switch" id="cp-filter">
            <input type="hidden" name="route" value="curriculum">
            <button type="submit" name="status" value=""          class="view-btn <?= $status === ''          ? 'active' : '' ?>">All</button>
            <button type="submit" name="status" value="taken"     class="view-btn <?= $status === 'taken'     ? 'active' : '' ?>">Taken</button>
            <button type="submit" name="status" value="available" class="view-btn <?= $status === 'available' ? 'active' : '' ?>">Can take now</button>
            <button type="submit" name="status" value="locked"    class="view-btn <?= $status === 'locked'    ? 'active' : '' ?>">Needs prerequisite</button>
        </form>

        <!-- Highest requirement first: Majors, then GEs -->
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Course code</th>
                        <th>Course name</th>
                        <th>Category</th>
                        <th>Year level</th>
                        <th>Term</th>
                        <th>Units</th>
                        <th>Prerequisite</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="cp-body">
                    <?php
                    $labels = ['taken' => 'Taken', 'available' => 'Can take now', 'locked' => 'Needs prerequisite'];
                    foreach ($courses as $c): ?>
                        <tr data-status="<?= e($c['status']) ?>">
                            <td><?= e($c['course_code']) ?></td>
                            <td><?= e($c['title']) ?></td>
                            <td><?= e($c['category']) ?></td>
                            <td><?= e((string) $c['year_lvl']) ?></td>
                            <td><?= e((string) $c['term_no']) ?></td>
                            <td><?= e((string) $c['units']) ?></td>
                            <td><?= $c['prereqs'] ? e(implode(', ', $c['prereqs'])) : 'None' ?></td>
                            <td><?= e($labels[$c['status']]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php if (!$courses): ?>
            <p class="empty" id="cp-empty">No courses in this group.</p>
        <?php endif; ?>
    </section>

</div>
<?php endif; ?>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>