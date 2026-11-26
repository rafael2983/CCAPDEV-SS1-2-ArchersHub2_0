<?php require __DIR__ . '/../partials/app_header.php'; ?>

<h1 class="page-title">Grade Encoding</h1>

<?php if ($notice): ?>
    <section class="card"><p class="empty"><?= e($notice) ?></p></section>
    <?php require __DIR__ . '/../partials/app_footer.php'; return; ?>
<?php endif; ?>

<?php $canSave = $periodOpen && $section; ?>

<?php if ($period === null): ?>
    <p class="period-note">No grade encoding period has been set for <?= e($termLabel) ?>.</p>
<?php elseif (!$periodOpen): ?>
    <p class="period-note">Grade encoding is closed for <?= e($termLabel) ?>. It runs
        <?= e(date('M j, Y g:i A', strtotime($period['start_date']))) ?>
        to <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php else: ?>
    <p class="period-note">Grade encoding for <?= e($termLabel) ?> is open until
        <?= e(date('M j, Y g:i A', strtotime($period['end_date']))) ?>.</p>
<?php endif; ?>

<div class="grade-encoding">
    <section class="card" id="grade-encoding">

        <form method="GET" action="<?= e(index_url()) ?>">
            <input type="hidden" name="route" value="grade-encoding">
            <div class="grade-selection">
                <div class="grade-field">
                    <label for="course-select">Course</label>
                    <select id="course-select" name="course">
                        <option value="">Select a course</option>
                        <?php foreach ($courses as $c): ?>
                            <option value="<?= e($c['course_code']) ?>" <?= $c['course_code'] === $course ? 'selected' : '' ?>>
                                <?= e($c['course_code'] . ' — ' . $c['title']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="grade-field">
                    <label for="section-select">Section</label>
                    <select id="section-select" name="section" <?= $sections ? '' : 'disabled' ?>>
                        <option value=""><?= $course === '' ? 'Select a course first' : 'Select a section' ?></option>
                        <?php foreach ($sections as $sec): ?>
                            <option value="<?= (int) $sec['section_id'] ?>"
                                <?= $section && (int) $section['section_id'] === (int) $sec['section_id'] ? 'selected' : '' ?>>
                                <?= e($sec['section_code'] . ' (' . $sec['campus'] . ')') ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <button class="filter-btn" type="submit">Show</button>
        </form>

        <?php if (!$courses): ?>
            <p id="grade-status" role="status">You have no sections assigned this term.</p>
        <?php elseif (!$section): ?>
            <p id="grade-status" role="status">Select a course and section to view students.</p>
        <?php elseif (!$students): ?>
            <p id="grade-status" role="status">No enlisted students in this section.</p>
        <?php else: ?>
            <p id="grade-status" role="status">
                <?= e($section['course_code'] . ' ' . $section['section_code'] . ' — ' . $section['title']) ?>
            </p>
        <?php endif; ?>

        <form method="POST" action="<?= e(url('grade-encoding-save')) ?>">
            <input type="hidden" name="section_id" value="<?= (int) ($section['section_id'] ?? 0) ?>">

            <div class="table-wrap">
                <table class="grade-table">
                    <colgroup>
                        <col style="width: 25%;">
                        <col style="width: 55%;">
                        <col style="width: 20%;">
                    </colgroup>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student Name</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody id="grade-students-body" data-grades="<?= e(json_encode($scale)) ?>">
                        <?php if (!$section): ?>
                            <tr><td colspan="3">Select a course and section first.</td></tr>
                        <?php elseif (!$students): ?>
                            <tr><td colspan="3">No enlisted students in this section.</td></tr>
                        <?php endif; ?>
                        <?php foreach ($students as $student): ?>
                            <tr>
                                <td><?= e((string) $student['user_id']) ?></td>
                                <td><?= e($student['last_name'] . ', ' . $student['first_name']) ?></td>
                                <td>
                                    <input type="text" class="grade-input"
                                           name="grades[<?= (int) $student['enrollment_id'] ?>]"
                                           value="<?= e($student['grade_value'] ?? '') ?>"
                                           placeholder="Grade" maxlength="5" autocomplete="off"
                                           aria-label="Grade for <?= e($student['last_name'] . ', ' . $student['first_name']) ?>"
                                           <?= $canSave ? '' : 'disabled' ?>>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <p class="period-note">Leave a grade blank for "not yet graded". Pick a grade from the suggestions.</p>
            <div class="grade-actions">
                <button type="submit" id="save-grades-btn" <?= $canSave ? '' : 'disabled' ?>>Save</button>
            </div>
        </form>
    </section>
</div>
<script src="<?= e(asset('frontEnd/scripts/grade-suggest.js')) ?>" defer></script>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>
