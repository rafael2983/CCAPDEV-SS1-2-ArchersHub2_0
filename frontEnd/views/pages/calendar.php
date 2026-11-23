<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">University Calendar</h1>

<div class="university-calendar">

    <?php if ($canEdit): ?>
        <section class="card calendar-editor" aria-label="<?= $editing ? 'Edit event' : 'Add event' ?>">
            <h2><?= $editing ? 'Edit event' : 'Add event' ?></h2>
            <form class="editor-form" method="POST" action="<?= e(url('calendar-save')) ?>">
                <input type="hidden" name="event_id" value="<?= e((string) ($editing['event_id'] ?? 0)) ?>">
                <input type="hidden" name="view" value="<?= e($viewMode) ?>">

                <label for="event-title">Title</label>
                <input type="text" id="event-title" name="title" maxlength="200" required
                       value="<?= e($editing['title'] ?? '') ?>">

                <div class="editor-row">
                    <div>
                        <label for="event-start">Start</label>
                        <input type="datetime-local" id="event-start" name="start_date" required
                               value="<?= e(datetime_local($editing['start_date'] ?? null)) ?>">
                    </div>
                    <div>
                        <label for="event-end">End (optional)</label>
                        <input type="datetime-local" id="event-end" name="end_date"
                               value="<?= e(datetime_local($editing['end_date'] ?? null)) ?>">
                    </div>
                </div>

                <label class="check-line">
                    <input type="checkbox" name="is_important" <?= !empty($editing['is_important']) ? 'checked' : '' ?>>
                    Important
                </label>

                <div class="editor-actions">
                    <button class="btn primary" type="submit"><?= $editing ? 'Save changes' : 'Add event' ?></button>
                    <?php if ($editing): ?>
                        <a class="btn secondary" href="<?= e(url('calendar') . '&view=' . urlencode($viewMode)) ?>">Cancel</a>
                    <?php endif; ?>
                </div>
            </form>
        </section>
    <?php endif; ?>

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
                            <?php if ($canEdit): ?><th>Actions</th><?php endif; ?>
                        </tr>
                    </thead>
                    <tbody id="uc-body">
                        <?php if (!$events): ?>
                            <tr><td colspan="<?= $canEdit ? 5 : 4 ?>" class="empty">No calendar events.</td></tr>
                        <?php endif; ?>
                        <?php foreach ($events as $ev): ?>
                            <tr>
                                <td><?= e(format_event_date($ev['start_date'])) ?></td>
                                <td><?= $ev['end_date'] ? e(format_event_date($ev['end_date'])) : '-' ?></td>
                                <td><?= e($ev['title']) ?></td>
                                <td><?= $ev['is_important'] ? 'Yes' : 'No' ?></td>
                                <?php if ($canEdit): ?>
                                    <td class="row-actions">
                                        <a class="row-btn change" href="<?= e(url('calendar') . '&view=table&edit=' . (int) $ev['event_id']) ?>">Edit</a>
                                        <form method="POST" action="<?= e(url('calendar-delete')) ?>"
                                              onsubmit="return confirm('Remove this event?');">
                                            <input type="hidden" name="event_id" value="<?= (int) $ev['event_id'] ?>">
                                            <input type="hidden" name="view" value="table">
                                            <button class="row-btn drop" type="submit">Delete</button>
                                        </form>
                                    </td>
                                <?php endif; ?>
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
                        <span class="row-actions">
                            <span>
                                <?= e(format_event_date($ev['start_date'])) ?>
                                <?= $ev['end_date'] ? ' to ' . e(format_event_date($ev['end_date'])) : '' ?>
                            </span>
                            <?php if ($canEdit): ?>
                                <a class="row-btn change" href="<?= e(url('calendar') . '&view=list&edit=' . (int) $ev['event_id']) ?>">Edit</a>
                                <form method="POST" action="<?= e(url('calendar-delete')) ?>"
                                      onsubmit="return confirm('Remove this event?');">
                                    <input type="hidden" name="event_id" value="<?= (int) $ev['event_id'] ?>">
                                    <input type="hidden" name="view" value="list">
                                    <button class="row-btn drop" type="submit">Delete</button>
                                </form>
                            <?php endif; ?>
                        </span>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

    </section>

</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>
