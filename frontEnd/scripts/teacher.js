// ========================================
// Grade Encoding - Frontend Mock Data
// ========================================

const GRADE_OPTIONS = [
    "4.0",
    "3.5",
    "3.0",
    "2.5",
    "2.0",
    "1.5",
    "1.0",
    "fail",
    "pass"
];

// Courses and their available sections
const MOCK_COURSES = [
    { code: "CCPROG3", sections: ["X05", "SS1"] },
    { code: "CCAPDEV", sections: ["N24", "SS1"] },
    { code: "STADVDB", sections: ["S40B"] },
    { code: "GEETHIC", sections: ["XZ08", "XZ09"] },
    { code: "SAS2000", sections: ["X05"] }
];

// Student information
const MOCK_STUDENTS = [
    { id: "12208469", name: "student1" },
    { id: "12308468", name: "student2" },
    { id: "12345678", name: "student3" },
    { id: "12412312", name: "student4" }
];

// Course-section enrollments
const MOCK_ENROLLMENTS = {
    "CCAPDEV_SS1": ["12208469"],
    "STADVDB_S40B": [
        "12208469",
        "12308468",
        "12345678"
    ],
    "GEETHIC_XZ09": ["12208469"],
    "SAS2000_X05": [
        "12208469",
        "12308468",
        "12345678"
    ],
    "CCAPDEV_N24": ["12308468"],
    "CCPROG3_SS1": ["12345678"],
    "CCPROG3_X05": ["12412312"],
    "GEETHIC_XZ08": ["12412312"]
};

// Temporary grade storage (frontend only)
const MOCK_GRADES = {};

/* ========================================
   GRADE ENCODING INITIALIZATION
======================================== */

function initGradeEncoding() {
    const courseSelect = document.getElementById("course-select");
    const sectionSelect = document.getElementById("section-select");
    const studentBody = document.getElementById("grade-students-body");
    const status = document.getElementById("grade-status");
    const saveButton = document.getElementById("save-grades-btn");

    if (!courseSelect || !sectionSelect || !studentBody || !status || !saveButton) return;

    // Populate the course dropdown
    courseSelect.replaceChildren(
        new Option("-- Select course --", "")
    );

    MOCK_COURSES.forEach(course => {
        courseSelect.add(
            new Option(course.code, course.code)
        );
    });

    sectionSelect.replaceChildren(
        new Option("Select a course first", "")
    );

    sectionSelect.disabled = true;
    saveButton.disabled = true;

    /* =====================================
       HELPERS
    ===================================== */

    function showMessage(message) {
        studentBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 3;
        cell.textContent = message;

        row.appendChild(cell);
        studentBody.appendChild(row);
    }

    /* =====================================
       RENDER STUDENTS
    ===================================== */

    function renderStudents(courseCode, sectionCode) {
        studentBody.replaceChildren();

        const enrollmentKey = `${courseCode}_${sectionCode}`;
        const studentIds = MOCK_ENROLLMENTS[enrollmentKey] || [];

        const students = studentIds
            .map(id => MOCK_STUDENTS.find(student => student.id === id))
            .filter(Boolean)
            .sort((a, b) => a.id.localeCompare(b.id));

        if (students.length === 0) {
            showMessage("No students are enrolled in this section.");
            saveButton.disabled = true;
            status.textContent = "No students found.";
            return;
        }

        students.forEach(student => {
            const row = document.createElement("tr");
            row.dataset.studentId = student.id;

            const idCell = document.createElement("td");
            idCell.textContent = student.id;

            const nameCell = document.createElement("td");
            nameCell.textContent = student.name;

            const gradeCell = document.createElement("td");
            const gradeSelect = document.createElement("select");

            gradeSelect.className = "grade-select";
            gradeSelect.setAttribute(
                "aria-label",
                `Grade for ${student.name}`
            );

            gradeSelect.add(
                new Option("-- Select grade --", "")
            );

            GRADE_OPTIONS.forEach(grade => {
                gradeSelect.add(
                    new Option(grade, grade)
                );
            });

            // Restore temporarily saved grade
            const savedGrade = MOCK_GRADES[enrollmentKey]?.[student.id] || "";
            gradeSelect.value = savedGrade;

            gradeSelect.addEventListener("change", () => {
                status.textContent = "Unsaved grade changes.";
            });

            gradeCell.appendChild(gradeSelect);

            row.append(idCell, nameCell, gradeCell);
            studentBody.appendChild(row);
        });

        saveButton.disabled = false;
        status.textContent = `${students.length} student(s) found.`;
    }

    /* =====================================
       COURSE SELECTION
    ===================================== */

    courseSelect.addEventListener("change", () => {
        const courseCode = courseSelect.value;

        sectionSelect.replaceChildren(
            new Option(
                courseCode
                    ? "-- Select section --"
                    : "Select a course first",
                ""
            )
        );

        studentBody.replaceChildren();
        saveButton.disabled = true;

        if (!courseCode) {
            sectionSelect.disabled = true;
            showMessage("Select a course and section first.");
            status.textContent = "Select a course first.";
            return;
        }

        const course = MOCK_COURSES.find(
            item => item.code === courseCode
        );

        if (!course) return;

        course.sections.forEach(section => {
            sectionSelect.add(
                new Option(section, section)
            );
        });

        sectionSelect.disabled = false;

        showMessage("Select a section to view students.");
        status.textContent = "Select a section.";
    });

    /* =====================================
       SECTION SELECTION
    ===================================== */

    sectionSelect.addEventListener("change", () => {
        const courseCode = courseSelect.value;
        const sectionCode = sectionSelect.value;

        saveButton.disabled = true;

        if (!courseCode || !sectionCode) {
            showMessage("Select a section first.");
            status.textContent = "Select a section.";
            return;
        }

        renderStudents(courseCode, sectionCode);
    });

    /* =====================================
       SAVE GRADES
    ===================================== */

    saveButton.addEventListener("click", () => {
        const courseCode = courseSelect.value;
        const sectionCode = sectionSelect.value;

        if (!courseCode || !sectionCode) return;

        const enrollmentKey = `${courseCode}_${sectionCode}`;

        if (!MOCK_GRADES[enrollmentKey]) {
            MOCK_GRADES[enrollmentKey] = {};
        }

        const rows = Array.from(
            studentBody.querySelectorAll("tr[data-student-id]")
        );

        let savedCount = 0;

        rows.forEach(row => {
            const studentId = row.dataset.studentId;
            const grade = row.querySelector(".grade-select").value;

            if (grade !== "") {
                MOCK_GRADES[enrollmentKey][studentId] = grade;
                savedCount++;
            } else {
                delete MOCK_GRADES[enrollmentKey][studentId];
            }
        });

        status.textContent = `${savedCount} grade(s) saved temporarily.`;
    });
}