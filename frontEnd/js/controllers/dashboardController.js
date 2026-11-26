
/* =========================================
   DASHBOARD CONTROLLER
========================================= */

// import * as DashboardModel from "../models/dashboardModel.js";
import * as RoleModel from "../models/roleModel.js";

import {
    initializeGradeEncoding,
    canLeaveGradeEncoding,
    cleanupGradeEncoding
} from "./gradeEncodingController.js";

import {
    renderStudent,
    renderRole,
    renderNavigation,
    renderPage,
    setActiveNavigation,
    showNotice
} from "../views/dashboardView.js";

import {
    initializeAddDrop
} from "./addDropController.js";

import {
    initializeSpecialClass
} from "./specialClassController.js";

import {
    initializeCourseWithdrawal
} from "./courseWithdrawalController.js";

import {
    initializeProgramExchange
} from "./programExchangeController.js";

import {
    initializeCurriculumProgression
} from "./curriculumProgressionController.js";

import {
    initializeViewSchedule
} from "./viewScheduleController.js";

import {
    initializeViewRecords
} from "./viewRecordsController.js";

import {
    initializeEnlistment
} from "./enlistmentController.js";

import {
    initializeUniversityCalendar
} from "./universityCalendarController.js";

import {
    initializeViewApplication
} from "./viewApplicationController.js";

import {
    initializeAccountManagement
} from "./accountManagementController.js";

import {
    initializeMakeAnnouncements
} from "./makeAnnouncementsController.js";

import { logoutUser }
    from "../models/sessionModel.js";


import {
    getPublishedAnnouncements
} from "../models/makeAnnouncementsModel.js";

import {
    renderHomeAnnouncements,
    showHomeAnnouncementsError
} from "../views/homeAnnouncementsView.js";


