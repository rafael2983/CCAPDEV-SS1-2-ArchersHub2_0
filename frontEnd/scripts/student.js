
/* =========================================
   ARCHERSHUB 2.0 - STUDENT SCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       IMPORT COMMON FUNCTIONS
    ========================================= */

    const common = window.ArchersHubCommon;

    if (!common) {
        console.error("Common functions are not available.");
        return;
    }

    const {
        $,
        mainContent,
        sidebar,

        STORE_KEY,
        RECORDS,

        escapeHTML,
        toast,
        readJSON,
        writeJSON,

        parseSlots,
        entryFromRow,
        buildGrid
    } = common;

    /* =========================================
       ENLISTMENT INITIALIZATION
    ========================================= */

    function initEnlistment() {
        const searchInput = document.getElementById("course-search");
        const sortSelect = document.getElementById("course-sort");
        const courseBody = document.getElementById("course-body");

        if (!searchInput || !sortSelect || !courseBody) return;

        // Add the existing search and sorting
        // functionality here when available.
    }

    /* =========================================
       ENLISTMENT + ADD / DROP (shared table logic)
    ========================================= */

    function initCourseTable(mode) {

        const body = $("course-body");
        if (!body) return;

        const search = $("course-search");
        const sort = $("course-sort");
        const none = $("no-results");
        const chosenList = $("chosen-list");
        const chosenCount = $("chosen-count");
        const changesList = $("changes-list");
        const reason = $("change-reason");
        const reasonOther = $("change-reason-other");
        const agree = $("agree-policy");
        const submit = $("submit-btn");
        const save = $("save-btn");
        const icForm = $("intercampus-form");
        const icReason = $("ic-reason");
        const chosenPanel = $("chosen-panel");
        const schedulePanel = $("schedule-panel");
        const draftKey = "archershub.draft." + mode;

        const pending = new Map();   // course code -> action
        let campus = "laguna";
        let submitted = false;

        const rows = () => [...body.querySelectorAll("tr[data-code]")];
        const isEnrolled = row => row.dataset.status === "enrolled";

        // Courses the student would have if the pending changes went through
        function currentRows() {
            return rows().filter(row => {
                const action = pending.get(row.dataset.code);

                if (mode === "enlist") return action === "add";
                if (isEnrolled(row)) return action !== "drop";
                return action === "add";
            });
        }

        function findConflict(row) {
            const mine = parseSlots(row);

            return currentRows().find(other => other !== row &&
                parseSlots(other).some(o => mine.some(m =>
                    m.day === o.day && m.end > m.start && o.end > o.start &&
                    m.start < o.end && o.start < m.end)));
        }

        function setPending(row, on) {
            const btn = row.querySelector(".row-btn");
            const code = row.dataset.code;
            const action = btn.dataset.action;

            if (on) {
                pending.set(code, action);

                if (!btn.dataset.orig) {
                    btn.dataset.orig = btn.textContent;
                    btn.dataset.origClass = [...btn.classList].find(c => ["add", "drop", "change"].includes(c));
                }

                btn.classList.remove(btn.dataset.origClass);
                btn.classList.add("undo");
                btn.textContent = "Undo";
                row.classList.add(action === "drop" ? "pending-drop" : "pending-add");
            } else {
                pending.delete(code);

                btn.classList.remove("undo");
                btn.classList.add(btn.dataset.origClass);
                btn.textContent = btn.dataset.orig;
                row.classList.remove("pending-add", "pending-drop");
            }
        }

        function applyFilters() {
            const q = search.value.trim().toLowerCase();
            const [key, order] = sort.value.split("-");

            rows().sort((a, b) => {
                const av = (key === "code" ? a.dataset.code : a.dataset.name).toLowerCase();
                const bv = (key === "code" ? b.dataset.code : b.dataset.name).toLowerCase();
                return av.localeCompare(bv) * (order === "desc" ? -1 : 1);
            }).forEach(row => body.appendChild(row));

            let visible = 0;

            rows().forEach(row => {
                const matches =
                    (!q || row.dataset.code.toLowerCase().includes(q) || row.dataset.name.toLowerCase().includes(q)) &&
                    row.dataset.campus === campus;

                row.hidden = !matches;
                if (matches) visible++;
            });

            none.hidden = visible > 0;
        }

        function render() {
            const current = currentRows();

            chosenList.innerHTML = current.length
                ? current.map(row => {
                    const e = entryFromRow(row);
                    return "<li><span>" + escapeHTML(e.code) + " - " + escapeHTML(e.name) +
                        "</span><small>" + escapeHTML(e.section) + "</small></li>";
                }).join("")
                : '<li class="empty">' + (mode === "enlist"
                    ? "No courses chosen yet. Press Add on a course to start."
                    : "No enrolled courses.") + "</li>";

            chosenCount.textContent = current.length;

            if (changesList) {
                const labels = { add: "Add", drop: "Drop", change: "Change" };

                changesList.innerHTML = pending.size
                    ? [...pending].map(([code, action]) => {
                        const row = rows().find(r => r.dataset.code === code);
                        return '<li class="' + (action === "drop" ? "drop-item" : "") + '"><span>' +
                            labels[action] + " " + escapeHTML(code) + "</span><small>" +
                            escapeHTML(row.dataset.name) + "</small></li>";
                    }).join("")
                    : '<li class="empty">No changes yet. Press Add, Drop or Change on a course.</li>';
            }

            buildGrid($("schedule-body"), current.map(entryFromRow));

            const needsIC = rows().some(row =>
                row.dataset.intercampus === "true" && ["add", "change"].includes(pending.get(row.dataset.code)));

            if (icForm) icForm.hidden = !needsIC;

            const reasonOk = mode !== "adddrop" || !reason || reason.value !== "" &&
                (reason.value !== "other" || reasonOther.value.trim() !== "");
            const icOk = !needsIC || (icReason && icReason.value.trim() !== "");

            submit.disabled = submitted || pending.size === 0 || !agree.checked || !reasonOk || !icOk;
        }

        /* events */

        body.addEventListener("click", event => {
            const btn = event.target.closest(".row-btn");
            if (!btn || btn.disabled) return;

            const row = btn.closest("tr[data-code]");
            const code = row.dataset.code;

            if (pending.has(code)) {
                setPending(row, false);
            } else {
                if (btn.dataset.action === "add") {
                    const clash = findConflict(row);

                    if (clash) {
                        toast(code + " conflicts with " + clash.dataset.code + " in your schedule.", "error");
                        return;
                    }
                }

                setPending(row, true);
            }

            submitted = false;
            render();
        });

        search.addEventListener("input", applyFilters);
        sort.addEventListener("change", applyFilters);

        mainContent.querySelectorAll(".campus-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                campus = btn.dataset.campus;

                mainContent.querySelectorAll(".campus-btn").forEach(other => {
                    const on = other === btn;
                    other.classList.toggle("active", on);
                    other.setAttribute("aria-pressed", String(on));
                });

                applyFilters();
            });
        });

        const tabs = [$("tab-chosen"), $("tab-schedule")];

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const showSchedule = tab.dataset.view === "schedule";

                tabs.forEach(t => {
                    t.classList.toggle("active", t === tab);
                    t.setAttribute("aria-selected", String(t === tab));
                });

                chosenPanel.hidden = showSchedule;
                schedulePanel.hidden = !showSchedule;
            });
        });

        [agree, reason, reasonOther, icReason].forEach(field => {
            if (!field) return;

            field.addEventListener("input", () => {
                if (field === reason && reasonOther) reasonOther.hidden = reason.value !== "other";
                submitted = false;
                render();
            });

            field.addEventListener("change", () => field.dispatchEvent(new Event("input")));
        });

        save.addEventListener("click", () => {
            writeJSON(draftKey, [...pending]);
            toast("Draft saved.", "success");
        });

        submit.addEventListener("click", () => {
            if (submit.disabled) return;

            if (mode === "enlist") {
                const entries = currentRows().map(entryFromRow);
                const kept = readJSON(STORE_KEY, []).filter(s => !entries.some(e => e.code === s.code));

                writeJSON(STORE_KEY, [...kept, ...entries]);
                toast("Enlisted in " + entries.length + " course(s). It now shows in View Schedule.", "success");
            } else {
                toast("Add/drop request submitted for review.", "success");
            }

            localStorage.removeItem(draftKey);

            rows().forEach(row => {
                if (pending.has(row.dataset.code)) row.querySelector(".row-btn").disabled = true;
            });

            submitted = true;
            render();
        });

        const specialLink = $("special-class-link");

        if (specialLink) {
            specialLink.addEventListener("click", event => {
                event.preventDefault();
                const link = sidebar && sidebar.querySelector('[data-page="apply-special"]');
                if (link) link.click();
            });
        }

        /* restore any saved draft */

        readJSON(draftKey, []).forEach(([code, action]) => {
            const row = rows().find(r => r.dataset.code === code);
            if (row && row.querySelector(".row-btn").dataset.action === action) setPending(row, true);
        });

        applyFilters();
        render();
    }

    /* =========================================
       SPECIAL CLASS
    ========================================= */

    function initSpecialClass() {

        const body = $("applied-body");
        if (!body) return;

        const search = $("applied-search");
        const none = $("no-applied");
        const course = $("sc-course");
        const notListed = $("not-listed-box");
        const campusSelect = $("sc-campus");
        const reason = $("sc-reason");
        const list = $("requested-list");
        const count = $("requested-count");
        const withdrawBtn = $("withdraw-btn");
        const applyBtn = $("apply-btn");
        const submitBtn = $("submit-btn");

        let campus = "either";
        let requests = [];
        let selectedId = null;

        function filterApplied() {
            const q = search.value.trim().toLowerCase();
            let visible = 0;

            body.querySelectorAll("tr[data-code]").forEach(row => {
                const matches =
                    (!q || row.dataset.code.toLowerCase().includes(q) || row.dataset.name.toLowerCase().includes(q)) &&
                    (campus === "either" || row.dataset.campus === campus);

                row.hidden = !matches;
                if (matches) visible++;
            });

            none.hidden = visible > 0;
        }

        function renderRequests() {
            list.innerHTML = requests.length
                ? requests.map(r =>
                    '<li data-id="' + r.id + '" class="' + (r.id === selectedId ? "selected" : "") + '"><span>' +
                    escapeHTML(r.code) + " - " + escapeHTML(r.name) + " (" + escapeHTML(r.campus) + ")</span><small>" +
                    escapeHTML(r.reason) + "</small></li>").join("")
                : '<li class="empty">You haven\'t applied for any special class yet.</li>';

            count.textContent = requests.length;
            withdrawBtn.disabled = selectedId === null;
            submitBtn.disabled = requests.length === 0;
        }

        mainContent.querySelectorAll(".campus-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                campus = btn.dataset.campus;

                mainContent.querySelectorAll(".campus-btn").forEach(other => {
                    const on = other === btn;
                    other.classList.toggle("active", on);
                    other.setAttribute("aria-pressed", String(on));
                });

                filterApplied();
            });
        });

        search.addEventListener("input", filterApplied);

        course.addEventListener("change", () => {
            notListed.hidden = course.value !== "not-listed";
        });

        // "Apply" beside an already-applied course fills in the form for it
        body.addEventListener("click", event => {
            const btn = event.target.closest(".row-btn");
            if (!btn) return;

            const row = btn.closest("tr[data-code]");

            if ([...course.options].some(o => o.value === row.dataset.code)) {
                course.value = row.dataset.code;
                notListed.hidden = true;
            }

            campusSelect.value = row.dataset.campus;
            reason.focus();
            toast("Add your reason, then press Apply.", "info");
        });

        applyBtn.addEventListener("click", () => {
            if (!course.value) {
                toast("Please select a course.", "error");
                return;
            }

            let code = course.value;
            let name = course.options[course.selectedIndex].text.split(" - ").slice(1).join(" - ");

            if (course.value === "not-listed") {
                code = $("sc-other-code").value.trim().toUpperCase();
                name = $("sc-other-name").value.trim();

                if (!code || !name || !$("sc-college").value) {
                    toast("Enter the course code, name and college.", "error");
                    return;
                }
            }

            if (!reason.value.trim()) {
                toast("Please give a reason for the special class.", "error");
                return;
            }

            if (requests.some(r => r.code === code)) {
                toast(code + " is already in your requests.", "error");
                return;
            }

            requests.push({
                id: Date.now(),
                code,
                name,
                campus: campusSelect.options[campusSelect.selectedIndex].text,
                reason: reason.value.trim()
            });

            reason.value = "";
            renderRequests();
            toast(code + " added to your requests.", "success");
        });

        list.addEventListener("click", event => {
            const item = event.target.closest("li[data-id]");
            if (!item) return;

            const id = Number(item.dataset.id);
            selectedId = selectedId === id ? null : id;
            renderRequests();
        });

        withdrawBtn.addEventListener("click", () => {
            requests = requests.filter(r => r.id !== selectedId);
            selectedId = null;
            renderRequests();
            toast("Application withdrawn.", "info");
        });

        submitBtn.addEventListener("click", () => {
            requests.forEach(r => {
                const row = body.querySelector('tr[data-code="' + r.code + '"]');
                if (row) row.querySelector(".count-cell").textContent =
                    Number(row.querySelector(".count-cell").textContent) + 1;
            });

            toast(requests.length + " special class application(s) submitted.", "success");
            requests = [];
            selectedId = null;
            renderRequests();
        });

        filterApplied();
        renderRequests();
    }


    /* =========================================
       COURSE WITHDRAWAL
    ========================================= */

    function initWithdrawal() {

        const body = $("wd-body");
        if (!body) return;

        const list = $("wd-list");
        const reason = $("wd-reason");
        const agree = $("wd-agree");
        const submit = $("wd-submit");
        const selected = new Set();

        $("wd-period").textContent = "Withdrawal period: open until the posted deadline (see University Calendar).";

        function render() {
            list.innerHTML = selected.size
                ? [...selected].map(code => {
                    const row = body.querySelector('tr[data-code="' + code + '"]');
                    return '<li class="drop-item"><span>' + escapeHTML(code) + "</span><small>" +
                        escapeHTML(row.cells[1].textContent) + "</small></li>";
                }).join("")
                : '<li class="empty">No courses selected for withdrawal.</li>';

            submit.disabled = selected.size === 0 || !reason.value || !agree.checked;
        }

        body.addEventListener("click", event => {
            const btn = event.target.closest(".row-btn");
            if (!btn || btn.disabled) return;

            const row = btn.closest("tr[data-code]");
            const code = row.dataset.code;

            if (selected.has(code)) {
                selected.delete(code);
                btn.textContent = "Withdraw";
                btn.classList.remove("undo");
                btn.classList.add("drop");
                row.classList.remove("pending-drop");
            } else {
                selected.add(code);
                btn.textContent = "Undo";
                btn.classList.remove("drop");
                btn.classList.add("undo");
                row.classList.add("pending-drop");
            }

            render();
        });

        [reason, agree].forEach(field => field.addEventListener("change", render));

        submit.addEventListener("click", () => {
            if (submit.disabled) return;

            selected.forEach(code => {
                const row = body.querySelector('tr[data-code="' + code + '"]');
                row.cells[3].textContent = "Withdrawn (W)";
            });

            toast(selected.size + " course(s) withdrawn. They will appear as W on your record.", "success");
            selected.clear();
            reason.value = "";
            agree.checked = false;
            render();
        });

        render();
    }


    /* =========================================
       PROGRAM EXCHANGE
    ========================================= */

    function initProgramExchange() {

        const form = $("px-form");
        if (!form) return;

        const target = $("px-target");
        const reason = $("px-reason");
        const body = $("px-body");
        const programs = [
            "BS Computer Science",
            "BS Information Technology",
            "BS Information Systems",
            "BS Software Technology"
        ];

        $("px-current").value = "BS Computer Science (sample)";
        $("px-period").textContent = "Application period: open until the posted deadline (see University Calendar).";

        target.innerHTML = '<option value="">Select a program</option>' +
            programs.map(p => '<option value="' + p + '">' + p + "</option>").join("");

        $("px-submit").addEventListener("click", () => {
            if (!target.value) {
                toast("Please choose a target program.", "error");
                return;
            }

            if (!reason.value.trim()) {
                toast("Please give a reason.", "error");
                return;
            }

            const empty = body.querySelector("td.empty");
            if (empty) empty.closest("tr").remove();

            const row = document.createElement("tr");
            row.innerHTML = "<td>" + escapeHTML(target.value) + "</td><td>" +
                new Date().toLocaleDateString("en-PH") + "</td><td>Pending</td>" +
                '<td><button class="row-btn drop" type="button">Cancel</button></td>';
            body.appendChild(row);

            target.value = "";
            reason.value = "";
            toast("Program exchange application submitted.", "success");
        });

        body.addEventListener("click", event => {
            const btn = event.target.closest(".row-btn");
            if (!btn) return;

            btn.closest("tr").remove();

            if (!body.querySelector("tr")) {
                body.innerHTML = '<tr><td colspan="4" class="empty">You have no program exchange applications.</td></tr>';
            }

            toast("Application cancelled.", "info");
        });
    }

    /* =========================================
       CURRICULUM PROGRESSION
    ========================================= */

    function initCurriculum() {

        const body = $("cp-body");
        if (!body) return;

        const rows = [...body.querySelectorAll("tr")];

        // Highest requirement first: Majors, then GEs
        rows.sort((a, b) => {
            const rank = r => (r.cells[2].textContent.trim() === "Major" ? 0 : 1);
            return rank(a) - rank(b) ||
                Number(a.cells[3].textContent) - Number(b.cells[3].textContent) ||
                Number(a.cells[4].textContent) - Number(b.cells[4].textContent);
        }).forEach(row => body.appendChild(row));

        let total = 0;
        let done = 0;

        rows.forEach(row => {
            const units = Number(row.cells[5].textContent) || 0;
            total += units;
            if (row.dataset.status === "taken") done += units;
        });

        $("cp-done").textContent = done;
        $("cp-total").textContent = total;
        $("cp-bar").value = total ? Math.round(done / total * 100) : 0;

        const buttons = [...$("cp-filter").querySelectorAll(".view-btn")];

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                buttons.forEach(b => b.classList.toggle("active", b === btn));

                let visible = 0;

                rows.forEach(row => {
                    const show = btn.dataset.filter === "all" || row.dataset.status === btn.dataset.filter;
                    row.hidden = !show;
                    if (show) visible++;
                });

                $("cp-empty").hidden = visible > 0;
            });
        });
    }

    /* =========================================
       VIEW RECORDS
    ========================================= */

    function initRecords() {

        const term = $("rec-term");
        if (!term) return;

        const filteredBody = $("rec-filtered-body");
        const allBody = $("rec-all-body");
        const dlFiltered = $("rec-dl-filtered");
        const dlAll = $("rec-dl-all");

        const terms = [...new Map(RECORDS.map(r => [r.term, r.label]))];

        term.innerHTML = '<option value="">Select Term</option>' +
            terms.map(([value, label]) => '<option value="' + value + '">' + label + "</option>").join("");

        const rowHTML = (r, withTerm) =>
            "<tr>" + (withTerm ? "<td>" + r.term + "</td>" : "") + "<td>" + r.course + "</td><td>" +
            r.units.toFixed(1) + "</td><td>" + r.grade.toFixed(1) + "</td></tr>";

        allBody.innerHTML = RECORDS.map(r => rowHTML(r, true)).join("");

        function renderFiltered() {
            const matches = RECORDS.filter(r => r.term === term.value);

            filteredBody.innerHTML = matches.length
                ? matches.map(r => rowHTML(r, false)).join("")
                : '<tr><td colspan="3" class="empty">Select a term to see its records.</td></tr>';

            dlFiltered.disabled = matches.length === 0;
        }

        function download(records, filename) {
            const csv = ["Term,Course,Units,Grade"]
                .concat(records.map(r => [r.term, r.course, r.units.toFixed(1), r.grade.toFixed(1)].join(",")))
                .join("\n");

            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);

            toast("Downloaded " + filename, "success");
        }

        term.addEventListener("change", renderFiltered);
        dlFiltered.addEventListener("click", () =>
            download(RECORDS.filter(r => r.term === term.value), "records-" + term.value + ".csv"));
        dlAll.addEventListener("click", () => download(RECORDS, "records-full.csv"));

        renderFiltered();
    }

    /* =========================================
    STUDENT PAGE INITIALIZATION
    ========================================= */

    const PAGE_INITS = {
        enlistment: () => initCourseTable("enlist"),
        "add/drop": () => initCourseTable("adddrop"),
        "special-class": initSpecialClass,
        "course-withdrawal": initWithdrawal,
        "program-exchange": initProgramExchange,
        "curriculum-progression": initCurriculum,
        "view-record": initRecords
    };

    window.ArchersHubStudent = {
        initialize(pageName) {
            const initializer = PAGE_INITS[pageName];
            if (typeof initializer === "function") initializer();
        }
    };
});
