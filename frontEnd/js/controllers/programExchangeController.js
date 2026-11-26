
/* =========================================
   PROGRAM EXCHANGE CONTROLLER
========================================= */

import * as Model from "../models/programExchangeModel.js";
import * as View from "../views/programExchangeView.js";

import { showNotice } from "../views/dashboardView.js";


// REFRESH APPLICATIONS
function refreshApplications() {

    const applications = Model.getApplications();

    View.renderApplications(applications);
}


// INITIALIZE PROGRAM EXCHANGE
export function initializeProgramExchange() {

    const form = document.getElementById(
        "exchangeApplicationForm"
    );

    const targetSelect = document.getElementById(
        "exchangeTargetProgram"
    );

    const reasonInput = document.getElementById(
        "exchangeReason"
    );

    const applicationsTable = document.getElementById(
        "exchangeApplicationsBody"
    );


    // =====================================
    // INITIAL DATA
    // =====================================

    View.renderCurrentProgram(
        Model.getCurrentProgram()
    );

    View.renderTargetPrograms(
        Model.getAvailablePrograms()
    );


    // =====================================
    // SUBMIT APPLICATION
    // =====================================

    form.addEventListener("submit", event => {

        event.preventDefault();

        const targetCode = targetSelect.value;
        const reason = reasonInput.value;

        const result = Model.submitApplication(
            targetCode,
            reason
        );

        showNotice(result.message);

        if (!result.success) return;

        form.reset();

        refreshApplications();

    });


    // =====================================
    // CANCEL APPLICATION
    // =====================================

    applicationsTable.addEventListener("click", event => {

        const button = event.target.closest(
            ".exchange-cancel-btn"
        );

        if (!button) return;

        const applicationId = Number(button.dataset.id);

        const confirmed = window.confirm(
            "Cancel this demo program exchange application?"
        );

        if (!confirmed) return;

        const result = Model.cancelApplication(
            applicationId
        );

        showNotice(result.message);

        if (result.success) {
            refreshApplications();
        }

    });


    // =====================================
    // INITIAL DISPLAY
    // =====================================

    refreshApplications();

}
