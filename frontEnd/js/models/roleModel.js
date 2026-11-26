
/* =========================================
   ROLE MODEL
   Authenticated user roles
========================================= */

const roles = ["student", "faculty", "admin"];

// No role until the PHP session is verified.
let currentRole = null;

const navigationByRole = {

    student: [
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
    ],

    faculty: [
        "Home",
        "View Schedule",
        "University Calendar",
        "Grade Encoding",
        "View Application"
    ],

    admin: [
        "Home",
        "Add / Drop",
        "University Calendar",
        "Account Management",
        "View Records",
        "Make Announcements"
    ]

};


// Set the role after PHP session verification
export function setAuthenticatedRole(role) {

    if (!roles.includes(role)) {
        throw new Error("Invalid authenticated role.");
    }

    currentRole = role;

}


// Get current role
export function getCurrentRole() {
    return currentRole;
}


// Get navigation for current role
export function getNavigation() {

    if (!currentRole) {
        return [];
    }

    return [...navigationByRole[currentRole]];

}


// Check if a page belongs to the current role
export function canAccessPage(pageName) {

    if (!currentRole) {
        return false;
    }

    return navigationByRole[currentRole].includes(pageName);

}


// Get display name
export function getRoleDisplayName() {

    if (currentRole === "faculty") {
        return "TEACHER";
    }

    return currentRole
        ? currentRole.toUpperCase()
        : "UNKNOWN";
}
