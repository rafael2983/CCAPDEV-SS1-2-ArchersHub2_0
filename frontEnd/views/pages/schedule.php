<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">View Schedule</h1>

<div class="view-schedule">

    <section class="card" id="vs-schedule">

        <!-- Pick a term (GET), then switch between the weekly table and the list -->
        <form method="GET" action="<?= e(index_url()) ?>" class="schedule-tools">
            <input type="hidden" name="route" value="schedule">
            <input type="hidden" name="view" value="<?= e($viewMode) ?>">

            <label for="vs-term">Term</label>
            <select id="vs-term" name="term">
                <?php foreach ($terms as $t): ?>
                    <option value="<?= e((string) $t['term_id']) ?>" <?= (int) $t['term_id'] === $selected ? 'selected' : '' ?>>
                        AY <?= e($t['school_year']) ?>, Term <?= e((string) $t['term_no']) ?><?= $t['is_current'] ? ' (current)' : '' ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <button class="filter-btn" type="submit">Show</button>

            <div class="view-switch" id="vs-view">
                <a class="view-btn <?= $viewMode === 'week' ? 'active' : '' ?>"
                   href="<?= e(url('schedule') . '&term=' . $selected . '&view=week') ?>">Weekly</a>
                <a class="view-btn <?= $viewMode === 'list' ? 'active' : '' ?>"
                   href="<?= e(url('schedule') . '&term=' . $selected . '&view=list') ?>">List</a>
            </div>
        </form>

        <?php if ($viewMode === 'week'): ?>
            <!-- Weekly view -->
            <div class="table-wrap" id="vs-week">
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <?php foreach ($days as $day): ?>
                                <th><?= e($day) ?></th>
                            <?php endforeach; ?>
                        </tr>
                    </thead>
                    <tbody id="vs-week-body">
                        <?php if (!$grid): ?>
                            <tr><td colspan="7" class="empty">No scheduled classes yet.</td></tr>
                        <?php endif; ?>
                        <?php foreach ($grid as $row): ?>
                            <tr>
                                <td><?= e($row['time']) ?></td>
                                <?php foreach ($days as $day): ?>
                                    <?php if ($row['cells'][$day]): ?>
                                        <td class="filled"><?= implode('<br>', array_map('e', $row['cells'][$day])) ?></td>
                                    <?php else: ?>
                                        <td></td>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php else: ?>
            <!-- List view -->
            <ul class="chosen-list" id="vs-list">
                <?php if (!$entries): ?>
                    <li class="empty">No classes this term.</li>
                <?php endif; ?>
                <?php foreach ($entries as $en): ?>
                    <li>
                        <span><?= e($en['code']) ?> - <?= e($en['title']) ?> (<?= e($en['section']) ?>)</span>
                        <small><?= $en['slots'] ? implode('<br>', array_map('e', $en['slots'])) : 'TBA' ?></small>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

    </section>

</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>