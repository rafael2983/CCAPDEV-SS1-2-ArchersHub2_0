
/* =========================================
   GRADE ENCODING CONTROLLER
   Milestone 8E-D: Draft grade saving
========================================= */

import * as Model from "../models/gradeEncodingModel.js";

import * as View from "../views/gradeEncodingView.js";


let eventController = null;

let activeGradeGuard = null;


/* =========================================
   GRADE ENCODING NAVIGATION PROTECTION
========================================= */

export function canLeaveGradeEncoding() {

    if (!activeGradeGuard) {

        return true;

    }

    return activeGradeGuard();

}


/* =========================================
   BROWSER REFRESH / TAB CLOSE PROTECTION
========================================= */

function handleBeforeUnload(event) {

    event.preventDefault();

    event.returnValue = "";

}


function setBrowserLeaveProtection(enabled) {

    window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
    );

    if (enabled) {

        window.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

    }

}


/* =========================================
   INITIALIZE GRADE ENCODING
========================================= */

export async function initializeGradeEncoding() {

    // Remove previous event listeners.
    if (eventController) {
        eventController.abort();
    }

    // Reset protection from the previous page instance.
    activeGradeGuard = null;

    setBrowserLeaveProtection(false);

    eventController = new AbortController();

    const signal = eventController.signal;

    const page = document.querySelector(
        ".grade-encoding-page"
    );

    if (!page) return;


    const courseSelect = page.querySelector(
        "#gradeCourse"
    );

    const sectionSelect = page.querySelector(
        "#gradeSection"
    );

    const tableBody = page.querySelector(
        "#gradeEncodingTableBody"
    );

    const saveButton = page.querySelector(
        "#gradeEncodingSave"
    );


    /* =====================================
       CONTROLLER STATE
    ===================================== */

    let rosterRequestId = 0;

    let selectedCourse = "";

    let selectedSection = "";

    let currentStudents = [];

    let isSaving = false;

    let isLoadingRoster = false;

    const pendingGrades = new Map();


    /* =====================================
       PAGE SAFETY CHECK
    ===================================== */

    function isPageActive() {

        return !signal.aborted &&
            page.isConnected &&
            document.querySelector(
                ".grade-encoding-page"
            ) === page;

    }


    /* =====================================
       UNSAVED CHANGES
    ===================================== */

    function refreshUnsavedState() {

        View.setUnsavedChanges(
            pendingGrades.size > 0,
            isSaving || isLoadingRoster
        );

        setBrowserLeaveProtection(
            pendingGrades.size > 0 || isSaving
        );

    }


    function clearPendingGrades() {

        pendingGrades.clear();

        refreshUnsavedState();

    }


    function confirmDiscardChanges() {

        if (pendingGrades.size === 0) {

            return true;

        }

        return window.confirm(
            "You have unsaved grade changes. " +
            "Do you want to discard them?"
        );

    }


    /* =====================================
       REGISTER DASHBOARD NAVIGATION GUARD
    ===================================== */

    activeGradeGuard = () => {

        // Ignore an outdated page instance.
        if (!isPageActive()) {

            return true;

        }


        // Prevent dashboard navigation during saving.
        if (isSaving) {

            View.setMessage(
                "Grades are currently being saved. " +
                "Please wait before leaving this page."
            );

            return false;

        }


        // Ask for confirmation if changes exist.
        return confirmDiscardChanges();

    };



    /* =====================================
       LOAD STUDENT ROSTER
    ===================================== */

    async function loadRoster(
        sectionId,
        successMessage = ""
    ) {

        const requestId = ++rosterRequestId;

        currentStudents = [];

        isLoadingRoster = true;

        refreshUnsavedState();


        View.renderEmptyStudents(
            "Loading enrolled students..."
        );

        View.setMessage(
            "Retrieving student roster..."
        );


        try {

            const roster =
                await Model.loadStudents(sectionId);


            // Ignore outdated responses.
            if (
                !isPageActive() ||
                requestId !== rosterRequestId
            ) {

                return;

            }


            currentStudents = roster.students;


            View.renderStudents(
                currentStudents,
                { editable: !isSaving }
            );


            const classInfo = roster.class;

            const count = roster.total_students;

            const studentLabel =
                count === 1 ? "student" : "students";


            View.setMessage(
                successMessage ||
                (
                    `Showing ${count} ${studentLabel} in ` +
                    `${classInfo.code} - ${classInfo.section}.`
                )
            );


        } catch (error) {

            if (
                !isPageActive() ||
                requestId !== rosterRequestId
            ) {

                return;

            }

            console.error(
                "Unable to load student roster:",
                error
            );

            currentStudents = [];

            View.renderEmptyStudents(
                "Unable to retrieve student roster."
            );

            View.setMessage(
                successMessage
                    ? successMessage +
                    " However, the roster could not be refreshed. " +
                    "Please select the section again."
                    : `${error.message} Please select the section again.`
            );


        } finally {

            if (
                isPageActive() &&
                requestId === rosterRequestId
            ) {

                isLoadingRoster = false;

                refreshUnsavedState();

            }

        }

    }


    /* =====================================
       INITIAL LOADING STATE
    ===================================== */

    View.renderCourses([]);

    View.renderSections([]);

    courseSelect.options[0].textContent =
        "Loading assigned courses...";

    View.renderEmptyStudents(
        "Loading assigned classes..."
    );

    View.setMessage(
        "Retrieving your assigned classes..."
    );

    View.setUnsavedChanges(false);


    /* =====================================
       LOAD ASSIGNED CLASSES
    ===================================== */

    try {

        await Model.loadAssignedClasses();

        if (!isPageActive()) return;


        const courses = Model.getCourses();

        View.renderCourses(courses);


        if (!courses.length) {

            View.renderEmptyStudents(
                "No assigned classes available."
            );

            View.setMessage(
                "You have no assigned classes for the active term."
            );

            return;

        }


        View.renderEmptyStudents(
            "Select a course and section first."
        );

        View.setMessage(
            "Select a course and section to view students."
        );


    } catch (error) {

        if (!isPageActive()) return;

        console.error(
            "Unable to load assigned classes:",
            error
        );

        View.renderCourses([]);

        courseSelect.options[0].textContent =
            "Unable to load courses";

        View.renderEmptyStudents(
            "Unable to retrieve assigned classes."
        );

        View.setMessage(
            `${error.message} Please reopen the page to retry.`
        );

        return;

    }


    /* =====================================
       COURSE SELECTION
    ===================================== */

    courseSelect.addEventListener(
        "change",
        () => {

            if (!isPageActive()) return;


            if (
                isSaving ||
                !confirmDiscardChanges()
            ) {

                courseSelect.value = selectedCourse;

                return;

            }


            // Invalidate previous roster requests.
            rosterRequestId++;

            isLoadingRoster = false;

            selectedCourse = courseSelect.value;

            selectedSection = "";

            currentStudents = [];

            clearPendingGrades();


            const sections =
                Model.getSections(selectedCourse);

            View.renderSections(sections);


            View.renderEmptyStudents(
                selectedCourse
                    ? "Select a section first."
                    : "Select a course and section first."
            );


            View.setMessage(
                selectedCourse
                    ? "Select a section to view students."
                    : "Select a course and section to view students."
            );

        },
        { signal }
    );


    /* =====================================
       SECTION SELECTION
    ===================================== */

    sectionSelect.addEventListener(
        "change",
        async () => {

            if (!isPageActive()) return;


            if (
                isSaving ||
                !confirmDiscardChanges()
            ) {

                sectionSelect.value = selectedSection;

                return;

            }


            rosterRequestId++;

            isLoadingRoster = false;

            selectedSection = sectionSelect.value;

            currentStudents = [];

            clearPendingGrades();


            if (!selectedSection) {

                View.renderEmptyStudents(
                    "Select a section first."
                );

                View.setMessage(
                    "Select a section to view students."
                );

                return;

            }


            await loadRoster(selectedSection);

        },
        { signal }
    );


    /* =====================================
       TRACK GRADE CHANGES
    ===================================== */

    tableBody.addEventListener(
        "change",
        event => {

            if (
                !isPageActive() ||
                isSaving ||
                isLoadingRoster
            ) {

                return;

            }


            const input = event.target.closest(
                ".grade-encoding-input"
            );

            if (!input || input.disabled) return;


            const enrollmentId =
                Number(input.dataset.enrollmentId);


            const student = currentStudents.find(
                item =>
                    item.enrollment_id === enrollmentId
            );


            if (
                !student ||
                student.grade_status === "finalized"
            ) {

                return;

            }


            const originalGrade = student.grade;

            const selectedGrade = input.value;


            // Reverting to the original grade removes
            // the pending change.
            if (selectedGrade === originalGrade) {

                pendingGrades.delete(enrollmentId);

                View.setGradeChanged(
                    enrollmentId,
                    false
                );

                refreshUnsavedState();

                return;

            }


            // Reject unsupported grade values.
            if (
                !Model.VALID_GRADES.includes(
                    selectedGrade
                )
            ) {

                input.value =
                    pendingGrades.get(enrollmentId)?.grade
                    ?? originalGrade;

                View.setMessage(
                    "Please select a valid numerical grade."
                );

                return;

            }


            // Store one pending change per enrollment.
            pendingGrades.set(
                enrollmentId,
                {
                    enrollment_id: enrollmentId,
                    grade: selectedGrade
                }
            );


            View.setGradeChanged(
                enrollmentId,
                true
            );

            refreshUnsavedState();

        },
        { signal }
    );


    /* =====================================
       SAVE DRAFT GRADES
    ===================================== */

    saveButton.addEventListener(
        "click",
        async () => {

            if (
                !isPageActive() ||
                isSaving ||
                isLoadingRoster ||
                !selectedSection ||
                pendingGrades.size === 0
            ) {

                return;

            }


            const sectionId =
                Number(selectedSection);

            const grades =
                [...pendingGrades.values()].map(
                    entry => ({ ...entry })
                );


            isSaving = true;

            View.setSavingState(true, true);

            refreshUnsavedState();

            View.setMessage(
                "Saving draft grades..."
            );


            try {

                const result = await Model.saveGrades(
                    sectionId,
                    grades
                );


                if (!isPageActive()) return;


                // The API has confirmed the save.
                pendingGrades.clear();


                const count = result.saved_count;

                const gradeLabel =
                    count === 1 ? "grade" : "grades";


                await loadRoster(
                    sectionId,
                    `${count} draft ${gradeLabel} saved successfully.`
                );


            } catch (error) {

                if (!isPageActive()) return;


                console.error(
                    "Unable to save draft grades:",
                    error
                );


                // Preserve pending changes for retry.
                View.setMessage(
                    `${error.message} Your unsaved changes ` +
                    "have been retained. Verify the roster " +
                    "before retrying if the save result is uncertain."
                );


            } finally {

                isSaving = false;


                if (isPageActive()) {

                    View.setSavingState(
                        false,
                        pendingGrades.size > 0
                    );

                    refreshUnsavedState();

                }

            }

        },
        { signal }
    );

}

/* =========================================
   CLEAN UP GRADE ENCODING
========================================= */

export function cleanupGradeEncoding() {

    if (eventController) {

        eventController.abort();

        eventController = null;

    }

    activeGradeGuard = null;

    setBrowserLeaveProtection(false);

}
