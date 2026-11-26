
/* =========================================
   VIEW SCHEDULE CONTROLLER
========================================= */

import * as Model from "../models/viewScheduleModel.js";
import * as View from "../views/viewScheduleView.js";

let selectedTerm = "";
let selectedView = "weekly";


// REFRESH SCHEDULE
function refreshSchedule() {

    const classes = Model.getSchedule(selectedTerm);

    View.renderWeeklySchedule(
        classes,
        Model.getTimeSlots(),
        Model.getDays()
    );

    View.renderListSchedule(classes);

    View.setActiveView(selectedView);
}


// INITIALIZE VIEW SCHEDULE
export function initializeViewSchedule() {

    const termSelect = document.getElementById(
        "scheduleTerm"
    );

    const viewToggle = document.getElementById(
        "scheduleViewToggle"
    );

    // Populate available terms
    View.renderTerms(Model.getTerms());

    // Restore previously selected term
    termSelect.value = selectedTerm;

    // Handle term changes
    termSelect.addEventListener("change", () => {

        selectedTerm = termSelect.value;

        refreshSchedule();
    });

    // Handle Weekly / List toggle
    viewToggle.addEventListener("click", event => {

        const button = event.target.closest(
            ".schedule-toggle"
        );

        if (!button) return;

        selectedView = button.dataset.view;

        refreshSchedule();
    });

    // Initial display
    refreshSchedule();
}
