<?php
// Unit tests for backEnd/models/CalendarEvent.php (all 7 functions).
//
// Run from the project folder:   php tests/CalendarEventTest.php
// Every change is made inside ONE database transaction that is rolled back at
// the end, so your real data is never changed. The results are printed on the
// screen and also saved to tests/results/CalendarEvent_results.txt

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Run this test from the command line.\n");
}

require_once __DIR__ . '/../backEnd/models/CalendarEvent.php';

$lines  = [];
$passed = 0;
$failed = 0;

function out(string $text): void
{
    global $lines;
    $lines[] = $text;
    echo $text . "\n";
}

function section(string $name): void
{
    out('');
    out('== ' . $name);
}

function check(string $name, bool $ok): void
{
    global $passed, $failed;
    if ($ok) {
        $passed++;
        out('  [PASS] ' . $name);
    } else {
        $failed++;
        out('  [FAIL] ' . $name);
    }
}

// True when the code inside throws an error (for example a foreign key error).
function throws(callable $fn): bool
{
    try {
        $fn();
    } catch (Throwable $e) {
        return true;
    }
    return false;
}

// Creates an event through the model and returns its new id.
function make(?int $by, string $title, string $start, ?string $end, bool $important = false): int
{
    CalendarEvent::create($by, $title, $start, $end, $important);
    return (int) Database::connection()->lastInsertId();
}

function ids(array $rows): array
{
    return array_map(fn($r) => (int) $r['event_id'], $rows);
}

// find() does not return created_by, so read it straight from the table.
function creator(int $eventId): ?int
{
    $stmt = Database::connection()->prepare('SELECT created_by FROM calendar_event WHERE event_id = ?');
    $stmt->execute([$eventId]);
    $v = $stmt->fetchColumn();
    return ($v === false || $v === null) ? null : (int) $v;
}

function total(): int
{
    return (int) Database::connection()->query('SELECT COUNT(*) FROM calendar_event')->fetchColumn();
}

