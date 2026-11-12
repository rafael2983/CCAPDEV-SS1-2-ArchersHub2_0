<?php
require_once __DIR__ . '/../models/record.php';

class RecordsController
{
    // GET: all records, plus the records of the term picked in the filter
    public function index(): void
    {
        require_page_access('records');

        $records = Record::forStudent((int) $_SESSION['user']['user_id']);

        // A short term code (Y2526-3) for the table and a label for the filter
        $terms = [];
        foreach ($records as &$r) {
            $r['term_code'] = 'Y' . substr($r['school_year'], 2, 2) . substr($r['school_year'], 7, 2) . '-' . $r['term_no'];
            $terms[$r['term_id']] = 'AY ' . $r['school_year'] . ', Term ' . $r['term_no'];
        }
        unset($r);

        $selected = (int) ($_GET['term'] ?? 0);
        if (!isset($terms[$selected])) {
            $selected = 0;
        }
        $filtered = array_values(array_filter(
            $records,
            fn($r) => $selected !== 0 && (int) $r['term_id'] === $selected
        ));

        view('pages/records', [
            'title'    => 'View Records - ArchersHub',
            'active'   => 'records',
            'records'  => $records,
            'terms'    => $terms,
            'selected' => $selected,
            'filtered' => $filtered,
        ]);
    }
}