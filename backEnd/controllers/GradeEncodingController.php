<?php
require_once __DIR__ . '/../models/Enrollment.php';
require_once __DIR__ . '/../models/GradeEncoding.php';
require_once __DIR__ . '/../models/Schedule.php';

class GradeEncodingController
{
    public function index(): void
    {
        require_page_access('grade-encoding');

        $termId = Schedule::currentTermId();
        $data = [
            'title'  => 'Grade Encoding - ArchersHub',
            'active' => 'grade-encoding',
            'notice' => null,
        ];

        if ($termId === null) {
            view('pages/grade-encoding', array_merge($data, ['notice' => 'There is no term set up yet.']));
            return;
        }

        $teacherId = $_SESSION['user']['role'] === 'Admin' ? null : (int) $_SESSION['user']['user_id'];
        $period = Enrollment::period($termId, 'Grade Encoding');
        $course = trim($_GET['course'] ?? '');
        $sectionId = (int) ($_GET['section'] ?? 0);
        $sections = $course === '' ? [] : GradeEncoding::sections($termId, $course, $teacherId);
        $section = $sectionId > 0 ? GradeEncoding::section($sectionId, $termId, $teacherId) : null;
        if ($section !== null && $section['course_code'] !== $course) {
            $section = null;
        }

        view('pages/grade-encoding', array_merge($data, [
            'termLabel'   => $this->termLabel($termId),
            'period'      => $period,
            'periodOpen'  => $period !== null && (bool) $period['is_open'],
            'courses'     => GradeEncoding::courses($termId, $teacherId),
            'course'      => $course,
            'sections'    => $sections,
            'section'     => $section,
            'students'    => $section ? GradeEncoding::students((int) $section['section_id']) : [],
            'scale'       => GradeEncoding::scale(),
        ]));
    }

    public function save(): void
    {
        require_page_access('grade-encoding');

        $termId = Schedule::currentTermId();
        $teacherId = $_SESSION['user']['role'] === 'Admin' ? null : (int) $_SESSION['user']['user_id'];
        $sectionId = (int) ($_POST['section_id'] ?? 0);
        $section = $termId === null ? null : GradeEncoding::section($sectionId, $termId, $teacherId);

        if ($section === null) {
            flash('error', 'Choose one of your sections first.');
            redirect('grade-encoding');
        }

        $back = ['course' => $section['course_code'], 'section' => $section['section_id']];
        $period = Enrollment::period($termId, 'Grade Encoding');
        if ($period === null || !$period['is_open']) {
            flash('error', 'The grade encoding period is closed.');
            redirect('grade-encoding', $back);
        }

        $grades = $_POST['grades'] ?? [];
        if (!is_array($grades)) {
            flash('error', 'Nothing to save.');
            redirect('grade-encoding', $back);
        }

        GradeEncoding::save($sectionId, (int) $_SESSION['user']['user_id'], $grades);
        flash('success', 'Grades saved for ' . $section['course_code'] . ' ' . $section['section_code'] . '.');
        redirect('grade-encoding', $back);
    }

    private function termLabel(int $termId): string
    {
        foreach (Schedule::terms() as $term) {
            if ((int) $term['term_id'] === $termId) {
                return $term['school_year'] . ' Term ' . $term['term_no'];
            }
        }
        return '';
    }
}
