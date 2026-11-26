
/* =========================================
   PROGRAM EXCHANGE MODEL
========================================= */

// Mock student information
const currentProgram = {
    code: "BSIT",
    name: "BS Information Technology"
};

// Mock target programs for frontend testing
const availablePrograms = [
    {
        code: "BSCS",
        name: "BS Computer Science"
    },
    {
        code: "BSIS",
        name: "BS Information Systems"
    },
    {
        code: "BSCS-ST",
        name: "BS Computer Science - Software Technology"
    },
    {
        code: "BSCS-NIS",
        name: "BS Computer Science - Network and Information Security"
    },
    {
        code: "BSMGT",
        name: "BS Management"
    }
];

let applications = [];
let nextApplicationId = 1;


// CURRENT PROGRAM
export function getCurrentProgram() {
    return { ...currentProgram };
}


// AVAILABLE TARGET PROGRAMS
export function getAvailablePrograms() {
    return availablePrograms
        .filter(program => program.code !== currentProgram.code)
        .map(program => ({ ...program }));
}


// APPLICATIONS
export function getApplications() {
    return applications.map(application => ({ ...application }));
}


// SUBMIT APPLICATION
export function submitApplication(targetCode, reason) {

    const target = availablePrograms.find(
        program => program.code === targetCode
    );

    if (!target) {
        return {
            success: false,
            message: "Please select a valid target program."
        };
    }

    if (targetCode === currentProgram.code) {
        return {
            success: false,
            message: "You are already enrolled in this program."
        };
    }

    if (!reason.trim()) {
        return {
            success: false,
            message: "Please provide a reason for your application."
        };
    }

    // Prevent duplicate pending applications
    const duplicate = applications.some(application =>
        application.targetCode === targetCode &&
        application.status === "Pending"
    );

    if (duplicate) {
        return {
            success: false,
            message: "You already have a pending application for this program."
        };
    }

    const application = {
        id: nextApplicationId++,
        targetCode: target.code,
        targetName: target.name,
        reason: reason.trim(),
        dateApplied: new Date().toISOString().slice(0, 10),
        status: "Pending"
    };

    applications.push(application);

    return {
        success: true,
        message: "Demo program exchange application submitted."
    };
}


// CANCEL APPLICATION
export function cancelApplication(id) {

    const application = applications.find(
        application => application.id === id
    );

    if (!application || application.status !== "Pending") {
        return {
            success: false,
            message: "This application cannot be cancelled."
        };
    }

    application.status = "Cancelled";

    return {
        success: true,
        message: "Demo application cancelled."
    };
}
