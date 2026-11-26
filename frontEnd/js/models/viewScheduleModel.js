
/* =========================================
   VIEW SCHEDULE MODEL
========================================= */

const terms = [
    {
        id: "2026-T1",
        name: "AY 2026-2027 Term 1"
    },
    {
        id: "2026-T2",
        name: "AY 2026-2027 Term 2"
    }
];

const timeSlots = [
    "7:30 AM",
    "9:15 AM",
    "11:00 AM",
    "1:00 PM",
    "2:45 PM",
    "4:30 PM"
];

const days = [
    "Mon", "Tue", "Wed",
    "Thu", "Fri", "Sat"
];

// Mock class schedules
const schedules = {

    "2026-T1": [
        {
            code: "CBAPDEV",
            name: "Web Application Development",
            section: "XZ01",
            day: "Mon",
            slot: "7:30 AM",
            time: "7:30 AM - 9:00 AM",
            room: "G304"
        },
        {
            code: "CBAPDEV",
            name: "Web Application Development",
            section: "XZ01",
            day: "Thu",
            slot: "7:30 AM",
            time: "7:30 AM - 9:00 AM",
            room: "G304"
        },
        {
            code: "GEETHIC",
            name: "Ethics",
            section: "XZ09",
            day: "Tue",
            slot: "9:15 AM",
            time: "9:15 AM - 10:45 AM",
            room: "LR302"
        },
        {
            code: "GEETHIC",
            name: "Ethics",
            section: "XZ09",
            day: "Fri",
            slot: "9:15 AM",
            time: "9:15 AM - 10:45 AM",
            room: "LR302"
        },
        {
            code: "SAS3000",
            name: "Student Affairs Services 3000",
            section: "X05",
            day: "Sat",
            slot: "11:00 AM",
            time: "11:00 AM - 12:30 PM",
            room: "EXR004"
        }
    ],

    "2026-T2": [
        {
            code: "ITNET01",
            name: "Computer Networks",
            section: "S11",
            day: "Mon",
            slot: "9:15 AM",
            time: "9:15 AM - 10:45 AM",
            room: "G305"
        },
        {
            code: "ITNET01",
            name: "Computer Networks",
            section: "S11",
            day: "Thu",
            slot: "9:15 AM",
            time: "9:15 AM - 10:45 AM",
            room: "G305"
        },
        {
            code: "CCPROG2",
            name: "Programming 2",
            section: "S12",
            day: "Wed",
            slot: "1:00 PM",
            time: "1:00 PM - 2:30 PM",
            room: "G404"
        }
    ]
};


// GET AVAILABLE TERMS
export function getTerms() {
    return terms.map(term => ({ ...term }));
}


// GET TIME SLOTS
export function getTimeSlots() {
    return [...timeSlots];
}


// GET DAYS
export function getDays() {
    return [...days];
}


// GET SCHEDULE FOR SELECTED TERM
export function getSchedule(termId) {

    return (schedules[termId] || [])
        .map(classItem => ({ ...classItem }));
}
