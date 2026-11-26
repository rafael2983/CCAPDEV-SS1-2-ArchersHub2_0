
/* =========================================
   SPECIAL CLASS VIEW
========================================= */

// RENDER AVAILABLE COURSES
export function renderCourses(courses) {

    const tbody = document.getElementById("specialCourseBody");
    tbody.replaceChildren();

    if (courses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No matching courses found.";
        cell.style.textAlign = "center";
        cell.style.padding = "25px";

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

        const campus = document.createElement("td");
        campus.textContent = course.campus;

        const applicants = document.createElement("td");
        applicants.textContent = course.applicants;
        applicants.className = "special-student-count";

        const actionCell = document.createElement("td");

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Apply";
        button.dataset.code = course.code;

        actionCell.appendChild(button);

        row.append(
            code,
            name,
            campus,
            applicants,
            actionCell
        );

        tbody.appendChild(row);
    });
}


// POPULATE COURSE DROPDOWN
export function renderCourseOptions(courses) {

    const select = document.getElementById("specialCourse");
    const previousValue = select.value;

    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a course";

    select.appendChild(placeholder);

    courses.forEach(course => {

        const option = document.createElement("option");

        option.value = course.code;
        option.textContent = `${course.code} - ${course.name}`;

        select.appendChild(option);
    });

    if (courses.some(course => course.code === previousValue)) {
        select.value = previousValue;
    }
}


// RENDER REQUESTS
export function renderRequests(requests) {

    const container = document.getElementById("specialRequestsList");
    const count = document.getElementById("specialRequestCount");

    container.replaceChildren();
    count.textContent = requests.length;

    if (requests.length === 0) {

        const empty = document.createElement("p");
        empty.className = "special-empty";
        empty.textContent =
            "You haven't applied for any special class yet.";

        container.appendChild(empty);
        return;
    }

    requests.forEach(request => {

        const item = document.createElement("label");
        item.className = "special-request-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "special-request-check";
        checkbox.value = request.id;

        const details = document.createElement("div");
        details.className = "special-request-details";

        const title = document.createElement("strong");
        title.textContent = `${request.code} - ${request.name}`;

        const campus = document.createElement("span");
        campus.textContent = request.campus;

        const status = document.createElement("small");
        status.textContent = request.status;

        details.append(title, campus, status);
        item.append(checkbox, details);

        container.appendChild(item);
    });
}


// CAMPUS FILTER BUTTONS
export function setActiveCampus(campus) {

    document.querySelectorAll(".special-campus-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.campus === campus
            );
        });
}


// UPDATE BUTTON STATES
export function updateButtons(requests) {

    const withdraw = document.getElementById("withdrawSpecial");
    const submit = document.getElementById("submitSpecial");

    const selected = document.querySelectorAll(
        ".special-request-check:checked"
    );

    withdraw.disabled = selected.length === 0;

    submit.disabled = !requests.some(request =>
        request.status === "Draft"
    );
}
