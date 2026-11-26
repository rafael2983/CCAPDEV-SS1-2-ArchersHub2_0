
/* =========================================
   COURSE WITHDRAWAL MODEL
========================================= */

// Mock enrolled courses
const enrolledCourses = [
    {
        code: "CBAPDEV",
        name: "Web Application Development",
        section: "XZ01"
    },
    {
        code: "GEETHIC",
        name: "Ethics",
        section: "XZ09"
    },
    {
        code: "SAS3000",
        name: "Student Affairs Services 3000",
        section: "X05"
    }
];

// Selected courses awaiting submission
let selectedCourses = [];

// Frontend-only history of submitted requests
let submittedRequests = [];

export function getEnrolledCourses() {
    return enrolledCourses.map(course => ({ ...course }));
}

export function getSelectedCourses() {
    return selectedCourses.map(course => ({ ...course }));
}

export function getSubmittedRequests() {
    return submittedRequests.map(course => ({ ...course }));
}

// Add course to withdrawal request
export function selectCourse(code) {

    const course = enrolledCourses.find(
        course => course.code === code
    );

    if (!course) {
        return {
            success: false,
            message: "Course not found."
        };
    }

    const alreadySelected = selectedCourses.some(
        course => course.code === code
    );

    const alreadySubmitted = submittedRequests.some(
        course => course.code === code
    );

    if (alreadySelected || alreadySubmitted) {
        return {
            success: false,
            message: "This course already has a withdrawal request."
        };
    }

    selectedCourses.push({ ...course });

    return {
        success: true,
        message: `${code} selected for withdrawal.`
    };
}

// Remove course before submission
export function removeCourse(code) {

    selectedCourses = selectedCourses.filter(
        course => course.code !== code
    );

}

// Submit withdrawal request
export function submitWithdrawal(reason) {

    if (selectedCourses.length === 0) {
        return {
            success: false,
            message: "Please select a course first."
        };
    }

    const submitted = selectedCourses.map(course => ({
        ...course,
        reason,
        status: "Submitted"
    }));

    submittedRequests.push(...submitted);

    selectedCourses = [];

    return {
        success: true,
        count: submitted.length,
        message: `${submitted.length} demo withdrawal request(s) submitted.`
    };
}
