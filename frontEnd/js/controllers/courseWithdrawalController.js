
/* =========================================
   COURSE WITHDRAWAL CONTROLLER
========================================= */

import * as Model from "../models/courseWithdrawalModel.js";
import * as View from "../views/courseWithdrawalView.js";

import { showNotice } from "../views/dashboardView.js";


// REFRESH PAGE DATA
function refreshWithdrawal() {

    const enrolled = Model.getEnrolledCourses();
    const selected = Model.getSelectedCourses();
    const submitted = Model.getSubmittedRequests();

    View.renderEnrolledCourses(
        enrolled,
        selected,
        submitted
    );

    View.renderSelectedCourses(selected);

    View.updateSubmitButton(selected.length > 0);
}


// INITIALIZE COURSE WITHDRAWAL
export function initializeCourseWithdrawal() {

    const courseTable = document.getElementById(
        "withdrawalCourseBody"
    );

    const selectedContainer = document.getElementById(
        "withdrawalSelectedCourses"
    );

    const reasonSelect = document.getElementById(
        "withdrawalReason"
    );

    const otherReason = document.getElementById(
        "withdrawalOtherReason"
    );

    const agreement = document.getElementById(
        "withdrawalAgreement"
    );

    const submitButton = document.getElementById(
        "submitWithdrawal"
    );


    // =====================================
    // SELECT COURSE FOR WITHDRAWAL
    // =====================================

    courseTable.addEventListener("click", event => {

        const button = event.target.closest(
            ".withdrawal-course-btn"
        );

        if (!button || button.disabled) return;

        const result = Model.selectCourse(
            button.dataset.code
        );

        showNotice(result.message);

        if (result.success) {
            refreshWithdrawal();
        }

    });


    // =====================================
    // REMOVE SELECTED COURSE
    // =====================================

    selectedContainer.addEventListener("click", event => {

        const button = event.target.closest(
            ".withdrawal-remove-btn"
        );

        if (!button) return;

        Model.removeCourse(button.dataset.code);

        refreshWithdrawal();

        showNotice("Course removed from withdrawal request.");

    });


    // =====================================
    // OTHER REASON FIELD
    // =====================================

    reasonSelect.addEventListener("change", () => {

        const isOther = reasonSelect.value === "Other";

        View.toggleOtherReason(isOther);

        if (!isOther) {
            otherReason.value = "";
        }

    });


    // =====================================
    // SUBMIT WITHDRAWAL
    // =====================================

    submitButton.addEventListener("click", () => {

        const selected = Model.getSelectedCourses();

        if (selected.length === 0) {
            showNotice("Please select a course first.");
            return;
        }

        if (!reasonSelect.value) {
            showNotice("Please select a withdrawal reason.");
            return;
        }

        if (
            reasonSelect.value === "Other" &&
            !otherReason.value.trim()
        ) {
            showNotice("Please specify your reason.");
            return;
        }

        if (!agreement.checked) {
            showNotice(
                "Please acknowledge the withdrawal policy."
            );
            return;
        }

        const reason = reasonSelect.value === "Other"
            ? otherReason.value.trim()
            : reasonSelect.value;

        const confirmed = window.confirm(
            "Submit this demo withdrawal request?\n\n" +
            "This will not change any real enrollment records."
        );

        if (!confirmed) return;

        const result = Model.submitWithdrawal(reason);

        if (!result.success) {
            showNotice(result.message);
            return;
        }

        // Reset form after successful demo submission
        reasonSelect.value = "";
        otherReason.value = "";
        agreement.checked = false;

        View.toggleOtherReason(false);

        refreshWithdrawal();

        showNotice(
            result.message +
            " No real enrollment records were changed."
        );

    });


    // INITIAL DISPLAY
    View.toggleOtherReason(false);
    refreshWithdrawal();

}
