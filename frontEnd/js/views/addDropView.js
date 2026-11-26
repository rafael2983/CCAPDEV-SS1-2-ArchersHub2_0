
/* =========================================
   ADD / DROP VIEW
========================================= */

export function renderCourses(courses, changes = []) {

    const tbody = document.getElementById("courseTableBody");
    tbody.innerHTML = "";

    if (courses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.textContent = "No matching courses found.";
        cell.className = "empty-state";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    courses.forEach(course => {

        const row = document.createElement("tr");

        const code = document.createElement("td");
        code.textContent = course.code;

        const name = document.createElement("td");
        name.textContent = course.name;

        const section = document.createElement("td");

        const sectionCode = document.createElement("div");
        sectionCode.className = "section-code";
        sectionCode.textContent = course.section;

        const details = document.createElement("div");
        details.className = "section-details";
        details.style.whiteSpace = "pre-line";
        details.textContent = course.schedule === "TBA"
            ? ""
            : course.schedule;

        section.append(sectionCode, details);

        const actionCell = document.createElement("td");
        const button = document.createElement("button");

        let action = "Add";

        if (course.status === "enrolled") {
            action = "Drop";
        } else if (course.status === "change") {
            action = "Change";
        }

        const isPending = changes.some(
            change =>
                Number(change.section_id) === Number(course.section_id)
        );

        const displayAction = isPending
            ? "Deselect"
            : action;

        button.textContent = displayAction;

        button.className =
            "action-btn action-" + displayAction.toLowerCase();

        // Identify the exact database section.
        button.dataset.sectionId = String(course.section_id);

        // Preserve course information for display.
        button.dataset.code = course.code;
        button.dataset.section = course.section;
        button.dataset.action = displayAction;

        actionCell.appendChild(button);

        row.append(code, name, section, actionCell);
        tbody.appendChild(row);
    });
}


export function renderChosenCourses(courses, tab = "courses") {

    const container = document.getElementById("chosenCourses");
    container.replaceChildren();

    if (courses.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-courses";
        empty.textContent = "No enrolled courses.";
        container.appendChild(empty);
        return;
    }

    courses.forEach(course => {
        const item = document.createElement("div");
        item.className = "chosen-item";

        const details = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = course.code;

        const subtitle = document.createElement("small");
        subtitle.textContent = tab === "schedule"
            ? course.schedule
            : course.name;

        subtitle.style.whiteSpace = "pre-line";

        details.append(title, subtitle);
        item.appendChild(details);
        container.appendChild(item);
    });
}



export function renderChanges(changes) {

    const container =
        document.getElementById("changesList");

    container.replaceChildren();

    if (changes.length === 0) {
        container.textContent =
            "No changes yet. Press Add, Drop or Change on a course.";
        return;
    }

    changes.forEach(change => {

        const item = document.createElement("div");
        item.className = "change-item";

        const course = document.createElement("span");

        // Display the course and exact section.
        course.textContent =
            change.code + " (" + change.section + ")";

        const action = document.createElement("strong");
        action.textContent = change.action;

        item.append(course, action);

        container.appendChild(item);
    });
}



export function updateEnrollmentCount(count) {
    document.getElementById("enrollmentCount").textContent = count;
}


export function setActiveCampus(campus) {
    document.querySelectorAll(".campus-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.campus === campus
        );
    });
}


export function setActiveTab(tab) {
    document.querySelectorAll(".selection-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.tab === tab
        );
    });
}

// =========================================
// DYNAMIC SELECTION PANEL
// =========================================

export function setChangesPanelVisible(isVisible) {

    const layout = document.querySelector(
        ".adddrop-layout"
    );

    const panel = document.querySelector(
        ".adddrop-layout > .selection-section"
    );

    if (!layout || !panel) return;

    layout.classList.toggle(
        "has-pending-changes",
        isVisible
    );

    panel.inert = !isVisible;

    panel.setAttribute(
        "aria-hidden",
        String(!isVisible)
    );
}