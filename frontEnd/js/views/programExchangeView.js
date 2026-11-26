
/* =========================================
   PROGRAM EXCHANGE VIEW
========================================= */

// DISPLAY CURRENT PROGRAM
export function renderCurrentProgram(program) {

    const input = document.getElementById(
        "exchangeCurrentProgram"
    );

    input.value = `${program.code} - ${program.name}`;
}


// POPULATE TARGET PROGRAMS
export function renderTargetPrograms(programs) {

    const select = document.getElementById(
        "exchangeTargetProgram"
    );

    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a program";

    select.appendChild(placeholder);

    programs.forEach(program => {

        const option = document.createElement("option");

        option.value = program.code;
        option.textContent =
            `${program.code} - ${program.name}`;

        select.appendChild(option);
    });
}


// DISPLAY APPLICATION HISTORY
export function renderApplications(applications) {

    const tbody = document.getElementById(
        "exchangeApplicationsBody"
    );

    tbody.replaceChildren();

    if (applications.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "exchange-empty";
        cell.textContent =
            "You have no program exchange applications.";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    applications.forEach(application => {

        const row = document.createElement("tr");

        const program = document.createElement("td");
        program.textContent = application.targetName;

        const date = document.createElement("td");
        date.textContent = application.dateApplied;

        const statusCell = document.createElement("td");

        const status = document.createElement("span");
        status.className =
            `exchange-status ${application.status.toLowerCase()}`;

        status.textContent = application.status;
        statusCell.appendChild(status);

        const action = document.createElement("td");

        if (application.status === "Pending") {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "exchange-cancel-btn";
            button.dataset.id = application.id;
            button.textContent = "Cancel";

            action.appendChild(button);

        } else {
            action.textContent = "—";
        }

        row.append(
            program,
            date,
            statusCell,
            action
        );

        tbody.appendChild(row);
    });
}
