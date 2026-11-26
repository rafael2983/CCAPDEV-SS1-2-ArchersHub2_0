
/* =========================================
   ENLISTMENT CONTROLLER
========================================= */

import * as Model from "../models/enlistmentModel.js";
import * as View from "../views/enlistmentView.js";

let selectedCampus = "Laguna";
let selectedView = "chosen";
let searchQuery = "";
let sortOrder = "code-asc";


// REFRESH ENLISTMENT PAGE
function refreshEnlistment() {

    const courses = Model.getCourses(
        selectedCampus,
        searchQuery,
        sortOrder
    );

    const chosen = Model.getChosenCourses();

    View.renderCourses(
        courses,
        chosen.map(course => course.id)
    );

    View.renderChosenCourses(chosen);
    View.renderSchedule(chosen);
    View.renderCount(chosen.length);

    View.setActiveCampus(selectedCampus);
    View.setActiveView(selectedView);

    const policyChecked = document.getElementById(
        "enlistmentPolicy"
    ).checked;

    View.updateSubmitButton(
        chosen.length > 0 && policyChecked
    );
}


// INITIALIZE ENLISTMENT
export function initializeEnlistment() {

    const page = document.querySelector(
        ".enlistment-content"
    );

    if (!page) return;

    Model.loadDraft();

    const searchInput = document.getElementById(
        "enlistmentSearch"
    );

    const sortSelect = document.getElementById(
        "enlistmentSort"
    );

    const policyCheckbox = document.getElementById(
        "enlistmentPolicy"
    );

    searchInput.value = searchQuery;
    sortSelect.value = sortOrder;

    refreshEnlistment();


    // CAMPUS SELECTION
    page.querySelectorAll(
        ".enlistment-campus-btn"
    ).forEach(button => {

        button.addEventListener("click", () => {

            selectedCampus = button.dataset.campus;

            refreshEnlistment();
        });
    });


    // SEARCH
    searchInput.addEventListener("input", () => {

        searchQuery = searchInput.value;

        refreshEnlistment();
    });


    // SORT
    sortSelect.addEventListener("change", () => {

        sortOrder = sortSelect.value;

        refreshEnlistment();
    });


    // ADD COURSE
    document.getElementById(
        "enlistmentCourseBody"
    ).addEventListener("click", event => {

        const button = event.target.closest(
            ".enlistment-add-btn"
        );

        if (!button) return;

        Model.addCourse(
            Number(button.dataset.courseId)
        );

        View.showMessage("");
        refreshEnlistment();
    });


    // REMOVE COURSE
    document.getElementById(
        "enlistmentChosenList"
    ).addEventListener("click", event => {

        const button = event.target.closest(
            ".enlistment-remove-btn"
        );

        if (!button) return;

        Model.removeCourse(
            Number(button.dataset.removeId)
        );

        View.showMessage("");
        refreshEnlistment();
    });


    // CHOSEN / SCHEDULE TOGGLE
    page.querySelectorAll(
        ".enlistment-view-btn"
    ).forEach(button => {

        button.addEventListener("click", () => {

            selectedView = button.dataset.view;

            refreshEnlistment();
        });
    });


    // SCHOOL POLICY
    policyCheckbox.addEventListener("change", () => {

        refreshEnlistment();
    });


    // SAVE DRAFT
    document.getElementById(
        "enlistmentSave"
    ).addEventListener("click", () => {

        Model.saveDraft();

        View.showMessage(
            "Your enlistment draft has been saved."
        );
    });


    // SUBMIT ENLISTMENT
    document.getElementById(
        "enlistmentSubmit"
    ).addEventListener("click", () => {

        const chosen = Model.getChosenCourses();

        if (
            chosen.length === 0 ||
            !policyCheckbox.checked
        ) {
            return;
        }

        Model.submitEnlistment();
        Model.saveDraft();

        View.showMessage(
            "Enlistment submitted successfully (demo only)."
        );
    });
}
