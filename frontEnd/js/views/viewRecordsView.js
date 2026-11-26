
/* =========================================
   VIEW RECORDS VIEW
========================================= */

// FORMAT ACADEMIC TERM
export function formatAcademicTerm(term) {

    const match = /^Y(\d{2})(\d{2})-([1-3])$/.exec(term);

    if (!match) return term;

    const [, startYear, endYear, termNumber] = match;

    return `A.Y. 20${startYear}-${endYear}, Term ${termNumber}`;
}

// POPULATE TERM SELECTOR
export function renderTerms(terms) {

    const select = document.getElementById(
        "recordsTerm"
    );

    select.replaceChildren();

    const placeholder = document.createElement("option");

    placeholder.value = "";
    placeholder.textContent = "Select Term";

    select.appendChild(placeholder);

    terms.forEach(term => {

        const option = document.createElement("option");

        option.value = term;
        option.textContent = formatAcademicTerm(term);

        select.appendChild(option);
    });
}


// HELPER: RENDER RECORD TABLE
function renderRecordTable(tbodyId, records, showTerm) {

    const tbody = document.getElementById(tbodyId);

    tbody.replaceChildren();

    if (records.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = showTerm ? 4 : 3;
        cell.className = "records-empty";
        cell.textContent = "No records to display.";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    records.forEach(record => {

        const row = document.createElement("tr");

        const values = showTerm
            ? [
                formatAcademicTerm(record.term),
                record.course,
                record.units.toFixed(1),
                record.grade.toFixed(1)
            ]
            : [
                record.course,
                record.units.toFixed(1),
                record.grade.toFixed(1)
            ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}


// RENDER FILTERED RECORDS
export function renderFilteredRecords(records) {

    renderRecordTable(
        "recordsFilteredBody",
        records,
        false
    );
}


// RENDER ALL RECORDS
export function renderAllRecords(records) {

    renderRecordTable(
        "recordsAllBody",
        records,
        true
    );
}


// UPDATE DOWNLOAD BUTTON
export function setFilteredDownloadEnabled(enabled) {

    const button = document.getElementById(
        "downloadFilteredRecord"
    );

    button.disabled = !enabled;
}

// UPDATE FILTERED RECORD HEADING
export function setFilteredRecordTitle(term) {

    const title = document.getElementById(
        "filteredRecordTitle"
    );

    if (!title) return;

    title.textContent = term
        ? formatAcademicTerm(term)
        : "Filtered Record";
}