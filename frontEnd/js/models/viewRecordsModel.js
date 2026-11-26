
/* =========================================
   VIEW RECORDS MODEL
========================================= */

// Mock academic records
const academicRecords = [
    {
        term: "Y2526-1",
        course: "CCPROG1",
        units: 3.0,
        grade: 4.0
    },
    {
        term: "Y2526-1",
        course: "CCDSALM",
        units: 3.0,
        grade: 3.5
    },
    {
        term: "Y2526-2",
        course: "CCAPDEV",
        units: 3.0,
        grade: 3.5
    }
];


// GET ALL RECORDS
export function getAllRecords() {

    return academicRecords.map(
        record => ({ ...record })
    );
}


// GET AVAILABLE TERMS
export function getTerms() {

    return [...new Set(
        academicRecords.map(record => record.term)
    )];
}


// FILTER RECORDS BY TERM
export function getRecordsByTerm(term) {

    if (!term) {
        return [];
    }

    return academicRecords
        .filter(record => record.term === term)
        .map(record => ({ ...record }));
}
