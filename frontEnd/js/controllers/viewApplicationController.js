
/* =========================================
   VIEW APPLICATION CONTROLLER
========================================= */

import * as Model from "../models/viewApplicationModel.js";

import * as View from "../views/viewApplicationView.js";


export function initializeViewApplication() {

    const page = document.querySelector(
        ".view-application-page"
    );

    if (!page) return;

    const courses = Model.getCourses();

    let selectedCourse = courses[0] || "";
    let selectedSection = "";

    const form = page.querySelector(
        "#applicationUpdateForm"
    );

    const studentIDInput = page.querySelector(
        "#applicationStudentID"
    );

    const statusSelect = page.querySelector(
        "#applicationStatus"
    );


    // Refresh the student table
    function refreshStudents() {

        const students = Model.getStudents(
            selectedCourse,
            selectedSection
        );

        View.renderSelectedCourse(
            selectedCourse,
            selectedSection
        );

        View.renderStudents(students);

        View.showApplicationFeedback("");
    }


    // Select a section
    function selectSection(sectionCode) {

        selectedSection = sectionCode;

        View.renderSections(
            Model.getSections(selectedCourse),
            selectedSection,
            selectSection
        );

        refreshStudents();
    }


    // Select a course
    function selectCourse(courseCode) {

        selectedCourse = courseCode;

        const sections = Model.getSections(courseCode);

        selectedSection = sections[0] || "";

        View.renderCourses(
            courses,
            selectedCourse,
            selectCourse
        );

        View.renderSections(
            sections,
            selectedSection,
            selectSection
        );

        refreshStudents();
    }


    // Handle Add / Drop form
    form.addEventListener("submit", event => {

        event.preventDefault();

        const studentId = studentIDInput.value.trim();
        const newStatus = statusSelect.value;

        if (!/^\d{8}$/.test(studentId)) {

            View.showApplicationFeedback(
                "Please enter a valid 8-digit student ID.",
                true
            );

            return;
        }

        const result = Model.updateStudentStatus(
            selectedCourse,
            selectedSection,
            studentId,
            newStatus
        );

        if (result.success) {

            refreshStudents();

            studentIDInput.value = "";

            View.showApplicationFeedback(
                result.message
            );

        } else {

            View.showApplicationFeedback(
                result.message,
                true
            );
        }
    });


    // Initial page rendering
    selectCourse(selectedCourse);
}
