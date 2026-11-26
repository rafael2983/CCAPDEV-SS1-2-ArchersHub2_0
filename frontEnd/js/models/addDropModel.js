
/* =========================================
   ADD / DROP MODEL
   MariaDB Integration
========================================= */

// =========================================
// STATE
// =========================================

let courses = [];
let enrolledCourses = [];

let selectedCampus = "Laguna";
let pendingChanges = [];

const API_BASE = "/archersHub_fixed/public/api/";


// =========================================
// FETCH AVAILABLE COURSES
// =========================================

export async function loadCourses() {

    const response = await fetch(
        API_BASE + "enrollment.php",
        {
            method: "GET",
            credentials: "same-origin"
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Unable to load courses."
        );
    }

    courses = data.courses.map(course => ({
        ...course,
        section_id: Number(course.section_id),
        status: "available"
    }));

    return courses;
}


// =========================================
// FETCH STUDENT ENROLLMENTS
// =========================================

export async function loadEnrollments() {

    const response = await fetch(
        API_BASE + "enrollment.php?view=mine",
        {
            method: "GET",
            credentials: "same-origin"
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Unable to load enrollments."
        );
    }

    enrolledCourses = data.enrollments.map(course => ({
        ...course,
        section_id: Number(course.section_id),
        status: "enrolled"
    }));

    return enrolledCourses;
}


// =========================================
// GETTERS
// =========================================

export function getCourses() {

    return courses
        .filter(course =>
            course.campus === selectedCampus
        )
        .map(course => {

            const isEnrolled = enrolledCourses.some(
                enrolled =>
                    enrolled.section_id === course.section_id
            );

            const hasOtherSection = enrolledCourses.some(
                enrolled =>
                    enrolled.code === course.code &&
                    enrolled.section_id !== course.section_id
            );

            let status = "available";

            if (isEnrolled) {
                status = "enrolled";
            } else if (hasOtherSection) {
                status = "change";
            }

            return {
                ...course,
                status
            };
        });
}

export function getCampus() {
    return selectedCampus;
}

export function setCampus(campus) {
    selectedCampus = campus;
}

export function getEnrolledCourses() {
    return [...enrolledCourses];
}

export function getChanges() {
    return pendingChanges.map(change => ({
        ...change
    }));
}


// =========================================
// QUEUE ENROLLMENT CHANGES
// =========================================

export function addChange(sectionId, action) {

    const id = Number(sectionId);

    const course = courses.find(
        course => course.section_id === id
    );

    if (!course) {
        throw new Error("Selected section not found.");
    }

    const allowedActions = ["Add", "Drop", "Change"];

    if (!allowedActions.includes(action)) {
        throw new Error("Invalid enrollment action.");
    }

    const currentEnrollment = enrolledCourses.find(
        enrolled => enrolled.section_id === id
    );

    const otherSection = enrolledCourses.find(
        enrolled =>
            enrolled.code === course.code &&
            enrolled.section_id !== id
    );

    let sourceSectionId = null;

    if (action === "Add") {

        if (currentEnrollment || otherSection) {
            throw new Error(
                "You are already enrolled in this course."
            );
        }

    } else if (action === "Drop") {

        if (!currentEnrollment) {
            throw new Error(
                "You are not enrolled in this section."
            );
        }

    } else if (action === "Change") {

        if (!otherSection) {
            throw new Error(
                "No existing section found to change."
            );
        }

        sourceSectionId = otherSection.section_id;
    }

    // Only one pending request per course.
    pendingChanges = pendingChanges.filter(
        change => change.code !== course.code
    );

    const change = {
        section_id: id,
        source_section_id: sourceSectionId,
        code: course.code,
        name: course.name,
        section: course.section,
        action
    };

    pendingChanges.push(change);

    return change;
}


// =========================================
// CLEAR PENDING CHANGES
// =========================================

export function clearChanges() {
    pendingChanges = [];
}


// =========================================
// REMOVE ONE PENDING CHANGE
// =========================================

export function removeChange(sectionId) {

    const id = Number(sectionId);

    pendingChanges = pendingChanges.filter(
        change => change.section_id !== id
    );
}


// =========================================
// SUBMIT ONE ENROLLMENT ACTION
// =========================================

export async function submitChange(change) {

    // Retrieve the current session and CSRF token.
    const sessionResponse = await fetch(
        API_BASE + "session.php",
        {
            method: "GET",
            credentials: "same-origin"
        }
    );

    const session = await sessionResponse.json();

    if (!sessionResponse.ok || !session.success) {
        throw new Error(
            "Your session has expired. Please log in again."
        );
    }

    const action = change.action.toLowerCase();

    const payload = {
        action,
        section_id: change.section_id
    };

    if (action === "change") {
        payload.source_section_id =
            change.source_section_id;
    }

    const response = await fetch(
        API_BASE + "enrollmentActions.php",
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": session.csrf_token
            },
            body: JSON.stringify(payload)
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Enrollment request failed."
        );
    }

    return result;
}
