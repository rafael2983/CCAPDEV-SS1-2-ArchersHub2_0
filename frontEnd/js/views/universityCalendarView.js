
/* =========================================
   UNIVERSITY CALENDAR VIEW
========================================= */

// FORMAT DATE
function formatDate(dateString) {

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


// CREATE ELEMENT HELPER
function createElement(tag, text, className = "") {

    const element = document.createElement(tag);

    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}


// RENDER TABULAR VIEW
export function renderTabular(events) {

    const tbody = document.getElementById(
        "universityCalendarTableBody"
    );

    tbody.replaceChildren();

    if (events.length === 0) {

        const row = document.createElement("tr");

        const cell = createElement(
            "td",
            "No calendar events available.",
            "university-calendar-empty"
        );

        cell.colSpan = 4;

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    events.forEach(event => {

        const row = document.createElement("tr");

        row.appendChild(
            createElement(
                "td",
                formatDate(event.startDate)
            )
        );

        row.appendChild(
            createElement(
                "td",
                formatDate(event.endDate)
            )
        );

        row.appendChild(
            createElement("td", event.event)
        );

        const importantCell = document.createElement("td");

        importantCell.appendChild(
            createElement(
                "span",
                event.important ? "Important" : "No",
                event.important
                    ? "university-calendar-important"
                    : "university-calendar-normal"
            )
        );

        row.appendChild(importantCell);

        tbody.appendChild(row);
    });
}


// RENDER LIST VIEW
export function renderList(events) {

    const container = document.getElementById(
        "universityCalendarList"
    );

    container.replaceChildren();

    if (events.length === 0) {

        container.appendChild(
            createElement(
                "p",
                "No calendar events available.",
                "university-calendar-empty"
            )
        );

        return;
    }

    events.forEach(event => {

        const card = document.createElement("article");

        card.className = "university-calendar-event";

        if (event.important) {
            card.classList.add("important");
        }

        const header = document.createElement("div");

        header.className =
            "university-calendar-event-header";

        header.appendChild(
            createElement("h3", event.event)
        );

        if (event.important) {

            header.appendChild(
                createElement(
                    "span",
                    "Important",
                    "university-calendar-important"
                )
            );
        }

        const dateText =
            event.startDate === event.endDate
                ? formatDate(event.startDate)
                : `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;

        const date = createElement(
            "p",
            dateText,
            "university-calendar-event-date"
        );

        card.append(header, date);

        container.appendChild(card);
    });
}


// SWITCH ACTIVE VIEW
export function setActiveView(view) {

    document.getElementById(
        "universityCalendarTabularView"
    ).hidden = view !== "tabular";

    document.getElementById(
        "universityCalendarListView"
    ).hidden = view !== "list";

    document.querySelectorAll(
        ".university-calendar-toggle-btn"
    ).forEach(button => {

        const isActive =
            button.dataset.view === view;

        button.classList.toggle(
            "active",
            isActive
        );

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });
}
