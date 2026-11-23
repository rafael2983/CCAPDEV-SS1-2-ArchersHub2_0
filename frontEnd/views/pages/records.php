<?php require __DIR__ . '/../partials/app_header.php'; ?>

<section class="greeting-row" aria-label="Greeting">
    <div class="greeting">
        <p class="greeting-sub">Academic Management</p>
        <h1>View Records</h1>
    </div>
</section>

<div class="dashboard">
    <!-- Left Side: Filter & Filtered Records -->
    <div class="dashboard-left">
        <section class="card">
            <h2>Filter</h2>
            <form method="GET" action="<?= e(index_url()) ?>" style="display: flex; gap: 10px; margin-top: 10px;">
                <input type="hidden" name="route" value="records">
                <select name="term" aria-label="Term" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    <option value="">Select Term</option>
                    <?php foreach ($terms as $termId => $label): ?>
                        <option value="<?= e((string) $termId) ?>" <?= $selected === $termId ? 'selected' : '' ?>><?= e($label) ?></option>
                    <?php endforeach; ?>
                </select>
                <button class="filter-btn" type="submit">Show</button>
            </form>
        </section>

        <section class="card">
            <h2>Filtered Record</h2>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Units</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($selected === 0): ?>
                            <tr><td colspan="3" class="empty">Select a term to see its records.</td></tr>
                        <?php else: ?>
                            <?php foreach ($filtered as $r): ?>
                                <tr>
                                    <td><?= e($r['course_code']) ?></td>
                                    <td><?= e(number_format((float) $r['units'], 1)) ?></td>
                                    <td><?= e($r['grade_value']) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>
    </div>

    <!-- Right Side: All Records -->
    <div class="dashboard-right">
        <section class="card" style="height: 100%;">
            <h2>All Record</h2>
            <div class="table-wrap" style="max-height: 400px; overflow-y: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Term</th>
                            <th>Course</th>
                            <th>Units</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!$records): ?>
                            <tr><td colspan="4" class="empty">No records yet.</td></tr>
                        <?php endif; ?>
                        <?php foreach ($records as $r): ?>
                            <tr>
                                <td><?= e($r['term_code']) ?></td>
                                <td><?= e($r['course_code']) ?></td>
                                <td><?= e(number_format((float) $r['units'], 1)) ?></td>
                                <td><?= e($r['grade_value']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>