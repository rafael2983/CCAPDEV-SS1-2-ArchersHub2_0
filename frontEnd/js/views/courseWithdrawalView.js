
/* =========================================
   COURSE WITHDRAWAL VIEW
========================================= */

// DISPLAY ENROLLED COURSES
export function renderEnrolledCourses(
    courses,
    selectedCourses,
    submittedRequests
) {

    const tbody = document.getElementById(
        "withdrawalCourseBody"
    );

    tbody.replaceChildren();

    if (courses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No enrolled courses found.";

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
        section.textContent = course.section;

        const action = document.createElement("td");

        const button = document.createElement("button");
        button.type = "button";
        button.className = "withdrawal-course-btn";
        button.dataset.code = course.code;

        const isSelected = selectedCourses.some(
            item => item.code === course.code
        );

        const isSubmitted = submittedRequests.some(
            item => item.code === course.code
        );

        if (isSubmitted) {
            button.textContent = "Submitted";
            button.disabled = true;
        } else if (isSelected) {
            button.textContent = "Selected";
            button.disabled = true;
        } else {
            button.textContent = "Withdraw";
        }

        action.appendChild(button);

        row.append(code, name, section, action);
        tbody.appendChild(row);
    });
}


// DISPLAY SELECTED WITHDRAWAL COURSES
export function renderSelectedCourses(courses) {

    const container = document.getElementById(
        "withdrawalSelectedCourses"
    );

    container.replaceChildren();

    if (courses.length === 0) {

        const message = document.createElement("p");
        message.className = "withdrawal-empty";
        message.textContent =
            "No courses selected for withdrawal.";

        container.appendChild(message);
        return;
    }

    courses.forEach(course => {

        const item = document.createElement("div");
        item.className = "withdrawal-selected-item";

        const info = document.createElement("div");
        info.className = "withdrawal-selected-info";

        const title = document.createElement("strong");
        title.textContent = `${course.code} - ${course.name}`;

        const section = document.createElement("span");
        section.textContent = `Section: ${course.section}`;

        info.append(title, section);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "withdrawal-remove-btn";
        removeButton.dataset.code = course.code;
        removeButton.textContent = "Remove";

        item.append(info, removeButton);
        container.appendChild(item);
    });
}


// SHOW OR HIDE OTHER REASON
export function toggleOtherReason(show) {

    document.getElementById(
        "withdrawalOtherGroup"
    ).hidden = !show;

}


// ENABLE OR DISABLE SUBMIT BUTTON
export function updateSubmitButton(hasCourses) {

    const button = document.getElementById(
        "submitWithdrawal"
    );

    button.disabled = !hasCourses;
}
