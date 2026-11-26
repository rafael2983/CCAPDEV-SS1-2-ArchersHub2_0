
/* =========================================
   SPECIAL CLASS MODEL
========================================= */

const courses = [
    {
        code: "CBAPDEV",
        name: "Web Application Development",
        campus: "Laguna",
        applicants: 7
    },
    {
        code: "GEETHIC",
        name: "Ethics",
        campus: "Manila",
        applicants: 12
    },
    {
        code: "SAS2000",
        name: "Student Affairs Services 2000",
        campus: "Laguna",
        applicants: 3
    },
    {
        code: "ITNET01",
        name: "Introduction to Computer Networks",
        campus: "Manila",
        applicants: 5
    },
    {
        code: "CCPROG3",
        name: "Computer Programming 3",
        campus: "Laguna",
        applicants: 4
    }
];

let selectedCampus = "Either";
let requests = [];
let nextRequestId = 1;

// GET ALL COURSES
export function getAllCourses() {
    return [...courses];
}

// FILTER COURSES BY CAMPUS
export function getCourses() {
    if (selectedCampus === "Either") {
        return [...courses];
    }

    return courses.filter(course =>
        course.campus === selectedCampus
    );
}

// CAMPUS STATE
export function getCampus() {
    return selectedCampus;
}

export function setCampus(campus) {
    if (["Either", "Laguna", "Manila"].includes(campus)) {
        selectedCampus = campus;
    }
}

// REQUESTS
export function getRequests() {
    return requests.map(request => ({ ...request }));
}

export function addRequest(code, campus, reason) {

    const course = courses.find(c => c.code === code);

    if (!course) {
        return { success: false, message: "Course not found." };
    }

    if (!reason.trim()) {
        return { success: false, message: "Please enter a reason." };
    }

    if (campus !== "Either" && campus !== course.campus) {
        return {
            success: false,
            message: "This course is not offered at that campus."
        };
    }

    const duplicate = requests.some(request =>
        request.code === code
    );

    if (duplicate) {
        return {
            success: false,
            message: "You have already requested this course."
        };
    }

    requests.push({
        id: nextRequestId++,
        code: course.code,
        name: course.name,
        campus: campus === "Either" ? course.campus : campus,
        reason: reason.trim(),
        status: "Draft"
    });

    return {
        success: true,
        message: "Special class request added."
    };
}

// WITHDRAW REQUESTS
export function withdrawRequests(ids) {

    requests = requests.filter(request =>
        !ids.includes(request.id)
    );

}

// SUBMIT DRAFT REQUESTS
export function submitRequests() {

    const drafts = requests.filter(request =>
        request.status === "Draft"
    );

    drafts.forEach(request => {
        request.status = "Submitted";
    });

    return drafts.length;
}
