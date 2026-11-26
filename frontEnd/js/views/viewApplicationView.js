
/* =========================================
   VIEW APPLICATION VIEW
========================================= */

// Create a selectable list button
function createListButton(text, isActive, onClick) {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "application-list-item";
    button.textContent = text;

    if (isActive) {
        button.classList.add("active");
    }

    button.setAttribute("aria-pressed", String(isActive));

    button.addEventListener("click", onClick);

    return button;
}


// Render courses
export function renderCourses(
    courses,
    selectedCourse,
    onSelect
) {

    const container = document.getElementById(
        "applicationCourseList"
    );

    container.replaceChildren();

    courses.forEach(course => {

        const button = createListButton(
            course,
            course === selectedCourse,
            () => onSelect(course)
        );

        container.appendChild(button);
    });
}


// Render sections
export function renderSections(
    sections,
    selectedSection,
    onSelect
) {

    const container = document.getElementById(
        "applicationSectionList"
    );

    container.replaceChildren();

    sections.forEach(section => {

        const button = createListButton(
            section,
            section === selectedSection,
            () => onSelect(section)
        );

        container.appendChild(button);
    });
}


// Render selected course and section
export function renderSelectedCourse(
    courseCode,
    sectionCode
) {

    const element = document.getElementById(
        "applicationSelectedCourse"
    );

    element.textContent = courseCode && sectionCode
        ? `${courseCode} — Section ${sectionCode}`
        : "Select a course and section";
}


// Render student table
export function renderStudents(students) {

    const tbody = document.getElementById(
        "applicationStudentTable"
    );

    tbody.replaceChildren();

    if (!students.length) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent =
            "No student applications for this section.";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    students.forEach(student => {

        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = student.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const programCell = document.createElement("td");
        programCell.textContent = student.program;

        const statusCell = document.createElement("td");

        const status = document.createElement("span");

        status.className =
            `application-status ${student.status.toLowerCase()}`;

        status.textContent = student.status;

        statusCell.appendChild(status);

        row.append(
            idCell,
            nameCell,
            programCell,
            statusCell
        );

        tbody.appendChild(row);
    });
}


// Display feedback
export function showApplicationFeedback(
    message,
    isError = false
) {

    const feedback = document.getElementById(
        "applicationFeedback"
    );

    feedback.textContent = message;

    feedback.classList.toggle("error", isError);
}
