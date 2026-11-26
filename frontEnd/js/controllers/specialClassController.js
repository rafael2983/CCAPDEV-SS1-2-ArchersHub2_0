
/* =========================================
   SPECIAL CLASS CONTROLLER
========================================= */

import * as Model from "../models/specialClassModel.js";
import * as View from "../views/specialClassView.js";

import { showNotice } from "../views/dashboardView.js";


// REFRESH COURSE TABLE
function refreshCourses() {

    const search = document.getElementById("specialSearch")
        .value.toLowerCase().trim();

    const courses = Model.getCourses().filter(course =>
        course.code.toLowerCase().includes(search) ||
        course.name.toLowerCase().includes(search)
    );

    View.renderCourses(courses);
}


// REFRESH REQUESTS
function refreshRequests() {

    const requests = Model.getRequests();

    View.renderRequests(requests);
    View.updateButtons(requests);
}


// INITIALIZE SPECIAL CLASS
export function initializeSpecialClass() {

    const courseSelect = document.getElementById("specialCourse");
    const campusSelect = document.getElementById("specialCampus");
    const reasonInput = document.getElementById("specialReason");

    View.setActiveCampus(Model.getCampus());
    View.renderCourseOptions(Model.getAllCourses());


    // CAMPUS FILTERS
    document.querySelectorAll(".special-campus-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                Model.setCampus(button.dataset.campus);

                View.setActiveCampus(Model.getCampus());
                refreshCourses();

            });
        });


    // SEARCH
    document.getElementById("specialSearch")
        .addEventListener("input", refreshCourses);


    // COURSE TABLE APPLY BUTTONS
    document.getElementById("specialCourseBody")
        .addEventListener("click", event => {

            const button = event.target.closest("button[data-code]");

            if (!button) return;

            const course = Model.getAllCourses().find(c =>
                c.code === button.dataset.code
            );

            if (!course) return;

            courseSelect.value = course.code;
            campusSelect.value = course.campus;

            reasonInput.focus();

            showNotice(
                course.code + " selected. Please enter your reason."
            );

        });


    // APPLY REQUEST
    document.getElementById("applySpecial")
        .addEventListener("click", () => {

            const code = courseSelect.value;
            const campus = campusSelect.value;
            const reason = reasonInput.value;

            if (!code) {
                showNotice("Please select a course.");
                return;
            }

            const result = Model.addRequest(
                code,
                campus,
                reason
            );

            showNotice(result.message);

            if (!result.success) return;

            document.getElementById("specialApplicationForm").reset();

            refreshRequests();

        });


    // SELECT REQUESTS FOR WITHDRAWAL
    document.getElementById("specialRequestsList")
        .addEventListener("change", () => {

            View.updateButtons(Model.getRequests());

        });


    // WITHDRAW REQUESTS
    document.getElementById("withdrawSpecial")
        .addEventListener("click", () => {

            const selected = [
                ...document.querySelectorAll(
                    ".special-request-check:checked"
                )
            ].map(checkbox => Number(checkbox.value));

            if (selected.length === 0) return;

            Model.withdrawRequests(selected);

            refreshRequests();

            showNotice("Selected application(s) withdrawn.");

        });


    // SUBMIT REQUESTS
    document.getElementById("submitSpecial")
        .addEventListener("click", () => {

            const submitted = Model.submitRequests();

            if (submitted === 0) {
                showNotice("No draft applications to submit.");
                return;
            }

            refreshRequests();

            showNotice(
                submitted +
                " demo application(s) marked as submitted. " +
                "No request was sent to DLSU."
            );

        });


    // INITIAL DISPLAY
    refreshCourses();
    refreshRequests();

}
