/* ========================================
   GRADE ENCODING INITIALIZATION
======================================== */

(() => {
    "use strict";
    const API_URL = "/backEnd/api/grades.php";

    window.initGradeEncoding = function initGradeEncoding() {
        const root = document.getElementById("grade-encoding");

        if (!root || root.dataset.ready === "1") return;

        root.dataset.ready = "1";

        const courseSelect = document.getElementById("course-select");
        const sectionSelect = document.getElementById("section-select");
        const studentBody = document.getElementById("grade-students-body");
        const status = document.getElementById("grade-status");
        const saveButton = document.getElementById("save-grades-btn");

        if (!courseSelect || !sectionSelect || !studentBody || !status || !saveButton) {
            root.dataset.ready = "0";
            return;
        }

        let csrfToken = "";
        let isSaving = false;

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

        function resetSectionSelect(message = "Select a course first") {
            sectionSelect.replaceChildren(new Option(message, ""));
            sectionSelect.disabled = true;
        }

        function setSaveEnabled(enabled) {
            saveButton.disabled = !enabled || isSaving;
        }

        async function request(url, options = {}) {
            const headers = {
                Accept: "application/json",
                ...(options.headers || {})
            };

            if (options.body !== undefined) {
                headers["Content-Type"] = "application/json";
            }

            const response = await fetch(`${API_URL}${url}`, {
                credentials: "same-origin",
                cache: "no-store",
                ...options,
                headers
            });

            let data;
            
            try {
                data = await response.json();
            } catch {
                throw new Error("Server did not return a valid JSON response.");
            }

            if (!response.ok || data.success !== true) {
                throw new Error(
                    data.error || `Request failed. (HTTP ${response.status})`
                );
            }

            if (data.csrfToken) {
                csrfToken = data.csrfToken;
            }

            return data;
        }

        /* =====================================
           STUDENT LIST
        ===================================== */

        function renderStudents(students) {
            studentBody.replaceChildren();

            if (!Array.isArray(students) || students.length === 0) {
                showMessage("No enlisted students found in this section.");
                setSaveEnabled(false);
                status.textContent = "No students found.";
                return;
            }

            students.forEach(student => {
                const row = document.createElement("tr");
                row.dataset.studentId = String(student.student_id);

                const idCell = document.createElement("td");
                idCell.textContent = String(student.student_id);

                const nameCell = document.createElement("td");
                nameCell.textContent = student.student_name || "—";

                const gradeCell = document.createElement("td");
                const gradeInput = document.createElement("input");
                gradeInput.type = "text";
                gradeInput.className = "grade-input";
                gradeInput.placeholder = "Enter grade";
                gradeInput.maxLength = 5;
                gradeInput.autocomplete = "off";
                gradeInput.value = student.grade_value ?? "";
                gradeInput.setAttribute(
                    "aria-label",
                    `Grade for ${student.student_name || student.student_id}`
                );

                gradeInput.addEventListener("input", () => {
                    status.textContent = "Unsaved grade changes.";
                });

                gradeCell.appendChild(gradeInput);
                row.append(idCell, nameCell, gradeCell);
                studentBody.appendChild(row);
            });

            setSaveEnabled(true);
            status.textContent = `${students.length} student(s) found.`;
        }

        /* =====================================
           LOAD COURSES
        ===================================== */

        async function loadCourses() {
            courseSelect.replaceChildren(new Option("Loading courses...", ""));
            courseSelect.disabled = true;
            resetSectionSelect();
            showMessage("Loading courses...");
            setSaveEnabled(false);

            try {
                const data = await request("?action=courses");
                const courses = Array.isArray(data.courses) ? data.courses : [];

                courseSelect.replaceChildren(new Option("-- Select course --", ""));

                courses.forEach(course => {
                    const label = course.title
                        ? `${course.course_code} — ${course.title}`
                        : course.course_code;
                    courseSelect.add(new Option(label, course.course_code));
                });

                courseSelect.disabled = false;

                if (courses.length === 0) {
                    showMessage("No courses are assigned to you for the current term.");
                    status.textContent = "No assigned courses found.";
                } else {
                    showMessage("Select a course and section first.");
                    status.textContent = `${courses.length} course(s) found.`;
                }
            } catch (error) {
                courseSelect.replaceChildren(new Option("Unable to load courses", ""));
                courseSelect.disabled = true;
                showMessage(error.message);
                status.textContent = "Course loading failed.";
                console.error("Grade Encoding course loading error:", error);
            }
        }

        /* =====================================
           COURSE SELECTION / LOAD SECTIONS
        ===================================== */

        courseSelect.addEventListener("change", async () => {
            const courseCode = courseSelect.value;

            resetSectionSelect(courseCode ? "Loading sections..." : "Select a course first");
            showMessage("Select a section to view students.");
            setSaveEnabled(false);

            if (!courseCode) {
                status.textContent = "Select a course first.";
                return;
            }

            try {
                const data = await request(
                    `?action=sections&course_code=${encodeURIComponent(courseCode)}`
                );
                const sections = Array.isArray(data.sections) ? data.sections : [];

                sectionSelect.replaceChildren(new Option("-- Select section --", ""));

                sections.forEach(section => {
                    sectionSelect.add(
                        new Option(section.section_code, String(section.section_id))
                    );
                });

                sectionSelect.disabled = sections.length === 0;

                if (sections.length === 0) {
                    sectionSelect.replaceChildren(new Option("No sections available", ""));
                    showMessage("No sections are assigned to you for this course.");
                    status.textContent = "No sections found.";
                } else {
                    status.textContent = `${sections.length} section(s) found.`;
                }
            } catch (error) {
                resetSectionSelect("Unable to load sections");
                showMessage(error.message);
                status.textContent = "Section loading failed.";
                console.error("Grade Encoding section loading error:", error);
            }
        });

        /* =====================================
           SECTION SELECTION / LOAD STUDENTS
        ===================================== */

        sectionSelect.addEventListener("change", async () => {
            const sectionId = sectionSelect.value;
            setSaveEnabled(false);

            if (!sectionId) {
                showMessage("Select a section first.");
                status.textContent = "Select a section.";
                return;
            }

            showMessage("Loading students...");
            status.textContent = "Loading students...";

            try {
                const data = await request(
                    `?action=students&section_id=${encodeURIComponent(sectionId)}`
                );

                renderStudents(data.students || []);
            } catch (error) {
                showMessage(error.message);
                status.textContent = "Student loading failed.";
                console.error("Grade Encoding student loading error:", error);
            }
        });

        /* =====================================
           SAVE GRADES TO MYSQL
        ===================================== */

        saveButton.addEventListener("click", async () => {
            const sectionId = Number(sectionSelect.value);
            if (!sectionId || isSaving) return;

            const rows = Array.from(
                studentBody.querySelectorAll("tr[data-student-id]")
            );

            const grades = rows
                .map(row => ({
                    studentId: Number(row.dataset.studentId),
                    grade: row.querySelector(".grade-input")?.value.trim() || ""
                }))
                .filter(item => item.grade !== "");

            if (grades.length === 0) {
                status.textContent = "No grades entered. Existing grades were not changed.";
                return;
            }

            isSaving = true;
            saveButton.disabled = true;
            saveButton.textContent = "Saving...";
            status.textContent = "Saving grades to the database...";

            try {
                const result = await request("", {
                    method: "POST",
                    headers: {
                        "X-CSRF-Token": csrfToken
                    },
                    body: JSON.stringify({ sectionId, grades })
                });

                const data = await request(
                    `?action=students&section_id=${encodeURIComponent(sectionId)}`
                );
                
                renderStudents(data.students || []);
                status.textContent = result.message || `${result.savedCount || 0} grade(s) saved to the database.`;
            } catch (error) {
                status.textContent = error.message;
                console.error("Grade Encoding save error:", error);
            } finally {
                isSaving = false;
                saveButton.textContent = "Save";

                setSaveEnabled(
                    studentBody.querySelectorAll("tr[data-student-id]").length > 0
                );
            }
        });

        loadCourses();
    };

    function tryInitGradeEncoding() {
        const root = document.getElementById("grade-encoding");
        if (root && root.dataset.ready !== "1") {
            window.initGradeEncoding();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", tryInitGradeEncoding, { once: true });
    } else {
        tryInitGradeEncoding();
    }

    if (document.body) {
        const observer = new MutationObserver(tryInitGradeEncoding);
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
