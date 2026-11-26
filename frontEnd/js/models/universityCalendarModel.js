
/* =========================================
   UNIVERSITY CALENDAR MODEL
========================================= */

// Mock academic calendar events
const calendarEvents = [
    {
        id: 1,
        startDate: "2026-09-01",
        endDate: "2026-09-05",
        event: "Term 1 Enrollment Period",
        important: true
    },
    {
        id: 2,
        startDate: "2026-09-07",
        endDate: "2026-09-07",
        event: "Start of Term 1 Classes",
        important: true
    },
    {
        id: 3,
        startDate: "2026-09-14",
        endDate: "2026-09-18",
        event: "Course Adjustment Period",
        important: true
    },
    {
        id: 4,
        startDate: "2026-10-05",
        endDate: "2026-10-09",
        event: "University Organization Activities",
        important: false
    },
    {
        id: 5,
        startDate: "2026-10-26",
        endDate: "2026-10-31",
        event: "Midterm Examination Period",
        important: true
    },
    {
        id: 6,
        startDate: "2026-11-12",
        endDate: "2026-11-12",
        event: "University Academic Forum",
        important: false
    },
    {
        id: 7,
        startDate: "2026-12-07",
        endDate: "2026-12-12",
        event: "Final Examination Period",
        important: true
    },
    {
        id: 8,
        startDate: "2026-12-18",
        endDate: "2026-12-18",
        event: "Release of Final Grades",
        important: true
    },
    {
        id: 9,
        startDate: "2027-01-04",
        endDate: "2027-01-08",
        event: "Term 2 Enrollment Period",
        important: true
    },
    {
        id: 10,
        startDate: "2027-01-11",
        endDate: "2027-01-11",
        event: "Start of Term 2 Classes",
        important: true
    }
];


// GET ALL EVENTS
export function getAllEvents() {

    return calendarEvents
        .map(event => ({ ...event }))
        .sort((a, b) =>
            a.startDate.localeCompare(b.startDate)
        );
}
