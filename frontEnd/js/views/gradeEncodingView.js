
/* =========================================
   GRADE ENCODING VIEW
   Database-connected version
========================================= */

import {
    VALID_GRADES
} from "../models/gradeEncodingModel.js";


/* =========================================
   CREATE OPTION
========================================= */

function createOption(value, label) {

    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;

    return option;
}


/* =========================================
   RENDER COURSES
========================================= */

export function renderCourses(courses) {

    const select = document.getElementById("gradeCourse");

    select.replaceChildren(
        createOption(
            "",
            courses.length
                ? "-- Select course --"
                : "No assigned courses"
        )
    );

    courses.forEach(course => {

        select.appendChild(
            createOption(
                course.code,
                `${course.code} - ${course.name}`
            )
        );
    });

    select.disabled = courses.length === 0;
}


/* =========================================
   RENDER SECTIONS
========================================= */

export function renderSections(sections) {

    const select = document.getElementById("gradeSection");

    select.replaceChildren();

    if (!sections.length) {

        select.appendChild(
            createOption("", "Select a course first")
        );

        select.disabled = true;

        return;
    }

    select.appendChild(
        createOption("", "-- Select section --")
    );

    sections.forEach(section => {

        select.appendChild(
            createOption(
                String(section.section_id),
                `${section.code} (${section.campus})`
            )
        );
    });

    select.disabled = false;
}


/* =========================================
   RENDER STUDENTS
========================================= */

export function renderStudents(
    students,
    { editable = false } = {}
) {

    const tbody = document.getElementById(
        "gradeEncodingTableBody"
    );

    tbody.replaceChildren();

    if (!students.length) {

        renderEmptyStudents(
            "No students enrolled in this section."
        );

        return;
    }

    students.forEach(student => {

        const row = document.createElement("tr");

        // STUDENT SCHOOL ID
        const idCell = document.createElement("td");

        idCell.textContent = student.id;

        // STUDENT NAME
        const nameCell = document.createElement("td");

        nameCell.textContent = student.name;

        // GRADE CELL
        const gradeCell = document.createElement("td");

        const gradeSelect = document.createElement("select");

        gradeSelect.className = "grade-encoding-input";

        gradeSelect.dataset.studentId = student.id;

        gradeSelect.dataset.enrollmentId =
            String(student.enrollment_id);

        gradeSelect.dataset.gradeStatus =
            student.grade_status;

        gradeSelect.dataset.originalGrade =
            student.grade;

        gradeSelect.setAttribute(
            "aria-label",
            `Grade for ${student.name}`
        );

        gradeSelect.appendChild(
            createOption("", "Not graded")
        );

        VALID_GRADES.forEach(grade => {

            gradeSelect.appendChild(
                createOption(grade, grade)
            );
        });

        gradeSelect.value = student.grade;

        // Prevent clearing an existing saved grade.
        // Grade deletion is not supported by the API.
        gradeSelect.options[0].disabled =
            student.grade !== "";

        // Finalized grades must always remain locked.
        const isFinalized =
            student.grade_status === "finalized";

        gradeSelect.disabled =
            !editable || isFinalized;

        gradeSelect.title = isFinalized
            ? "Finalized grades cannot be modified."
            : "";

        gradeCell.appendChild(gradeSelect);

        // GRADE STATUS
        const status = document.createElement("small");

        status.className = "grade-encoding-status";

        status.style.display = "block";
        status.style.marginTop = "6px";

        if (student.grade_status === "finalized") {

            status.textContent = "Finalized";

        } else if (student.grade_status === "draft") {

            status.textContent = "Draft";

        } else {

            status.textContent = "Not yet graded";
        }

        gradeCell.appendChild(status);

        row.append(idCell, nameCell, gradeCell);

        tbody.appendChild(row);
    });
}


/* =========================================
   EMPTY STUDENT TABLE
========================================= */

export function renderEmptyStudents(message) {

    const tbody = document.getElementById(
        "gradeEncodingTableBody"
    );

    tbody.replaceChildren();

    const row = document.createElement("tr");

    const cell = document.createElement("td");

    cell.colSpan = 3;
    cell.textContent = message;

    row.appendChild(cell);

    tbody.appendChild(row);
}


/* =========================================
   STATUS MESSAGE
========================================= */

export function setMessage(message) {

    document.getElementById(
        "gradeEncodingMessage"
    ).textContent = message;
}



/* =========================================
   UNSAVED CHANGES
========================================= */

export function setUnsavedChanges(
    hasChanges,
    isSaving = false
) {

    document.getElementById(
        "gradeEncodingUnsaved"
    ).hidden = !hasChanges;

    document.getElementById(
        "gradeEncodingSave"
    ).disabled = !hasChanges || isSaving;

}


/* =========================================
   UPDATE INDIVIDUAL GRADE STATUS
========================================= */

export function setGradeChanged(
    enrollmentId,
    hasChanged
) {

    const inputs = document.querySelectorAll(
        "#gradeEncodingTableBody .grade-encoding-input"
    );

    const input = [...inputs].find(item =>
        item.dataset.enrollmentId === String(enrollmentId)
    );

    if (!input) return;

    const status = input.closest("td").querySelector(
        ".grade-encoding-status"
    );

    if (!status) return;


    // Never display finalized grades as unsaved.
    if (input.dataset.gradeStatus === "finalized") {

        status.textContent = "Finalized";

        return;

    }


    if (hasChanged) {

        status.textContent = "Unsaved";

    } else if (input.dataset.gradeStatus === "draft") {

        status.textContent = "Draft";

    } else {

        status.textContent = "Not yet graded";

    }

}


/* =========================================
   SAVING STATE
========================================= */

export function setSavingState(
    isSaving,
    hasChanges = false
) {

    const saveButton = document.getElementById(
        "gradeEncodingSave"
    );

    const courseSelect = document.getElementById(
        "gradeCourse"
    );

    const sectionSelect = document.getElementById(
        "gradeSection"
    );

    const inputs = document.querySelectorAll(
        "#gradeEncodingTableBody .grade-encoding-input"
    );


    // Temporarily lock controls while saving.
    courseSelect.disabled =
        isSaving || courseSelect.options.length <= 1;

    sectionSelect.disabled =
        isSaving || sectionSelect.options.length <= 1;


    inputs.forEach(input => {

        input.disabled =
            isSaving ||
            input.dataset.gradeStatus === "finalized";

    });


    saveButton.textContent = isSaving
        ? "Saving..."
        : "Save";


    setUnsavedChanges(hasChanges, isSaving);

}