function runTests(int $provost, int $student): void
{
    // ---------------------------------------------------------------- create()
    section('create()');
    $before = total();
    $ret = CalendarEvent::create($provost, 'TEST create', '2099-05-01 09:30:00', '2099-05-02 17:00:00', true);
    $id  = (int) Database::connection()->lastInsertId();
    $row = CalendarEvent::find($id);

    check('returns nothing (void)', $ret === null);
    check('adds exactly one row', total() === $before + 1);
    check('saves the title', $row['title'] === 'TEST create');
    check('saves the start date', $row['start_date'] === '2099-05-01 09:30:00');
    check('saves the end date', $row['end_date'] === '2099-05-02 17:00:00');
    check('important = true is saved as 1', (int) $row['is_important'] === 1);
    check('saves the provost as created_by', creator($id) === $provost);

    $id2 = make($provost, 'TEST not important', '2099-05-03 08:00:00', null, false);
    $r2  = CalendarEvent::find($id2);
    check('important = false is saved as 0', (int) $r2['is_important'] === 0);
    check('a missing end date is saved as NULL', $r2['end_date'] === null);

    $id3 = make(null, 'TEST no creator', '2099-05-04 08:00:00', null);
    check('created_by can be NULL', CalendarEvent::find($id3) !== null);

    check('a created_by that is not a provost is rejected',
        throws(fn() => CalendarEvent::create($student, 'TEST bad fk', '2099-05-05 08:00:00', null, false)));

    $evil = "Robert'); DROP TABLE calendar_event;-- \"quoted\"";
    $id4  = make($provost, $evil, '2099-05-06 08:00:00', null);
    check('special characters are stored as plain text (no SQL injection)',
        CalendarEvent::find($id4)['title'] === $evil && total() > 0);

    // ------------------------------------------------------------------ find()
    section('find()');
    $f = CalendarEvent::find($id);
    check('returns an array for an existing id', is_array($f));
    check('returns the right event', (int) $f['event_id'] === $id);
    check('returns the expected columns',
        array_keys($f) === ['event_id', 'title', 'start_date', 'end_date', 'is_important']);
    check('returns null for an id that does not exist', CalendarEvent::find(999999999) === null);
    check('returns null for id 0', CalendarEvent::find(0) === null);

    // ------------------------------------------------------------------- all()
    section('all()');
    $beforeAll = count(CalendarEvent::all());
    $newId = make($provost, 'TEST all()', '2099-06-01 08:00:00', null);
    $all = CalendarEvent::all();
    check('returns an array', is_array($all));
    check('has one more row after a create', count($all) === $beforeAll + 1);
    check('contains the new event', in_array($newId, ids($all), true));
    check('each row has the expected columns',
        array_keys($all[0]) === ['event_id', 'title', 'start_date', 'end_date', 'is_important']);
    $sorted = true;
    for ($i = 1; $i < count($all); $i++) {
        if ($all[$i]['start_date'] < $all[$i - 1]['start_date']) {
            $sorted = false;
        }
    }
    check('is sorted by start date, earliest first', $sorted);
    $withOld = make($provost, 'TEST all() old', '2000-01-01 08:00:00', '2000-01-02 08:00:00');
    check('also contains events that already ended', in_array($withOld, ids(CalendarEvent::all()), true));

    // --------------------------------------------------------------- upcoming()
    section('upcoming()');
    $pastEnded  = make($provost, 'TEST past ended',  '2000-01-01 08:00:00', '2000-01-02 08:00:00');
    $pastNoEnd  = make($provost, 'TEST past no end', '2000-03-01 08:00:00', null);
    $future     = make($provost, 'TEST future',      '2099-01-01 08:00:00', null);
    $ongoing    = make($provost, 'TEST ongoing',     '2000-01-01 08:00:00', '2099-12-31 08:00:00');
    $up         = ids(CalendarEvent::upcoming());
    check('excludes an event that already ended', !in_array($pastEnded, $up, true));
    check('excludes a past event that has no end date', !in_array($pastNoEnd, $up, true));
    check('includes an event in the future', in_array($future, $up, true));
    check('includes an event that is still ongoing', in_array($ongoing, $up, true));
    check('returns fewer or equal rows than all()', count($up) <= count(CalendarEvent::all()));
    $upRows = CalendarEvent::upcoming();
    $sorted = true;
    for ($i = 1; $i < count($upRows); $i++) {
        if ($upRows[$i]['start_date'] < $upRows[$i - 1]['start_date']) {
            $sorted = false;
        }
    }
    check('is sorted by start date, earliest first', $sorted);

    // ----------------------------------------------------------------- update()
    section('update()');
    $uid = make($provost, 'TEST before update', '2099-07-01 08:00:00', '2099-07-02 08:00:00', false);
    $other = make($provost, 'TEST untouched', '2099-07-10 08:00:00', null, false);
    $ret = CalendarEvent::update($uid, 'TEST after update', '2099-08-01 10:00:00', '2099-08-03 18:00:00', true);
    $u = CalendarEvent::find($uid);
    check('returns nothing (void)', $ret === null);
    check('changes the title', $u['title'] === 'TEST after update');
    check('changes the start date', $u['start_date'] === '2099-08-01 10:00:00');
    check('changes the end date', $u['end_date'] === '2099-08-03 18:00:00');
    check('changes important to 1', (int) $u['is_important'] === 1);
    check('keeps the same creator', creator($uid) === $provost);
    check('does not change other events', CalendarEvent::find($other)['title'] === 'TEST untouched');

    CalendarEvent::update($uid, 'TEST after update', '2099-08-01 10:00:00', null, false);
    $u = CalendarEvent::find($uid);
    check('the end date can be cleared back to NULL', $u['end_date'] === null);
    check('important can be changed back to 0', (int) $u['is_important'] === 0);

    $count = total();
    $noError = !throws(fn() => CalendarEvent::update(999999999, 'x', '2099-01-01 00:00:00', null, false));
    check('updating an id that does not exist raises no error', $noError);
    check('updating an id that does not exist changes nothing', total() === $count);

    // ----------------------------------------------------------------- delete()
    section('delete()');
    $did = make($provost, 'TEST to delete', '2099-09-01 08:00:00', null);
    $keep = make($provost, 'TEST to keep', '2099-09-02 08:00:00', null);
    $count = total();
    $ret = CalendarEvent::delete($did);
    check('returns nothing (void)', $ret === null);
    check('removes exactly one row', total() === $count - 1);
    check('the event can no longer be found', CalendarEvent::find($did) === null);
    check('the event is gone from all()', !in_array($did, ids(CalendarEvent::all()), true));
    check('other events are not deleted', CalendarEvent::find($keep) !== null);

    $count = total();
    $noError = !throws(fn() => CalendarEvent::delete(999999999));
    check('deleting an id that does not exist raises no error', $noError);
    check('deleting an id that does not exist changes nothing', total() === $count);

    // -------------------------------------------------------------- provostId()
    section('provostId()');
    check('returns the id for a provost', CalendarEvent::provostId($provost) === $provost);
    check('the id is returned as an integer', is_int(CalendarEvent::provostId($provost)));
    check('returns null for a user who is not a provost', CalendarEvent::provostId($student) === null);
    check('returns null for a user that does not exist', CalendarEvent::provostId(999999999) === null);
    check('returns null for id 0', CalendarEvent::provostId(0) === null);
}

// ------------------------------------------------------------------ set up/run
out('CalendarEvent model - unit test results');
out('Date:  ' . date('Y-m-d H:i:s'));
out('PHP:   ' . PHP_VERSION);

try {
    $pdo = Database::connection();
    out('MySQL: ' . $pdo->query('SELECT VERSION()')->fetchColumn());

    $provost = $pdo->query('SELECT user_id FROM provost LIMIT 1')->fetchColumn();
    $student = $pdo->query('SELECT user_id FROM users WHERE user_id NOT IN (SELECT user_id FROM provost) LIMIT 1')->fetchColumn();
    if ($provost === false || $student === false) {
        out('');
        out('Cannot run: the database has no provost or no other user. Import archershub_seed.sql first.');
        exit(1);
    }

    $countBefore = total();
    $pdo->beginTransaction();
    try {
        runTests((int) $provost, (int) $student);
    } finally {
        $pdo->rollBack();
    }

    section('cleanup');
    check('all test data was rolled back (row count is back to ' . $countBefore . ')', total() === $countBefore);
    $left = (int) $pdo->query("SELECT COUNT(*) FROM calendar_event WHERE title LIKE 'TEST%'")->fetchColumn();
    check('no TEST rows are left in the database', $left === 0);
} catch (Throwable $e) {
    $failed++;
    out('');
    out('[ERROR] The test run stopped: ' . $e->getMessage());
}

out('');
out('---------------------------------------------');
out('Total: ' . ($passed + $failed) . '   Passed: ' . $passed . '   Failed: ' . $failed);
out($failed === 0 ? 'RESULT: ALL TESTS PASSED' : 'RESULT: SOME TESTS FAILED');

$dir = __DIR__ . '/results';
if (!is_dir($dir)) {
    mkdir($dir, 0775, true);
}
file_put_contents($dir . '/CalendarEvent_results.txt', implode("\n", $lines) . "\n");

exit($failed === 0 ? 0 : 1);