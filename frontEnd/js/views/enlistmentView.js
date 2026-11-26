
/* =========================================
   ENLISTMENT VIEW
========================================= */

// CREATE ELEMENT HELPER
function createElement(tag, text, className = "") {

    const element = document.createElement(tag);

    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}


// RENDER AVAILABLE COURSES
export function renderCourses(courses, chosenIds) {

    const tbody = document.getElementById(
        "enlistmentCourseBody"
    );

    tbody.replaceChildren();

    if (courses.length === 0) {

        const row = document.createElement("tr");
        const cell = createElement(
            "td",
            "No courses found.",
            "enlistment-empty"
        );

        cell.colSpan = 4;
        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    courses.forEach(course => {

        const row = document.createElement("tr");

        row.appendChild(
            createElement("td", course.code)
        );

        row.appendChild(
            createElement("td", course.name)
        );

        const sectionCell = document.createElement("td");

        sectionCell.appendChild(
            createElement(
                "strong",
                course.section,
                "enlistment-section-code"
            )
        );

        course.meetings.forEach(meeting => {

            sectionCell.appendChild(
                createElement(
                    "span",
                    `${meeting.day} ${meeting.time} | ${meeting.room}`,
                    "enlistment-section-detail"
                )
            );
        });

        row.appendChild(sectionCell);

        const actionCell = document.createElement("td");

        const button = createElement(
            "button",
            chosenIds.includes(course.id) ? "Added" : "Add",
            "enlistment-add-btn"
        );

        button.type = "button";
        button.dataset.courseId = course.id;

        button.disabled = chosenIds.includes(course.id);

        actionCell.appendChild(button);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });
}


// RENDER CHOSEN COURSES
export function renderChosenCourses(courses) {

    const container = document.getElementById(
        "enlistmentChosenList"
    );

    container.replaceChildren();

    if (courses.length === 0) {

        container.appendChild(
            createElement(
                "p",
                "No courses chosen yet. Press Add on a course to start.",
                "enlistment-empty"
            )
        );

        return;
    }

    courses.forEach(course => {

        const item = document.createElement("div");
        item.className = "enlistment-chosen-item";

        const details = document.createElement("div");

        details.appendChild(
            createElement("strong", course.code)
        );

        details.appendChild(
            createElement(
                "span",
                `${course.name} | ${course.section} | ${course.campus}`
            )
        );

        const removeButton = createElement(
            "button",
            "Remove",
            "enlistment-remove-btn"
        );

        removeButton.type = "button";
        removeButton.dataset.removeId = course.id;

        item.append(details, removeButton);

        container.appendChild(item);
    });
}


// RENDER SCHEDULE PREVIEW
export function renderSchedule(courses) {

    const tbody = document.getElementById(
        "enlistmentScheduleBody"
    );

    tbody.replaceChildren();

    const meetings = courses.flatMap(course =>
        course.meetings.map(meeting => ({
            ...meeting,
            code: course.code,
            section: course.section
        }))
    );

    if (meetings.length === 0) {

        const row = document.createElement("tr");
        const cell = createElement(
            "td",
            "No scheduled classes to display.",
            "enlistment-empty"
        );

        cell.colSpan = 5;
        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    meetings.forEach(meeting => {

        const row = document.createElement("tr");

        [
            meeting.code,
            meeting.section,
            meeting.day,
            meeting.time,
            meeting.room
        ].forEach(value => {

            row.appendChild(
                createElement("td", value)
            );
        });

        tbody.appendChild(row);
    });
}


// UPDATE COUNT
export function renderCount(count) {

    document.getElementById(
        "enlistmentCount"
    ).textContent = count;
}


// UPDATE VIEW
export function setActiveView(view) {

    document.getElementById(
        "enlistmentChosenView"
    ).hidden = view !== "chosen";

    document.getElementById(
        "enlistmentScheduleView"
    ).hidden = view !== "schedule";

    document.querySelectorAll(
        ".enlistment-view-btn"
    ).forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.view === view
        );
    });
}


// UPDATE CAMPUS BUTTONS
export function setActiveCampus(campus) {

    document.querySelectorAll(
        ".enlistment-campus-btn"
    ).forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.campus === campus
        );
    });
}


// DISPLAY MESSAGE
export function showMessage(message) {

    document.getElementById(
        "enlistmentMessage"
    ).textContent = message;
}


// UPDATE SUBMIT BUTTON
export function updateSubmitButton(enabled) {

    document.getElementById(
        "enlistmentSubmit"
    ).disabled = !enabled;
}
