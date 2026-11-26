
/* =========================================
   VIEW RECORDS CONTROLLER
========================================= */

import * as Model from "../models/viewRecordsModel.js";
import * as View from "../views/viewRecordsView.js";

let selectedTerm = "";


// DOWNLOAD CSV FILE
function downloadCSV(records, filename) {

    if (records.length === 0) {
        return;
    }

    const headers = [
        "Term",
        "Course",
        "Units",
        "Grade"
    ];

    // Escape spreadsheet formulas and CSV characters
    const escapeCSV = value => {

        let text = String(value);

        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replaceAll('"', '""') + '"';
    };

    const rows = records.map(record => [
        View.formatAcademicTerm(record.term),
        record.course,
        record.units.toFixed(1),
        record.grade.toFixed(1)
    ]);

    const csv = [
        headers,
        ...rows
    ].map(row => row.map(escapeCSV).join(","))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF", csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}


// REFRESH FILTERED RECORDS
function refreshFilteredRecords() {

    const records = Model.getRecordsByTerm(
        selectedTerm
    );

    View.setFilteredRecordTitle(selectedTerm);

    View.renderFilteredRecords(records);

    View.setFilteredDownloadEnabled(
        records.length > 0
    );
}


// INITIALIZE VIEW RECORDS
export function initializeViewRecords() {

    const termSelect = document.getElementById(
        "recordsTerm"
    );

    const filteredDownload = document.getElementById(
        "downloadFilteredRecord"
    );

    const fullDownload = document.getElementById(
        "downloadFullRecord"
    );


    // INITIAL DATA
    View.renderTerms(Model.getTerms());

    termSelect.value = selectedTerm;

    View.renderAllRecords(
        Model.getAllRecords()
    );

    refreshFilteredRecords();


    // HANDLE TERM CHANGES
    termSelect.addEventListener("change", () => {

        selectedTerm = termSelect.value;

        refreshFilteredRecords();
    });


    // DOWNLOAD FILTERED RECORD
    filteredDownload.addEventListener("click", () => {

        const records = Model.getRecordsByTerm(
            selectedTerm
        );

        downloadCSV(
            records,
            `ArchersHub_Record_${selectedTerm}.csv`
        );
    });


    // DOWNLOAD FULL RECORD
    fullDownload.addEventListener("click", () => {

        downloadCSV(
            Model.getAllRecords(),
            "ArchersHub_Full_Record.csv"
        );
    });
}
