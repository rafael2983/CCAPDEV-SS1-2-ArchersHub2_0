
/* =========================================
   CURRICULUM PROGRESSION CONTROLLER
========================================= */

import * as Model from "../models/curriculumProgressionModel.js";
import * as View from "../views/curriculumProgressionView.js";

// Currently selected filter
let selectedStatus = "All";


// REFRESH COURSE TABLE
function refreshCourses() {

    const courses = Model.getFilteredCourses(
        selectedStatus
    );

    View.renderCourses(courses);
    View.setActiveFilter(selectedStatus);
}


// INITIALIZE CURRICULUM PROGRESSION
export function initializeCurriculumProgression() {

    // Display progress
    View.renderProgress(
        Model.getProgress()
    );

    // Handle status filters
    document.getElementById("curriculumStatusFilters")
        .addEventListener("click", event => {

            const button = event.target.closest(
                ".curriculum-filter"
            );

            if (!button) return;

            selectedStatus = button.dataset.status;

            refreshCourses();
        });

    // Initial display
    refreshCourses();
}
