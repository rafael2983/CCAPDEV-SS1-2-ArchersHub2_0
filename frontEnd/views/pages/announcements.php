<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Make Announcements</h1>

<div class="dashboard">
    <div class="dashboard-left">
        <section class="card announce-list" aria-label="Saved announcements">
            <h2>Saved announcements</h2>
            <?php if (!$announcements): ?>
                <p class="empty">No announcements yet.</p>
            <?php else: ?>
                <ul class="event-list">
                    <?php foreach ($announcements as $item): ?>
                        <li>
                            <span>
                                <?= e($item['title']) ?>
                                <?= $item['is_important'] ? ' (Important)' : '' ?>
                                <br>
                                <small>
                                    <?= e(format_event_date($item['start_date'])) ?>
                                    <?= $item['end_date'] ? ' to ' . e(format_event_date($item['end_date'])) : '' ?>
                                </small>
                            </span>
                            <span class="row-actions">
                                <a class="row-btn change" href="<?= e(url('announcements') . '&edit=' . (int) $item['announcement_id']) ?>">Edit</a>
                                <form method="POST" action="<?= e(url('announcements-delete')) ?>"
                                      onsubmit="return confirm('Remove this announcement?');">
                                    <input type="hidden" name="announcement_id" value="<?= (int) $item['announcement_id'] ?>">
                                    <button class="row-btn drop" type="submit">Delete</button>
                                </form>
                            </span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </section>
    </div>

    <div class="dashboard-right">
        <section class="card">
            <h2><?= $editing ? 'Edit announcement' : 'New announcement' ?></h2>
            <form class="editor-form" method="POST" action="<?= e(url('announcements-save')) ?>" enctype="multipart/form-data">
                <input type="hidden" name="announcement_id" value="<?= (int) ($editing['announcement_id'] ?? 0) ?>">

                <label for="ann-title">Title</label>
                <input type="text" id="ann-title" name="title" maxlength="200" required
                       placeholder="Announcement title"
                       value="<?= e($editing['title'] ?? '') ?>">

                <label class="check-line">
                    <input type="checkbox" name="is_important" <?= !empty($editing['is_important']) ? 'checked' : '' ?>>
                    For important announcement
                </label>

                <div class="editor-row">
                    <div>
                        <label for="ann-start">Start date</label>
                        <input type="datetime-local" id="ann-start" name="start_date" required
                               value="<?= e(datetime_local($editing['start_date'] ?? null)) ?>">
                    </div>
                    <div>
                        <label for="ann-end">End date</label>
                        <input type="datetime-local" id="ann-end" name="end_date"
                               value="<?= e(datetime_local($editing['end_date'] ?? null)) ?>">
                    </div>
                </div>

                <label for="ann-content">Contents</label>
                <textarea id="ann-content" name="content" required maxlength="8000"
                          placeholder="Type announcement contents here..."
                          style="min-height: 220px;"><?= e($editing['content'] ?? '') ?></textarea>

                <?php if ($files): ?>
                    <p><strong>Attached files</strong></p>
                    <ul class="file-list">
                        <?php foreach ($files as $file): ?>
                            <li>
                                <a href="<?= e(asset($file['file_path'])) ?>"><?= e($file['file_name']) ?></a>
                                <label class="check-line">
                                    <input type="checkbox" name="remove_file[]" value="<?= (int) $file['attachment_id'] ?>">
                                    Remove
                                </label>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>

                <label for="ann-files">Attach files (pdf, images, txt, doc — 5 MB each)</label>
                <input type="file" id="ann-files" name="files[]" multiple
                       accept=".pdf,.png,.jpg,.jpeg,.gif,.txt,.doc,.docx">

                <div class="editor-actions">
                    <button class="btn primary" type="submit">Save</button>
                    <?php if ($editing): ?>
                        <a class="btn secondary" href="<?= e(url('announcements')) ?>">Cancel</a>
                    <?php endif; ?>
                </div>
            </form>
        </section>
    </div>
</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>
