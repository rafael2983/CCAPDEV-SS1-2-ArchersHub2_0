
/* =========================================
   DASHBOARD MODEL
========================================= */

// Temporary student information
const student = {
    name: "Student Name",
    id: "ID12345678",
    role: "STUDENT"
};


// Student sidebar navigation
const studentNavigation = [

    "Home",
    "Enlistment",
    "Add / Drop",
    "Special Class",
    "Course Withdrawal",
    "Program Exchange",
    "Curriculum Progression",
    "View Schedule",
    "View Records",
    "University Calendar"

];


// Retrieve student information
export function getStudent() {
    return student;
}


// Retrieve navigation options
export function getNavigation() {
    return studentNavigation;
}


// Retrieve current role
export function getCurrentRole() {
    return student.role;
}