export function initializeDashboard(user) {

    // PHP has already verified this session.
    RoleModel.setAuthenticatedRole(user.role);

    // Use the authenticated account information.
    const student = {
        name: user.name,
        id: user.school_id,
        role: user.role
    };

    const navigation = RoleModel.getNavigation();

    const sidebar = document.getElementById("sidebarNavigation");
    const logoutButton = document.getElementById("logoutButton");
    const roleSwitcher = document.getElementById("roleSwitcher");
    const themeToggle = document.getElementById("themeToggle");

    // Initialize sidebar based on current role
    renderNavigation(navigation);

    // Render user information
    document.getElementById("studentID").textContent = student.id;

    // Display current demonstration role
    renderRole(RoleModel.getRoleDisplayName());


    // =====================================
    // PAGE SWITCHING
    // =====================================

    function navigateTo(pageName) {

        // Prevent navigation to pages outside the current role
        if (!RoleModel.canAccessPage(pageName)) {

            showNotice(
                "This page is not available for the selected role."
            );

            return;
        }


        // Protect unsaved grade changes.
        if (!canLeaveGradeEncoding()) {

            return;

        }


        // Clean up the previous Grade Encoding instance.
        cleanupGradeEncoding();


        // Display selected page
        renderPage(pageName);

        // Remaining existing code continues here...

        // Highlight selected sidebar item
        const selectedButton = [...sidebar.querySelectorAll(".nav-item")]
            .find(button => button.dataset.page === pageName);

        if (selectedButton) {
            setActiveNavigation(selectedButton);
        }

        // Initialize functionality for selected page
        if (pageName === "Home") {
            initializeHome();
        }

        if (pageName === "Add / Drop") {
            initializeAddDrop();
        }

        if (pageName === "Special Class") {
            initializeSpecialClass();
        }

        if (pageName === "Course Withdrawal") {
            initializeCourseWithdrawal();
        }

        if (pageName === "Program Exchange") {
            initializeProgramExchange();
        }

        if (pageName === "Curriculum Progression") {
            initializeCurriculumProgression();
        }

        if (pageName === "View Schedule") {
            initializeViewSchedule();
        }

        if (pageName === "View Records") {
            initializeViewRecords();
        }

        if (pageName === "Enlistment") {
            initializeEnlistment();
        }

        if (pageName === "University Calendar") {
            initializeUniversityCalendar();
        }

        if (pageName === "Grade Encoding") {
            initializeGradeEncoding();
        }

        if (pageName === "View Application") {
            initializeViewApplication();
        }

        if (pageName === "Account Management") {
            initializeAccountManagement();
        }

        if (pageName === "Make Announcements") {
            initializeMakeAnnouncements();
        }

    }



    /* =========================================
       HOME INITIALIZATION
    ========================================= */

    async function initializeHome() {

        const studentName = document.getElementById("studentName");

        if (studentName) {
            studentName.textContent = student.name;
        }

        const filterButton = document.getElementById("filterButton");

        if (filterButton) {
            filterButton.addEventListener("click", () => {
                showNotice(
                    "Dashboard filters will be implemented later."
                );
            });
        }


        // =====================================
        // LOAD PUBLISHED ANNOUNCEMENTS
        // =====================================

        const announcementContainer =
            document.getElementById("homeAnnouncementsList");

        if (!announcementContainer) return;

        try {

            const announcements =
                await getPublishedAnnouncements();

            // Avoid updating the wrong page if the user
            // navigated away while the API was loading.
            if (
                !announcementContainer.isConnected ||
                document.getElementById("homeAnnouncementsList")
                !== announcementContainer
            ) {
                return;
            }

            renderHomeAnnouncements(announcements);

        } catch (error) {

            if (
                !announcementContainer.isConnected ||
                document.getElementById("homeAnnouncementsList")
                !== announcementContainer
            ) {
                return;
            }

            console.error(
                "Unable to load Home announcements:",
                error
            );

            showHomeAnnouncementsError(
                "Unable to load announcements. Please try again."
            );
        }

    }



    // =====================================
    // SIDEBAR NAVIGATION
    // =====================================

    sidebar.addEventListener("click", event => {

        const selectedButton = event.target.closest(".nav-item");

        if (!selectedButton) return;

        const selectedPage = selectedButton.dataset.page;

        navigateTo(selectedPage);

    });



    /* =========================================
   AUTHENTICATED ROLE DISPLAY
========================================= */

    if (roleSwitcher) {

        // The role is assigned by PHP, not the browser.
        roleSwitcher.disabled = true;

        roleSwitcher.title =
            "Your dashboard role is assigned to your account.";

        roleSwitcher.style.cursor = "default";

    }



    // =====================================
    // DARK MODE
    // =====================================

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark-theme");

        const darkMode = document.body.classList.contains("dark-theme");

        themeToggle.textContent = darkMode ? "☾" : "☀";

    });


    /* =========================================
   REAL PHP LOGOUT
========================================= */


    logoutButton.addEventListener("click", async () => {

        // Protect unsaved grades before logging out.
        if (!canLeaveGradeEncoding()) {

            return;

        }


        logoutButton.disabled = true;

        // Prevent other dashboard interactions while
        // the logout request is being processed.
        const pageContent = document.getElementById(
            "pageContent"
        );

        sidebar.inert = true;

        pageContent.inert = true;


        try {

            await logoutUser();


            // Logout succeeded. Remove grade protection.
            cleanupGradeEncoding();


            // Replace the current history entry.
            window.location.replace("index.html");


        } catch (error) {

            console.error("Logout error:", error);

            showNotice(
                "Unable to log out. Please try again."
            );


            // Restore controls and retain unsaved grades.
            logoutButton.disabled = false;

            sidebar.inert = false;

            pageContent.inert = false;

        }

    });



    document.getElementById("pageContent")
        .addEventListener("click", event => {

            if (event.target.closest("#specialClassButton")) {
                navigateTo("Special Class");
            }

        });

    // =====================================
    // INITIAL PAGE
    // =====================================

    navigateTo("Home");

}
