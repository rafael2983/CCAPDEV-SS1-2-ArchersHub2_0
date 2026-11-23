<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">University Calendar</h1>

<div class="university-calendar">

    <section class="card" id="uc-calendar">

        <div class="view-switch" id="uc-view">
            <a class="view-btn <?= $viewMode === 'table' ? 'active' : '' ?>"
               href="<?= e(url('calendar') . '&view=table') ?>">Tabular</a>
            <a class="view-btn <?= $viewMode === 'list' ? 'active' : '' ?>"
               href="<?= e(url('calendar') . '&view=list') ?>">List</a>
        </div>

        <?php if ($viewMode === 'table'): ?>
            <div class="table-wrap" id="uc-table">
                <table>
                    <thead>
                        <tr>
                            <th>Start date</th>
                            <th>End date</th>
                            <th>Event</th>
                            <th>Important</th>
                        </tr>
                    </thead>
                    <tbody id="uc-body">
                        <?php if (!$events): ?>
                            <tr><td colspan="4" class="empty">No calendar events.</td></tr>
                        <?php endif; ?>
                        <?php foreach ($events as $ev): ?>
                            <tr>
                                <td><?= e(format_event_date($ev['start_date'])) ?></td>
                                <td><?= $ev['end_date'] ? e(format_event_date($ev['end_date'])) : '-' ?></td>
                                <td><?= e($ev['title']) ?></td>
                                <td><?= $ev['is_important'] ? 'Yes' : 'No' ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php else: ?>
            <ul class="event-list" id="uc-list">
                <?php if (!$events): ?>
                    <li class="empty">No calendar events.</li>
                <?php endif; ?>
                <?php foreach ($events as $ev): ?>
                    <li>
                        <span>
                            <?= e($ev['title']) ?>
                            <?= $ev['is_important'] ? ' (Important)' : '' ?>
                        </span>
                        <span>
                            <?= e(format_event_date($ev['start_date'])) ?>
                            <?= $ev['end_date'] ? ' to ' . e(format_event_date($ev['end_date'])) : '' ?>
                        </span>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

    </section>

</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>