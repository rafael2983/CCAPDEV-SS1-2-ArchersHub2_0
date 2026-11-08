/* =========================================
       HOME DASHBOARD (schedule, events, calendar)
    ========================================= */

    function renderHome() {
        const scheduleBody = $("schedule-body");
        const entries = readJSON(STORE_KEY, []);

        if (scheduleBody && entries.length > 0) {
            const rows = entries.flatMap(e =>
                e.slots.length
                    ? e.slots.map(s => "<tr><td>" + escapeHTML(e.code) + "</td><td>" + escapeHTML(e.section) +
                        "</td><td>" + s.day + " " + formatTime(s.start) + "-" + formatTime(s.end) +
                        "</td><td>" + escapeHTML(s.place) + "</td></tr>")
                    : ["<tr><td>" + escapeHTML(e.code) + "</td><td>" + escapeHTML(e.section) +
                        '</td><td>TBA</td><td>-</td></tr>']
            );
            scheduleBody.innerHTML = rows.join("");
        }

        const eventsList = $("events-list");

        if (eventsList) {
            eventsList.innerHTML = CAL_EVENTS.slice(0, 4).map(ev =>
                "<li><span>" + escapeHTML(ev.title) + "</span><small>" + formatRange(ev) + "</small></li>"
            ).join("");
        }

        const calendarView = document.querySelector("#school-calendar .calendar-view");

        if (calendarView) {
            calendarView.innerHTML = '<ul class="event-list">' + CAL_EVENTS.filter(ev => ev.important).map(ev =>
                "<li><span>" + escapeHTML(ev.title) + "</span><small>" + formatRange(ev) + "</small></li>"
            ).join("") + "</ul>";
        }
    }

    /* =========================================
       VIEW SCHEDULE
    ========================================= */

    function initSchedule() {

        const term = $("vs-term");
        if (!term) return;

        term.innerHTML = '<option value="3">AY 2025-2026, Term 3 (current)</option>' +
            '<option value="2">AY 2025-2026, Term 2</option>' +
            '<option value="1">AY 2025-2026, Term 1</option>';

        const weekBody = $("vs-week-body");
        const week = $("vs-week");
        const list = $("vs-list");
        const buttons = [...$("vs-view").querySelectorAll(".view-btn")];

        function render() {
            // Only the current term has saved enlistment data for now
            const entries = term.value === "3" ? readJSON(STORE_KEY, []) : [];

            buildGrid(weekBody, entries);

            list.innerHTML = entries.length
                ? entries.map(e =>
                    "<li><span>" + escapeHTML(e.code) + " - " + escapeHTML(e.name) + " (" + escapeHTML(e.section) +
                    ")</span><small>" + (e.slots.length ? e.slots.map(slotText).map(escapeHTML).join("<br>") : "TBA") +
                    "</small></li>").join("")
                : '<li class="empty">No classes this term.</li>';
        }

        term.addEventListener("change", render);

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                buttons.forEach(b => b.classList.toggle("active", b === btn));
                week.hidden = btn.dataset.view !== "week";
                list.hidden = btn.dataset.view !== "list";
            });
        });

        render();
    }

    /* =========================================
       UNIVERSITY CALENDAR
    ========================================= */

    function initCalendar() {

        const body = $("uc-body");
        if (!body) return;

        const table = $("uc-table");
        const list = $("uc-list");
        const buttons = [...$("uc-view").querySelectorAll(".view-btn")];

        body.innerHTML = CAL_EVENTS.map(ev =>
            "<tr><td>" + formatDate(ev.start) + "</td><td>" + formatDate(ev.end) + "</td><td>" +
            escapeHTML(ev.title) + "</td><td>" + (ev.important ? "Yes" : "No") + "</td></tr>").join("");

        list.innerHTML = CAL_EVENTS.map(ev =>
            "<li><span>" + escapeHTML(ev.title) + (ev.important ? " (important)" : "") +
            "</span><small>" + formatRange(ev) + "</small></li>").join("");

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                buttons.forEach(b => b.classList.toggle("active", b === btn));
                table.hidden = btn.dataset.view !== "tabular";
                list.hidden = btn.dataset.view !== "list";
            });
        });
    }

    /* =========================================
       ORGANIZATIONS
    ========================================= */

    function initOrganizations() {

        const list = $("org-list");
        if (!list) return;

        const search = $("org-search");
        const empty = $("org-empty");
        const appBody = $("org-app-body");
        const emptyRow = appBody.innerHTML;
        const APPS_KEY = "archershub.orgapps";

        function addApplication(card) {
            const placeholder = appBody.querySelector("td.empty");
            if (placeholder) placeholder.closest("tr").remove();

            const row = document.createElement("tr");
            row.dataset.org = card.dataset.org;
            row.innerHTML = "<td>" + escapeHTML(card.querySelector("h3").textContent) + "</td><td>Pending</td>" +
                '<td><button class="row-btn drop" type="button">Cancel</button></td>';
            appBody.appendChild(row);

            const btn = card.querySelector(".row-btn");
            btn.disabled = true;
            btn.textContent = "Applied";
        }

        function saveApplications() {
            writeJSON(APPS_KEY, [...appBody.querySelectorAll("tr[data-org]")].map(r => r.dataset.org));
        }

        list.addEventListener("click", event => {
            const btn = event.target.closest('[data-action="apply"]');
            if (!btn || btn.disabled) return;

            const card = btn.closest(".org-card");
            addApplication(card);
            saveApplications();
            toast("Application sent to " + card.querySelector("h3").textContent + ".", "success");
        });

        appBody.addEventListener("click", event => {
            const btn = event.target.closest(".row-btn");
            if (!btn) return;

            const row = btn.closest("tr");
            const card = list.querySelector('.org-card[data-org="' + row.dataset.org + '"]');

            if (card) {
                const applyBtn = card.querySelector(".row-btn");
                applyBtn.disabled = false;
                applyBtn.textContent = "Apply";
            }

            row.remove();
            if (!appBody.querySelector("tr")) appBody.innerHTML = emptyRow;

            saveApplications();
            toast("Application cancelled.", "info");
        });

        search.addEventListener("input", () => {
            const q = search.value.trim().toLowerCase();
            let visible = 0;

            list.querySelectorAll(".org-card").forEach(card => {
                const show = card.querySelector("h3").textContent.toLowerCase().includes(q);
                card.hidden = !show;
                if (show) visible++;
            });

            empty.hidden = visible > 0;
        });

        readJSON(APPS_KEY, []).forEach(id => {
            const card = list.querySelector('.org-card[data-org="' + id + '"]');
            if (card) addApplication(card);
        });
    }

    /* =========================================
       PROFILE
    ========================================= */

    function initProfile() {

        const info = $("pf-info");
        if (!info) return;

        const PROFILE_KEY = "archershub.profile";
        const passPanel = $("pf-password-panel");
        const selfPanel = $("pf-self-panel");
        const saved = readJSON(PROFILE_KEY, {});

        // SAMPLE student data until a backend exists
        $("pf-name").textContent = "Student Name";
        $("pf-id").textContent = "12345678";
        $("pf-email").textContent = "student@dlsu.edu.ph";
        $("pf-college").textContent = "College of Computer Studies";
        $("pf-program").textContent = "BS Computer Science";
        $("pf-campus").textContent = "Manila";
        $("pf-status").textContent = "Active";

        $("pf-nickname").value = saved.nickname || "";
        $("pf-address").value = saved.address || "";
        $("pf-contact").value = saved.contact || "";

        function show(panel) {
            passPanel.hidden = panel !== passPanel;
            selfPanel.hidden = panel !== selfPanel;
        }

        $("pf-pass-btn").addEventListener("click", () => show(passPanel));
        $("pf-info-btn").addEventListener("click", () => show(selfPanel));

        $("pf-pass-cancel").addEventListener("click", () => {
            ["pf-old", "pf-new", "pf-confirm"].forEach(id => { $(id).value = ""; });
            show(null);
        });

        $("pf-self-cancel").addEventListener("click", () => show(null));

        $("pf-pass-submit").addEventListener("click", () => {
            const oldPass = $("pf-old").value;
            const newPass = $("pf-new").value;
            const confirm = $("pf-confirm").value;

            if (!oldPass || !newPass || !confirm) {
                toast("Please fill in all password fields.", "error");
            } else if (newPass.length < 8) {
                toast("New password must be at least 8 characters.", "error");
            } else if (newPass === oldPass) {
                toast("New password must be different from the previous one.", "error");
            } else if (newPass !== confirm) {
                toast("New password and confirmation do not match.", "error");
            } else {
                ["pf-old", "pf-new", "pf-confirm"].forEach(id => { $(id).value = ""; });
                show(null);
                toast("Password changed.", "success");
            }
        });

        $("pf-self-submit").addEventListener("click", () => {
            const contact = $("pf-contact").value.trim();

            if (contact && !/^[0-9+\-\s]{7,15}$/.test(contact)) {
                toast("Enter a valid contact number.", "error");
                return;
            }

            writeJSON(PROFILE_KEY, {
                nickname: $("pf-nickname").value.trim(),
                address: $("pf-address").value.trim(),
                contact
            });

            show(null);
            toast("Profile information saved.", "success");
        });
    }