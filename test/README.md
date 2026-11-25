# Unit tests

Model tested: `backEnd/models/CalendarEvent.php` (all 7 functions).

| File | What it is |
|---|---|
| `CalendarEventTest.php` | The test script (54 checks) |
| `results/CalendarEvent_results.txt` | Output of the last run |

## How to run

1. Make sure the database is loaded (`archershub_query.sql`, then `archershub_seed.sql`)
   and `backEnd/config/config.php` is set up.
2. Open a terminal in the project folder and run:

   - **XAMPP on Windows:** open the XAMPP Control Panel, click **Shell**, then:
     `cd C:\xampp\htdocs\archershub` and `php tests/CalendarEventTest.php`
   - **Linux / Mac:** `php tests/CalendarEventTest.php`

3. The result is printed on screen and saved to `tests/results/CalendarEvent_results.txt`.

The test only changes data inside a transaction that is rolled back at the end,
so your database is left exactly as it was.