
/* =========================================
   CURRICULUM PROGRESSION MODEL
========================================= */

// Mock curriculum courses
const courses = [
    {
        code: "CCPROG1",
        name: "Introduction to Programming",
        category: "Major",
        year: 1,
        term: 1,
        units: 3,
        prerequisites: []
    },
    {
        code: "CCPROG2",
        name: "Programming 2",
        category: "Major",
        year: 1,
        term: 2,
        units: 3,
        prerequisites: ["CCPROG1"]
    },
    {
        code: "CBAPDEV",
        name: "Web Application Development",
        category: "Major",
        year: 2,
        term: 1,
        units: 3,
        prerequisites: ["CCPROG2"]
    },
    {
        code: "GEETHIC",
        name: "Ethics",
        category: "GE",
        year: 1,
        term: 2,
        units: 3,
        prerequisites: []
    },
    {
        code: "LCLSONE",
        name: "Lasallian Studies 1",
        category: "GE",
        year: 1,
        term: 1,
        units: 1,
        prerequisites: []
    }
];

// Mock completed courses
const completedCourses = [
    "CCPROG1",
    "LCLSONE"
];

// Retrieve all courses with calculated statuses
export function getCourses() {

    return courses.map(course => {

        let status;

        if (completedCourses.includes(course.code)) {

            status = "Taken";

        } else {

            const prerequisitesMet =
                course.prerequisites.every(code =>
                    completedCourses.includes(code)
                );

            status = prerequisitesMet
                ? "Can take now"
                : "Needs prerequisite";
        }

        return {
            ...course,
            prerequisites: [...course.prerequisites],
            status
        };
    });
}


// Calculate curriculum progress
export function getProgress() {

    const totalUnits = courses.reduce(
        (total, course) => total + course.units,
        0
    );

    const completedUnits = courses
        .filter(course =>
            completedCourses.includes(course.code)
        )
        .reduce(
            (total, course) => total + course.units,
            0
        );

    const percentage = totalUnits > 0
        ? (completedUnits / totalUnits) * 100
        : 0;

    return {
        totalUnits,
        completedUnits,
        percentage
    };
}


// Filter courses by status
export function getFilteredCourses(status) {

    const allCourses = getCourses();

    if (status === "All") {
        return allCourses;
    }

    return allCourses.filter(
        course => course.status === status
    );
}
