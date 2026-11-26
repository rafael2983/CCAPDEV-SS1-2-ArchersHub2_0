
/* =========================================
   ENLISTMENT MODEL
========================================= */

const courses = [
    {
        id: 1,
        code: "CCAPDEV",
        name: "Web Application Development",
        campus: "Laguna",
        section: "none",
        meetings: []
    },
    {
        id: 2,
        code: "GEWORLD",
        name: "The Contemporary World",
        campus: "Laguna",
        section: "XZ08",
        meetings: [
            {
                day: "MON",
                time: "07:30PM-09:00PM",
                room: "online"
            },
            {
                day: "THU",
                time: "07:30PM-09:00PM",
                room: "LR302"
            }
        ]
    },
    {
        id: 3,
        code: "GEETHIC",
        name: "Ethics",
        campus: "Laguna",
        section: "XZ09",
        meetings: [
            {
                day: "MON",
                time: "09:15PM-10:45PM",
                room: "online"
            },
            {
                day: "THU",
                time: "09:15PM-10:45PM",
                room: "LR302"
            }
        ]
    },
    {
        id: 4,
        code: "SAS1000",
        name: "Student Affairs Services 1000",
        campus: "Laguna",
        section: "XZ12",
        meetings: [
            {
                day: "TUE",
                time: "10:00AM-04:00PM",
                room: "online"
            }
        ]
    },
    {
        id: 5,
        code: "LCLSONE",
        name: "Lasallian Studies 1",
        campus: "Laguna",
        section: "XB1A",
        meetings: [
            {
                day: "SAT",
                time: "09:15AM-10:45AM",
                room: "EXR004"
            }
        ]
    },

    // Mock Manila campus offerings
    {
        id: 6,
        code: "CCPROG2",
        name: "Programming 2",
        campus: "Manila",
        section: "S11",
        meetings: [
            {
                day: "MON",
                time: "09:15AM-10:45AM",
                room: "G304"
            },
            {
                day: "THU",
                time: "09:15AM-10:45AM",
                room: "G304"
            }
        ]
    },
    {
        id: 7,
        code: "ITNET01",
        name: "Computer Networks",
        campus: "Manila",
        section: "S12",
        meetings: [
            {
                day: "TUE",
                time: "01:00PM-02:30PM",
                room: "G305"
            }
        ]
    }
];

const STORAGE_KEY = "archershub_enlistment_draft";

let chosenCourses = [];


// READ SAVED DRAFT
export function loadDraft() {

    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) return;

        const validIds = saved.filter(id =>
            courses.some(course => course.id === id)
        );

        chosenCourses = [...new Set(validIds)];

    } catch (error) {
        console.error("Unable to load draft:", error);
        chosenCourses = [];
    }
}


// GET COURSES
export function getCourses(campus, search, sort) {

    let result = courses.filter(
        course => course.campus === campus
    );

    const query = search.trim().toLowerCase();

    if (query) {
        result = result.filter(course =>
            course.code.toLowerCase().includes(query) ||
            course.name.toLowerCase().includes(query)
        );
    }

    result.sort((a, b) => {

        switch (sort) {
            case "code-desc":
                return b.code.localeCompare(a.code);

            case "name-asc":
                return a.name.localeCompare(b.name);

            case "name-desc":
                return b.name.localeCompare(a.name);

            default:
                return a.code.localeCompare(b.code);
        }
    });

    return result;
}


// GET CHOSEN COURSES
export function getChosenCourses() {

    return chosenCourses
        .map(id => courses.find(course => course.id === id))
        .filter(Boolean);
}


// CHECK IF CHOSEN
export function isChosen(id) {
    return chosenCourses.includes(id);
}


// ADD COURSE
export function addCourse(id) {

    if (!courses.some(course => course.id === id)) {
        return;
    }

    if (!chosenCourses.includes(id)) {
        chosenCourses.push(id);
    }
}


// REMOVE COURSE
export function removeCourse(id) {

    chosenCourses = chosenCourses.filter(
        courseId => courseId !== id
    );
}


// SAVE DRAFT
export function saveDraft() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chosenCourses)
    );
}


// SUBMIT DEMO
export function submitEnlistment() {

    const submitted = getChosenCourses();

    localStorage.setItem(
        "archershub_enlistment_submitted",
        JSON.stringify(submitted)
    );

    return submitted;
}
