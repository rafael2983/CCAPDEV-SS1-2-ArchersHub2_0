
/* =========================================
   GRADE ENCODING MODEL
   Database-connected version
========================================= */

const API_URL =
    "/archershub_fixed/public/api/facultyGrades.php";

const ACTIONS_API_URL =
    "/archershub_fixed/public/api/facultyGradeActions.php";

const SESSION_API_URL =
    "/archershub_fixed/public/api/session.php";

let assignedClasses = [];
let activeTerm = null;


/* =========================================
   VALID GRADES
========================================= */

export const VALID_GRADES = [
    "4.0", "3.5", "3.0", "2.5",
    "2.0", "1.5", "1.0", "0.0"
];


/* =========================================
   API REQUEST HELPER
========================================= */

async function fetchGradeData(params) {

    const query = new URLSearchParams(params);

    const response = await fetch(
        `${API_URL}?${query.toString()}`,
        {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ||
            "Unable to retrieve grade information."
        );
    }

    return data;
}


/* =========================================
   LOAD ASSIGNED CLASSES
========================================= */

export async function loadAssignedClasses() {

    assignedClasses = [];
    activeTerm = null;

    const data = await fetchGradeData({
        view: "classes"
    });

    assignedClasses = data.classes.map(item => ({
        ...item,
        section_id: Number(item.section_id),
        enrolled_count: Number(item.enrolled_count),
        encoded_count: Number(item.encoded_count),
        finalized_count: Number(item.finalized_count)
    }));

    activeTerm = data.term ?? null;

    return getAssignedClasses();
}


/* =========================================
   GET ASSIGNED CLASSES
========================================= */

export function getAssignedClasses() {

    return assignedClasses.map(item => ({
        ...item
    }));
}


/* =========================================
   GET ACTIVE TERM
========================================= */

export function getActiveTerm() {

    return activeTerm
        ? { ...activeTerm }
        : null;
}


/* =========================================
   GET COURSES
========================================= */

export function getCourses() {

    const uniqueCourses = new Map();

    assignedClasses.forEach(item => {

        if (!uniqueCourses.has(item.code)) {

            uniqueCourses.set(item.code, {
                code: item.code,
                name: item.name
            });
        }
    });

    return [...uniqueCourses.values()];
}


/* =========================================
   GET SECTIONS
========================================= */

export function getSections(courseCode) {

    return assignedClasses
        .filter(item => item.code === courseCode)
        .map(item => ({
            section_id: item.section_id,
            code: item.section,
            campus: item.campus,
            enrolled_count: item.enrolled_count,
            encoded_count: item.encoded_count,
            finalized_count: item.finalized_count,
            status: item.section_status
        }));
}


/* =========================================
   GET CLASS INFORMATION
========================================= */

export function getClass(sectionId) {

    const selectedClass = assignedClasses.find(
        item => item.section_id === Number(sectionId)
    );

    return selectedClass
        ? { ...selectedClass }
        : null;
}


/* =========================================
   LOAD STUDENT ROSTER
========================================= */

export async function loadStudents(sectionId) {

    const id = Number(sectionId);

    if (!Number.isInteger(id) || id < 1) {
        throw new Error("Invalid section ID.");
    }

    const data = await fetchGradeData({
        view: "roster",
        section_id: id
    });

    return {
        class: data.class,

        students: data.students.map(student => ({

            enrollment_id: Number(student.enrollment_id),

            student_id: Number(student.student_id),

            id: String(student.student_number),

            name: student.student_name,

            grade: student.grade === null
                ? ""
                : Number(student.grade).toFixed(1),

            grade_status:
                student.grade_status ?? "ungraded",

            finalized_at:
                student.finalized_at ?? null

        })),

        total_students: Number(data.total_students)
    };
}



/* =========================================
   SAVE DRAFT GRADES
========================================= */

export async function saveGrades(sectionId, grades) {

    // VALIDATE SECTION ID
    const id = Number(sectionId);

    if (!Number.isSafeInteger(id) || id < 1) {

        throw new Error("Invalid section ID.");

    }


    // VALIDATE GRADE ARRAY
    if (
        !Array.isArray(grades) ||
        grades.length < 1 ||
        grades.length > 500
    ) {

        throw new Error(
            "Submit between 1 and 500 grade entries."
        );

    }


    // VALIDATE AND NORMALIZE GRADE ENTRIES
    const seenEnrollmentIds = new Set();

    const entries = grades.map(entry => {

        if (!entry || typeof entry !== "object") {

            throw new Error("Invalid grade entry.");

        }

        const enrollmentId = Number(entry.enrollment_id);

        if (
            !Number.isSafeInteger(enrollmentId) ||
            enrollmentId < 1
        ) {

            throw new Error("Invalid enrollment ID.");

        }

        if (!VALID_GRADES.includes(entry.grade)) {

            throw new Error("Invalid numerical grade.");

        }

        if (seenEnrollmentIds.has(enrollmentId)) {

            throw new Error(
                "Duplicate enrollment ID in grade submission."
            );

        }

        seenEnrollmentIds.add(enrollmentId);

        return {
            enrollment_id: enrollmentId,
            grade: entry.grade
        };

    });


    // RETRIEVE AUTHENTICATED SESSION
    const sessionResponse = await fetch(
        SESSION_API_URL,
        {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        }
    );

    const session = await sessionResponse.json();

    if (!sessionResponse.ok || !session.success) {

        throw new Error(
            session.message ||
            "Unable to verify your session."
        );

    }

    if (session.user?.role !== "faculty") {

        throw new Error("Faculty access required.");

    }

    if (!session.csrf_token) {

        throw new Error(
            "Unable to retrieve security token."
        );

    }


    // SUBMIT DRAFT GRADES
    const response = await fetch(
        ACTIONS_API_URL,
        {
            method: "POST",
            credentials: "same-origin",
            cache: "no-store",

            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": session.csrf_token
            },

            body: JSON.stringify({
                action: "save",
                section_id: id,
                grades: entries
            })
        }
    );

    const data = await response.json();


    // HANDLE API REJECTION
    if (!response.ok || !data.success) {

        throw new Error(
            data.message ||
            "Unable to save draft grades."
        );

    }


    // RETURN SUCCESSFUL API RESPONSE
    return data;

}


/* =========================================
   TEMPORARY COMPATIBILITY FUNCTION
   Removed during Controller integration
========================================= */

export function getStudents() {

    return [];

}

