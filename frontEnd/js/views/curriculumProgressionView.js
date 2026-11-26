
/* =========================================
   CURRICULUM PROGRESSION VIEW
========================================= */

// DISPLAY PROGRESS
export function renderProgress(progress) {

    document.getElementById("curriculumCompleted")
        .textContent = progress.completedUnits;

    document.getElementById("curriculumTotal")
        .textContent = progress.totalUnits;

    document.getElementById("curriculumProgressFill")
        .style.width = `${progress.percentage}%`;

    document.getElementById("curriculumProgressTrack")
        .setAttribute(
            "aria-valuenow",
            Math.round(progress.percentage)
        );
}


// DISPLAY COURSE TABLE
export function renderCourses(courses) {

    const tbody = document.getElementById(
        "curriculumCourseBody"
    );

    tbody.replaceChildren();

    if (courses.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 8;
        cell.className = "curriculum-empty";
        cell.textContent =
            "No courses match the selected filter.";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    courses.forEach(course => {

        const row = document.createElement("tr");

        const values = [
            course.code,
            course.name,
            course.category,
            course.year,
            course.term,
            course.units,
            course.prerequisites.length > 0
                ? course.prerequisites.join(", ")
                : "None"
        ];

        values.forEach(value => {

            const cell = document.createElement("td");
            cell.textContent = value;

            row.appendChild(cell);
        });

        // Status column
        const statusCell = document.createElement("td");

        const status = document.createElement("span");

        status.className =
            "curriculum-status " +
            course.status.toLowerCase().replaceAll(" ", "-");

        status.textContent = course.status;

        statusCell.appendChild(status);
        row.appendChild(statusCell);

        tbody.appendChild(row);
    });
}


// UPDATE ACTIVE FILTER
export function setActiveFilter(selectedStatus) {

    document.querySelectorAll(".curriculum-filter")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.status === selectedStatus
            );

        });
}
