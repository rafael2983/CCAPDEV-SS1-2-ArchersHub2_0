
/* =========================================
   ADD / DROP CONTROLLER
   Real Enrollment Integration
========================================= */

import * as Model from "../models/addDropModel.js";
import * as View from "../views/addDropView.js";

import { showNotice } from "../views/dashboardView.js";

let currentTab = "courses";
let isSubmitting = false;

// Prevent duplicate event handlers.
let eventController = null;


// =========================================
// REFRESH COURSE TABLE
// =========================================

function refreshCourses() {

    const searchInput =
        document.getElementById("courseSearch");

    const sortInput =
        document.getElementById("courseSort");

    if (!searchInput || !sortInput) return;

    const search = searchInput.value
        .toLowerCase()
        .trim();

    const sort = sortInput.value;

    let courses = Model.getCourses().filter(course =>
        course.code.toLowerCase().includes(search) ||
        course.name.toLowerCase().includes(search)
    );

    courses.sort((a, b) => {

        if (sort === "code-desc") {
            return b.code.localeCompare(a.code);
        }

        if (sort === "name-asc") {
            return a.name.localeCompare(b.name);
        }

        return a.code.localeCompare(b.code);
    });

    View.renderCourses(
        courses,
        Model.getChanges()
    );
}


// =========================================
// REFRESH CHOSEN COURSES
// =========================================

function refreshSelection() {

    const enrolled = Model.getEnrolledCourses();

    const changes = Model.getChanges();

    View.renderChosenCourses(
        enrolled,
        currentTab
    );

    View.updateEnrollmentCount(
        enrolled.length
    );

    View.renderChanges(changes);

    View.setChangesPanelVisible(
        changes.length > 0
    );
}


// =========================================
// INITIALIZE ADD / DROP
// =========================================

