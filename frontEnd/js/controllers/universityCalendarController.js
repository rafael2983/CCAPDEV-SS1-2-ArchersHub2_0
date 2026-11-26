
/* =========================================
   UNIVERSITY CALENDAR CONTROLLER
========================================= */

import * as Model from "../models/universityCalendarModel.js";

import * as View from "../views/universityCalendarView.js";

let selectedView = "tabular";


// INITIALIZE UNIVERSITY CALENDAR
export function initializeUniversityCalendar() {

    const page = document.querySelector(
        ".university-calendar-content"
    );

    if (!page) return;

    // Load mock events
    const events = Model.getAllEvents();

    // Render both views
    View.renderTabular(events);
    View.renderList(events);

    // Restore selected view
    View.setActiveView(selectedView);

    // Handle toggle buttons
    page.querySelectorAll(
        ".university-calendar-toggle-btn"
    ).forEach(button => {

        button.addEventListener("click", () => {

            selectedView = button.dataset.view;

            View.setActiveView(selectedView);
        });
    });
}
