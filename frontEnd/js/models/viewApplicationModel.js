
/* =========================================
   VIEW APPLICATION MODEL
========================================= */

const STORAGE_KEY = "archershub_application_demo";

const courses = [
    {
        code: "CCAPDEV",
        sections: ["S11", "S12", "S13", "S14"]
    },
    {
        code: "CSSE101",
        sections: ["S11", "S12"]
    },
    {
        code: "STADVDB",
        sections: ["S13", "S14"]
    },
    {
        code: "GEETHIC",
        sections: ["S11", "S12"]
    }
];

const defaultStudents = [
    {
        id: "12345678",
        name: "Juan Dela Cruz",
        program: "BS CS-ST",
        status: "Enlisted"
    },
    {
        id: "12234567",
        name: "Maria Santos",
        program: "BS CS-NIS",
        status: "Pending"
    },
    {
        id: "12187654",
        name: "Mark Reyes",
        program: "BS IT",
        status: "Enlisted"
    },
    {
        id: "12398765",
        name: "Anne Tan",
        program: "BS CS-ST",
        status: "None"
    }
];

const validStatuses = [
    "Enlisted",
    "Pending",
    "None"
];


// Read saved changes
function readStoredApplications() {

    try {
        const stored = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

        return stored &&
            typeof stored === "object" &&
            !Array.isArray(stored)
            ? stored
            : {};
    } catch {
        return {};
    }
}


// Create a unique key for each section
function getSectionKey(courseCode, sectionCode) {
    return `${courseCode}:${sectionCode}`;
}


// Get courses
export function getCourses() {
    return courses.map(course => course.code);
}


// Get sections for selected course
export function getSections(courseCode) {

    const course = courses.find(
        course => course.code === courseCode
    );

    return course ? [...course.sections] : [];
}


// Get students in a particular section
export function getStudents(courseCode, sectionCode) {

    if (!getSections(courseCode).includes(sectionCode)) {
        return [];
    }

    const stored = readStoredApplications();

    const key = getSectionKey(courseCode, sectionCode);

    const savedStudents = stored[key];

    if (Array.isArray(savedStudents)) {
        return savedStudents.map(student => ({ ...student }));
    }

    // Demo data for the section shown in the screenshot
    if (courseCode === "CCAPDEV" && sectionCode === "S11") {
        return defaultStudents.map(student => ({ ...student }));
    }

    return [];
}


// Update an existing student's status
export function updateStudentStatus(
    courseCode,
    sectionCode,
    studentId,
    newStatus
) {

    if (!getSections(courseCode).includes(sectionCode)) {
        return {
            success: false,
            message: "Please select a valid course and section."
        };
    }

    if (!validStatuses.includes(newStatus)) {
        return {
            success: false,
            message: "Invalid enrollment status."
        };
    }

    const students = getStudents(courseCode, sectionCode);

    const student = students.find(
        student => student.id === studentId
    );

    if (!student) {
        return {
            success: false,
            message: "Student ID not found in this section."
        };
    }

    student.status = newStatus;

    const stored = readStoredApplications();

    stored[getSectionKey(courseCode, sectionCode)] = students;

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(stored)
        );
    } catch {
        return {
            success: false,
            message: "Unable to save changes in this browser."
        };
    }

    return {
        success: true,
        message: `${student.name}'s status updated to ${newStatus}.`
    };
}