export async function initializeAddDrop() {

    // Remove listeners from the previous initialization.
    if (eventController) {
        eventController.abort();
    }

    eventController = new AbortController();

    const signal = eventController.signal;

    currentTab = "courses";

    View.setActiveCampus(Model.getCampus());
    View.setActiveTab(currentTab);

    // =====================================
    // LOAD DATABASE DATA
    // =====================================

    try {

        await Promise.all([
            Model.loadCourses(),
            Model.loadEnrollments()
        ]);

        console.log(
            "[ArchersHub] Enrollment data loaded successfully."
        );

    } catch (error) {

        console.error(
            "[ArchersHub] Enrollment loading failed:",
            error
        );

        showNotice(
            "Unable to load enrollment data. Please refresh."
        );

        return;
    }


    // =====================================
    // CAMPUS SWITCHING
    // =====================================

    document.querySelectorAll(".campus-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (isSubmitting) return;

                    Model.setCampus(
                        button.dataset.campus
                    );

                    View.setActiveCampus(
                        Model.getCampus()
                    );

                    refreshCourses();

                },
                { signal }
            );

        });


    // =====================================
    // SEARCH AND SORT
    // =====================================

    document.getElementById("courseSearch")
        .addEventListener(
            "input",
            refreshCourses,
            { signal }
        );

    document.getElementById("courseSort")
        .addEventListener(
            "change",
            refreshCourses,
            { signal }
        );


    // =====================================
    // ADD / DROP / CHANGE BUTTONS
    // =====================================

    document.getElementById("courseTableBody")
        .addEventListener(
            "click",
            event => {

                if (isSubmitting) return;

                const button = event.target.closest(
                    ".action-btn"
                );

                if (!button) return;

                const sectionId = Number(
                    button.dataset.sectionId
                );

                const action =
                    button.dataset.action;

                try {

                    // Remove an existing pending request.

                    if (action === "Deselect") {

                        Model.removeChange(sectionId);

                        refreshCourses();
                        refreshSelection();

                        showNotice(
                            "Pending enrollment request removed."
                        );

                        return;
                    }

                    // Queue a new enrollment request.

                    const change = Model.addChange(
                        sectionId,
                        action
                    );

                    refreshCourses();
                    refreshSelection();

                    showNotice(
                        change.action +
                        " request added for " +
                        change.code +
                        " (" + change.section + ")."
                    );

                } catch (error) {

                    console.error(
                        "[ArchersHub] Queue error:",
                        error
                    );

                    showNotice(error.message);

                }

            },
            { signal }
        );


    // =====================================
    // CHOSEN COURSES / SCHEDULE
    // =====================================

    document.querySelectorAll(".selection-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    currentTab =
                        button.dataset.tab;

                    View.setActiveTab(currentTab);

                    refreshSelection();

                },
                { signal }
            );

        });


    // =====================================
    // SAVE
    // =====================================

    document.getElementById("saveButton")
        .addEventListener(
            "click",
            () => {

                showNotice(
                    "Your selections are kept temporarily. " +
                    "Click Submit to update your enrollment."
                );

            },
            { signal }
        );


    // =====================================
    // SUBMIT REAL ENROLLMENT REQUESTS
    // =====================================

    document.getElementById("submitButton")
        .addEventListener(
            "click",
            async () => {

                if (isSubmitting) return;

                const changes = Model.getChanges();

                const reasonInput =
                    document.getElementById("changeReason");

                const otherReasonInput =
                    document.getElementById("otherReason");

                const policyInput =
                    document.getElementById("policyAgreement");

                const submitButton =
                    document.getElementById("submitButton");

                const reason = reasonInput.value;
                const agreed = policyInput.checked;

                // -------------------------
                // VALIDATION
                // -------------------------

                if (changes.length === 0) {
                    showNotice(
                        "Please select a course change first."
                    );
                    return;
                }

                if (!reason) {
                    showNotice(
                        "Please select a reason."
                    );
                    return;
                }

                if (!agreed) {
                    showNotice(
                        "Please agree to the school policy."
                    );
                    return;
                }

                // -------------------------
                // SUBMISSION START
                // -------------------------

                isSubmitting = true;

                submitButton.disabled = true;
                submitButton.textContent =
                    "Submitting...";

                const successful = [];
                const failed = [];

                try {

                    // Process requests one at a time.
                    for (const change of changes) {

                        try {

                            await Model.submitChange(change);

                            successful.push(change);

                            console.log(
                                "[ArchersHub] Success:",
                                change
                            );

                        } catch (error) {

                            failed.push({
                                change,
                                message: error.message
                            });

                            console.error(
                                "[ArchersHub] Failed:",
                                change,
                                error
                            );

                        }

                    }

                    // -------------------------
                    // REFRESH DATABASE DATA
                    // -------------------------

                    await Promise.all([
                        Model.loadCourses(),
                        Model.loadEnrollments()
                    ]);

                    // -------------------------
                    // KEEP FAILED REQUESTS
                    // -------------------------

                    Model.clearChanges();

                    for (const item of failed) {

                        try {

                            Model.addChange(
                                item.change.section_id,
                                item.change.action
                            );

                        } catch (error) {

                            console.warn(
                                "[ArchersHub] Could not requeue:",
                                item.change,
                                error
                            );

                        }

                    }

                    refreshCourses();
                    refreshSelection();

                    // -------------------------
                    // RESET FORM IF SUCCESSFUL
                    // -------------------------

                    if (failed.length === 0) {

                        reasonInput.value = "";

                        otherReasonInput.value = "";

                        policyInput.checked = false;

                    }

                    // -------------------------
                    // NOTIFY STUDENT
                    // -------------------------

                    if (failed.length === 0) {

                        showNotice(
                            successful.length +
                            " enrollment request(s) completed successfully."
                        );

                    } else {

                        showNotice(
                            successful.length +
                            " succeeded, " +
                            failed.length +
                            " failed. Check the Console for details."
                        );

                    }

                } catch (error) {

                    console.error(
                        "[ArchersHub] Submission error:",
                        error
                    );

                    showNotice(
                        "Unable to refresh enrollment data. " +
                        "Please reload the page to verify your enrollment."
                    );

                } finally {

                    isSubmitting = false;

                    submitButton.disabled = false;
                    submitButton.textContent =
                        "Submit";

                }

            },
            { signal }
        );


    // =====================================
    // INITIAL RENDER
    // =====================================

    refreshCourses();
    refreshSelection();

}
