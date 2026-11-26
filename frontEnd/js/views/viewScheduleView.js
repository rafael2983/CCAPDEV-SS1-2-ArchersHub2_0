
/* =========================================
   VIEW SCHEDULE VIEW
========================================= */

// POPULATE TERM DROPDOWN
export function renderTerms(terms) {

    const select = document.getElementById(
        "scheduleTerm"
    );

    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a term";

    select.appendChild(placeholder);

    terms.forEach(term => {

        const option = document.createElement("option");

        option.value = term.id;
        option.textContent = term.name;

        select.appendChild(option);
    });
}


// RENDER WEEKLY TIMETABLE
export function renderWeeklySchedule(
    classes,
    timeSlots,
    days
) {

    const tbody = document.getElementById(
        "scheduleWeeklyBody"
    );

    tbody.replaceChildren();

    timeSlots.forEach(slot => {

        const row = document.createElement("tr");

        // Time column
        const timeCell = document.createElement("td");
        timeCell.className = "schedule-time-cell";
        timeCell.textContent = slot;

        row.appendChild(timeCell);

        // Monday to Saturday
        days.forEach(day => {

            const cell = document.createElement("td");
            cell.className = "schedule-day-cell";

            const matchingClasses = classes.filter(
                classItem =>
                    classItem.day === day &&
                    classItem.slot === slot
            );

            matchingClasses.forEach(classItem => {

                const block = document.createElement("div");
                block.className = "schedule-class-block";

                const code = document.createElement("strong");
                code.textContent = classItem.code;

                const section = document.createElement("span");
                section.textContent =
                    `Section: ${classItem.section}`;

                const time = document.createElement("span");
                time.textContent = classItem.time;

                const room = document.createElement("span");
                room.textContent = classItem.room;

                block.append(code, section, time, room);

                cell.appendChild(block);
            });

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}


// RENDER LIST SCHEDULE
export function renderListSchedule(classes) {

    const tbody = document.getElementById(
        "scheduleListBody"
    );

    tbody.replaceChildren();

    if (classes.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "schedule-empty";
        cell.textContent =
            "No classes found for the selected term.";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    classes.forEach(classItem => {

        const row = document.createElement("tr");

        const values = [
            classItem.code,
            classItem.name,
            classItem.section,
            classItem.day,
            classItem.time,
            classItem.room
        ];

        values.forEach(value => {

            const cell = document.createElement("td");
            cell.textContent = value;

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}


// SWITCH BETWEEN WEEKLY AND LIST
export function setActiveView(view) {

    document.getElementById("scheduleWeeklyView")
        .hidden = view !== "weekly";

    document.getElementById("scheduleListView")
        .hidden = view !== "list";

    document.querySelectorAll(".schedule-toggle")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view === view
            );

        });
}
