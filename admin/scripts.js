
/* =========================================
   ARCHERSHUB 2.0 — ACCOUNT MANAGEMENT
   Reads and writes user-data
   through the Node.js API.
========================================= */

(() => {
    "use strict";

    const API_URL = "/api/account-management";
    const scriptURL = document.currentScript?.src ||
        new URL("admin/scripts.js", window.location.href).href;
    const DATA_URL = new URL("../user-data.txt", scriptURL).href;

    const today = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    window.initAccountManagement = async function initAccountManagement() {
        const root = document.getElementById("ac-page");
        if (!root || root.dataset.ready === "1") return;
        root.dataset.ready = "1";

        const $ = id => document.getElementById(id);

        const form = $("ac-form");
        const list = $("ac-list");
        const count = $("ac-count");
        const saveButton = $("ac-save");
        const idInput = $("ac-id");
        const relatedPanel = $("ac-related");
        const relatedTitle = $("ac-related-title");
        const relatedLabel = $("ac-related-label");
        const relatedContent = $("ac-related-content");
        const otherEditor = $("ac-other-editor");

        const fields = {
            id: $("ac-id"),
            surname: $("ac-surname"),
            middleName: $("ac-middle"),
            firstName: $("ac-first"),
            email: $("ac-email"),
            type: $("ac-type"),
            status: $("ac-status")
        };

        let accounts = [];
        let editId = null;
        let activeView = "";
        let saving = false;

        let other = {
            createdDate: today(),
            contactNumber: "",
            address: "",
            timelineEvents: []
        };

        const isMobile = () =>
            window.matchMedia("(max-width: 700px)").matches;

        const cleanId = value => String(value ?? "").trim();

        const findAccount = id =>
            accounts.find(account =>
                cleanId(account.id) === cleanId(id)
            ) || null;

        function element(tag, className = "", text = "") {
            const node = document.createElement(tag);

            if (className) {
                node.className = className;
            }

            node.textContent = String(text);

            return node;
        }

        function showEmpty(target, message) {
            target.replaceChildren(
                element("p", "ac-empty", message)
            );
        }

        /* =========================================
           NAME HANDLING

           Current format:
           firstName, middleName, surname

           Legacy format:
           name only, or a combined name stored in
           firstName by an older script.
        ========================================= */

        function getNameParts(account = {}) {
            let firstName = String(
                account.firstName || ""
            ).trim();

            let middleName = String(
                account.middleName || ""
            ).trim();

            let surname = String(
                account.surname || ""
            ).trim();

            const fullName = String(
                account.name || ""
            ).trim();

            /*
             * If firstName contains the same complete name
             * as name, and the other two fields are empty,
             * treat it as an old incorrectly saved record.
             */
            const combinedLegacyFirstName = Boolean(
                firstName &&
                !middleName &&
                !surname &&
                fullName &&
                firstName === fullName &&
                /\s/.test(firstName)
            );

            /*
             * Normal case: use the separate fields.
             */
            if (
                (firstName || middleName || surname) &&
                !combinedLegacyFirstName
            ) {
                return {
                    firstName,
                    middleName,
                    surname
                };
            }

            /*
             * Legacy migration:
             * Split a combined name using the convention:
             *
             * First Middle Surname
             *
             * One word:
             * First
             *
             * Two words:
             * First Surname
             *
             * Three or more words:
             * First / Middle words / Last word
             */
            const source = fullName || firstName;

            const parts = source
                .split(/\s+/)
                .filter(Boolean);

            if (parts.length === 0) {
                return {
                    firstName: "",
                    middleName: "",
                    surname: ""
                };
            }

            if (parts.length === 1) {
                return {
                    firstName: parts[0],
                    middleName: "",
                    surname: ""
                };
            }

            if (parts.length === 2) {
                return {
                    firstName: parts[0],
                    middleName: "",
                    surname: parts[1]
                };
            }

            return {
                firstName: parts[0],
                middleName: parts.slice(1, -1).join(" "),
                surname: parts[parts.length - 1]
            };
        }

        function displayName(account = {}) {
            const parts = [
                account.firstName,
                account.middleName,
                account.surname
            ]
                .map(value => String(value || "").trim())
                .filter(Boolean);

            return parts.join(" ") ||
                String(account.name || "Unnamed account");
        }

        function currentNameParts() {
            const firstName =
                fields.firstName.value.trim();

            const middleName =
                fields.middleName.value.trim();

            const surname =
                fields.surname.value.trim();

            return {
                firstName,
                middleName,
                surname,
                name: [
                    firstName,
                    middleName,
                    surname
                ].filter(Boolean).join(" ")
            };
        }

        /* =========================================
           TIMELINE
        ========================================= */

        function getTimeline(account = {}) {
            if (Array.isArray(account.timelineEvents)) {
                return account.timelineEvents
                    .map(item => ({
                        date: String(item?.date || "").trim(),
                        event: String(item?.event || "").trim()
                    }))
                    .filter(item => item.date || item.event);
            }

            return String(account.timeline || "")
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean)
                .map(line => {
                    const match = line.match(
                        /^(\d{4}-\d{2}-\d{2})\s*(?:—|–|-)\s*(.*)$/
                    );

                    return match
                        ? {
                            date: match[1],
                            event: match[2].trim()
                        }
                        : {
                            date: "",
                            event: line
                        };
                });
        }

        function sortTimeline(events) {
            return events
                .map((item, index) => ({
                    date: String(item.date || "").trim(),
                    event: String(item.event || "").trim(),
                    index
                }))
                .filter(item => item.date || item.event)
                .sort((a, b) => {
                    if (!a.date && b.date) return 1;
                    if (a.date && !b.date) return -1;

                    return a.date.localeCompare(b.date) ||
                        a.index - b.index;
                })
                .map(({ date, event }) => ({
                    date,
                    event
                }));
        }

        function editor(which) {
            const prefix =
                which === "mobile" ? "ac-m-" : "ac-";

            return {
                createdDate: $(prefix + "created"),
                contactNumber: $(prefix + "contact"),
                address: $(prefix + "address"),
                events: $(prefix + "events")
            };
        }

        function readTimeline(which) {
            const box = editor(which).events;

            if (!box) return other.timelineEvents;

            return Array.from(
                box.querySelectorAll(".ac-event-row")
            ).map(row => ({
                date: row.querySelector(
                    "[data-event-date]"
                )?.value || "",

                event: row.querySelector(
                    "[data-event-text]"
                )?.value.trim() || ""
            }));
        }

        function readOther(which) {
            const inputs = editor(which);

            if (inputs.createdDate) {
                other.createdDate =
                    inputs.createdDate.value || "";
            }

            if (inputs.contactNumber) {
                other.contactNumber =
                    inputs.contactNumber.value.trim();
            }

            if (inputs.address) {
                other.address =
                    inputs.address.value.trim();
            }

            other.timelineEvents = readTimeline(which);
        }

        function renderTimeline(which) {
            const box = editor(which).events;

            if (!box) return;

            box.replaceChildren();

            const events = sortTimeline(
                other.timelineEvents
            );

            if (!events.length) {
                box.append(
                    element(
                        "p",
                        "ac-help",
                        "No timeline events yet."
                    )
                );
            }

            events.forEach((item, index) => {
                const row = element(
                    "div",
                    "ac-event-row"
                );

                const date = document.createElement("input");
                date.type = "date";
                date.value = item.date;
                date.dataset.eventDate = "true";
                date.dataset.editor = which;
                date.setAttribute("aria-label", "Event date");
                date.setAttribute("form", "ac-form");

                const description =
                    document.createElement("input");

                description.type = "text";
                description.value = item.event;
                description.placeholder = "Describe the event";
                description.dataset.eventText = "true";
                description.dataset.editor = which;

                description.setAttribute(
                    "aria-label",
                    "Timeline event"
                );

                description.setAttribute(
                    "form",
                    "ac-form"
                );

                const remove = element(
                    "button",
                    "ac-event-remove",
                    "×"
                );

                remove.type = "button";
                remove.title = "Remove event";

                remove.setAttribute(
                    "aria-label",
                    "Remove timeline event"
                );

                remove.addEventListener("click", () => {
                    readOther(which);

                    const sorted = sortTimeline(
                        other.timelineEvents
                    );

                    sorted.splice(index, 1);

                    other.timelineEvents = sorted;

                    renderTimeline(which);
                });

                row.append(date, description, remove);
                box.append(row);
            });
        }

        function renderOtherEditors() {
            ["desktop", "mobile"].forEach(which => {
                const inputs = editor(which);

                if (!inputs.createdDate) return;

                inputs.createdDate.value =
                    other.createdDate || today();

                inputs.contactNumber.value =
                    other.contactNumber || "";

                inputs.address.value =
                    other.address || "";

                renderTimeline(which);
            });
        }

        function setOther(account = {}) {
            other = {
                createdDate: account.createdDate || today(),
                contactNumber: account.contactNumber || "",
                address: account.address || "",
                timelineEvents: sortTimeline(
                    getTimeline(account)
                )
            };

            renderOtherEditors();
        }

        /* =========================================
           ACCOUNT TYPE RULES
        ========================================= */

        function setTypeRules(account = {}) {
            const adminOption = Array.from(
                fields.type.options
            ).find(option => option.value === "Admin");

            const current = editId !== null
                ? findAccount(editId)
                : (
                    account.id
                        ? findAccount(account.id)
                        : null
                );

            const existing = Boolean(current);

            const isAdminAccount =
                existing && current.type === "Admin";

            fields.type.disabled = isAdminAccount;

            if (adminOption) {
                adminOption.disabled =
                    existing && !isAdminAccount;
            }

            const note = $("ac-type-note");

            if (note) {
                note.hidden = !isAdminAccount;
            }

            if (isAdminAccount) {
                fields.type.value = "Admin";
            }
        }

        function updateSaveLabel() {
            saveButton.textContent =
                findAccount(idInput.value)
                    ? "Edit"
                    : "Create";
        }

        /* =========================================
           VIEW CONTROL
        ========================================= */

        function setMobileDetail(show) {
            root.classList.toggle(
                "show-detail",
                Boolean(show) && isMobile()
            );
        }

        function clearRelatedView() {
            activeView = "";

            relatedPanel.hidden = true;
            relatedContent.hidden = false;
            otherEditor.hidden = true;
            list.hidden = false;

            root.querySelectorAll("[data-view]")
                .forEach(button => {
                    button.classList.remove("active");

                    button.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                });
        }

        /* =========================================
           FILL FORM

           Important:
           Do not use account.name directly as First Name.
        ========================================= */

        function fillForm(account = {}) {
            const nameParts = getNameParts(account);

            fields.id.value = account.id || "";

            fields.firstName.value =
                nameParts.firstName;

            fields.middleName.value =
                nameParts.middleName;

            fields.surname.value =
                nameParts.surname;

            fields.email.value =
                account.email || "";

            fields.type.value =
                account.type || "";

            fields.status.value =
                account.status || "";

            Object.values(fields).forEach(field => {
                field.removeAttribute("aria-invalid");
            });

            setTypeRules(account);
            setOther(account);
            showMobileRecords(account);
            updateSaveLabel();
        }

        /* =========================================
           TABLES AND RECORDS
        ========================================= */

        function renderTable(target, columns, rows, message) {
            if (!target) return;

            target.replaceChildren();

            if (!Array.isArray(rows) || rows.length === 0) {
                showEmpty(target, message);
                return;
            }

            const wrap = element("div", "ac-table-wrap");
            const table = element("table", "ac-table");

            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");

            columns.forEach(column => {
                headerRow.append(
                    element("th", "", column.label)
                );
            });

            thead.append(headerRow);

            const tbody = document.createElement("tbody");

            rows.forEach(row => {
                const tr = document.createElement("tr");

                columns.forEach(column => {
                    const value = row[column.key];

                    tr.append(
                        element(
                            "td",
                            "",
                            value === undefined ||
                            value === null ||
                            value === ""
                                ? "—"
                                : value
                        )
                    );
                });

                tbody.append(tr);
            });

            table.append(thead, tbody);
            wrap.append(table);
            target.append(wrap);
        }

        const enlistColumns = [
            { key: "course", label: "Course" },
            { key: "section", label: "Section" },
            { key: "term", label: "Term" },
            { key: "status", label: "Status" }
        ];

        const gradeColumns = [
            { key: "course", label: "Course" },
            { key: "term", label: "Term" },
            { key: "grade", label: "Grade" }
        ];

        function showMobileRecords(account = {}) {
            renderTable(
                $("ac-mobile-enlistment"),
                enlistColumns,
                account.enlistment || [],
                "No enlistment records."
            );

            renderTable(
                $("ac-mobile-grade"),
                gradeColumns,
                account.grades || [],
                "No grade records."
            );
        }

        function showRelated(view, account) {
            relatedTitle.textContent =
                view === "enlistment"
                    ? "Enlistment"
                    : view === "grade"
                        ? "Grade"
                        : "Other Information";

            relatedLabel.textContent =
                `${displayName(account)} · ${account.id}`;

            relatedContent.hidden = view === "other";
            otherEditor.hidden = view !== "other";

            if (view === "enlistment") {
                renderTable(
                    relatedContent,
                    enlistColumns,
                    account.enlistment || [],
                    "No enlistment records for this account."
                );
            } else if (view === "grade") {
                renderTable(
                    relatedContent,
                    gradeColumns,
                    account.grades || [],
                    "No grade records for this account."
                );
            } else {
                renderOtherEditors();
            }
        }

        /* =========================================
           ACCOUNT LIST
        ========================================= */

        function renderList() {
            list.replaceChildren();

            count.textContent =
                `${accounts.length} account` +
                (accounts.length === 1 ? "" : "s");

            if (!accounts.length) {
                showEmpty(
                    list,
                    "No accounts found. Create a new account to get started."
                );
                return;
            }

            accounts.forEach(account => {
                const item = element("button", "ac-item");

                item.type = "button";

                item.setAttribute(
                    "aria-label",
                    `Select ${displayName(account)}, ID ${account.id}`
                );

                if (
                    editId !== null &&
                    cleanId(account.id) === cleanId(editId)
                ) {
                    item.classList.add("selected");
                    item.setAttribute("aria-current", "true");
                }

                const name = displayName(account);

                const initials = name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(part => part.charAt(0))
                    .join("")
                    .toUpperCase();

                const avatar = element(
                    "span",
                    "ac-avatar",
                    initials || "?"
                );

                avatar.setAttribute("aria-hidden", "true");

                const copy = element("span", "ac-copy");

                copy.append(
                    element("span", "ac-name", name),
                    element("span", "ac-id", account.id || "No ID")
                );

                const meta = element("span", "ac-meta");

                meta.append(
                    element("span", "ac-pill", account.type || "No type")
                );

                meta.append(
                    element(
                        "span",
                        `ac-pill ${String(account.status || "").toLowerCase()}`,
                        account.status || "No status"
                    )
                );

                item.append(avatar, copy, meta);

                item.addEventListener("click", () => {
                    // Clicking the selected account again cancels selection.
                    if (
                        editId !== null &&
                        cleanId(editId) === cleanId(account.id)
                    ) {
                        resetSelection();
                        return;
                    }

                    const selected = findAccount(account.id);

                    if (!selected) return;

                    editId = selected.id;

                    fillForm(selected);
                    renderList();
                    clearRelatedView();
                    setMobileDetail(true);

                    const detailScroll =
                        root.querySelector(".ac-detail-scroll");

                    if (detailScroll) {
                        detailScroll.scrollTop = 0;
                    }
                });

                list.append(item);
            });
        }

        function openRelatedView(view) {
            // Keep the current view when ID is blank or does not exist.
            const account = cleanId(idInput.value)
                ? findAccount(idInput.value)
                : null;

            if (!account) return;

            if (activeView === view) {
                clearRelatedView();
                return;
            }

            if (
                editId === null ||
                cleanId(editId) !== cleanId(account.id)
            ) {
                editId = account.id;
                fillForm(account);
                renderList();
            } else if (!otherEditor.hidden) {
                readOther("desktop");
            }

            activeView = view;
            list.hidden = true;
            relatedPanel.hidden = false;

            root.querySelectorAll("[data-view]")
                .forEach(button => {
                    const active = button.dataset.view === view;

                    button.classList.toggle("active", active);

                    button.setAttribute(
                        "aria-pressed",
                        String(active)
                    );
                });

            showRelated(view, account);
        }

        /* =========================================
           RESET, CREATE, AND BACK
        ========================================= */

        function resetSelection() {
            editId = null;

            fillForm({ createdDate: today() });

            clearRelatedView();
            renderList();
            setMobileDetail(false);

            const detailScroll =
                root.querySelector(".ac-detail-scroll");

            if (detailScroll) {
                detailScroll.scrollTop = 0;
            }
        }

        function newAccount() {
            editId = null;

            fillForm({ createdDate: today() });

            clearRelatedView();
            renderList();
            setMobileDetail(true);

            const detailScroll =
                root.querySelector(".ac-detail-scroll");

            if (detailScroll) {
                detailScroll.scrollTop = 0;
            }

            fields.id.focus({ preventScroll: true });
        }

        function backToList() {
            clearRelatedView();
            setMobileDetail(false);
            renderList();
        }

        /* =========================================
           READ TXT
        ========================================= */

        async function readTxt() {
            try {
                const response = await fetch(API_URL, {
                    cache: "no-store"
                });

                if (response.ok) {
                    const data = await response.json();

                    if (Array.isArray(data.accounts)) {
                        return data.accounts;
                    }
                }
            } catch (_) {
                // Try the TXT file directly in read-only mode.
            }

            const response = await fetch(DATA_URL, {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `Could not read user-data (${response.status}).`
                );
            }

            const data = JSON.parse(await response.text());

            if (!data || !Array.isArray(data.accounts)) {
                throw new Error(
                    "TXT must contain an object with an accounts array."
                );
            }

            return data.accounts;
        }

        /* =========================================
           WRITE TXT
        ========================================= */

        async function writeTxt(nextAccounts) {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    accounts: nextAccounts
                })
            });

            const data = await response.json().catch(() => ({}));

            if (
                !response.ok ||
                !Array.isArray(data.accounts)
            ) {
                throw new Error(
                    data.error ||
                    `Save failed (HTTP ${response.status}).`
                );
            }

            return data.accounts;
        }

        /* =========================================
           VALIDATION
        ========================================= */

        function validate() {
            // Surname and Middle Name are optional.
            // Only First Name is required among the name fields.
            const required = [
                fields.id,
                fields.firstName,
                fields.email,
                fields.type,
                fields.status
            ];

            Object.values(fields).forEach(field => {
                field.removeAttribute("aria-invalid");
            });

            const missing = required.filter(field =>
                !String(field.value || "").trim()
            );

            if (missing.length) {
                missing.forEach(field => {
                    field.setAttribute("aria-invalid", "true");
                });

                alert(
                    "Complete all required fields: ID, First Name, " +
                    "Email, Account Type, and Account Status."
                );

                missing[0].focus();
                return false;
            }

            if (!fields.email.checkValidity()) {
                fields.email.setAttribute(
                    "aria-invalid",
                    "true"
                );

                alert("Enter a valid email address.");

                fields.email.focus();
                return false;
            }

            return true;
        }

        /* =========================================
           INPUT EVENTS
        ========================================= */

        function handleOtherInput(event) {
            const target = event.target;
            const which = target.dataset.editor;

            if (!which) return;

            if (target.dataset.other) {
                const key = target.dataset.other;

                other[key] = key === "createdDate"
                    ? target.value || ""
                    : target.value.trim();

            } else if (
                target.matches("[data-event-date], [data-event-text]")
            ) {
                other.timelineEvents = readTimeline(which);
            }

            if (
                target.matches("[data-event-date]") &&
                event.type === "change"
            ) {
                other.timelineEvents = sortTimeline(
                    readTimeline(which)
                );

                renderTimeline(which);
            }
        }

        root.addEventListener("input", event => {
            if (event.target?.removeAttribute) {
                event.target.removeAttribute("aria-invalid");
            }

            handleOtherInput(event);

            if (event.target === idInput) {
                updateSaveLabel();
            }
        });

        root.addEventListener("change", handleOtherInput);

        root.querySelectorAll("[data-add-event]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    const which = button.dataset.addEvent;

                    readOther(which);

                    other.timelineEvents.push({
                        date: today(),
                        event: ""
                    });

                    other.timelineEvents = sortTimeline(
                        other.timelineEvents
                    );

                    renderTimeline(which);

                    const textInputs = editor(which).events
                        .querySelectorAll("[data-event-text]");

                    textInputs[textInputs.length - 1]?.focus();
                });
            });

        /* =========================================
           SAVE: CREATE OR EDIT
        ========================================= */

        form.addEventListener("submit", async event => {
            event.preventDefault();

            if (saving || !validate()) return;

            if (isMobile()) {
                readOther("mobile");
            } else if (!otherEditor.hidden) {
                readOther("desktop");
            }

            const newId = cleanId(fields.id.value);

            const selectedIndex = editId === null
                ? -1
                : accounts.findIndex(account =>
                    cleanId(account.id) === cleanId(editId)
                );

            const enteredIndex = accounts.findIndex(account =>
                cleanId(account.id) === newId
            );

            if (
                enteredIndex >= 0 &&
                enteredIndex !== selectedIndex
            ) {
                alert(
                    "This ID already exists. Select that account from the list before editing it."
                );

                fields.id.setAttribute("aria-invalid", "true");
                fields.id.focus();

                return;
            }

            const oldIndex = selectedIndex >= 0 &&
                cleanId(accounts[selectedIndex].id) === newId
                    ? selectedIndex
                    : -1;

            const oldAccount =
                oldIndex >= 0 ? accounts[oldIndex] : null;

            // Existing Admin accounts cannot change type.
            // Existing non-Admin accounts cannot be promoted to Admin.
            // New accounts may be created as Admin.
            if (
                oldAccount &&
                oldAccount.type === "Admin" &&
                fields.type.value !== "Admin"
            ) {
                alert(
                    "The account type of an existing Admin cannot be changed."
                );
                return;
            }

            if (
                oldAccount &&
                oldAccount.type !== "Admin" &&
                fields.type.value === "Admin"
            ) {
                alert(
                    "An existing account cannot be changed to Admin."
                );

                fields.type.focus();
                return;
            }

            if (
                selectedIndex >= 0 &&
                accounts[selectedIndex].type === "Admin" &&
                newId !== cleanId(accounts[selectedIndex].id)
            ) {
                alert(
                    "The ID of an existing Admin account cannot be changed here."
                );

                fields.id.value = accounts[selectedIndex].id;
                fields.id.focus();
                updateSaveLabel();

                return;
            }

            const names = currentNameParts();

            other.createdDate = other.createdDate || today();
            other.timelineEvents = sortTimeline(
                other.timelineEvents
            );

            const savedAccount = {
                id: newId,

                // Display name and its three independent components.
                name: names.name,
                firstName: names.firstName,
                middleName: names.middleName,
                surname: names.surname,

                email: fields.email.value.trim(),
                type: fields.type.value,
                status: fields.status.value,

                createdDate: other.createdDate,
                contactNumber: other.contactNumber,
                address: other.address,

                timelineEvents: other.timelineEvents,

                timeline: other.timelineEvents.map(item =>
                    `${item.date ? item.date + " — " : ""}${item.event}`
                ).join("\n"),

                // Preserve existing academic records when editing.
                enlistment: Array.isArray(oldAccount?.enlistment)
                    ? oldAccount.enlistment
                    : [],

                grades: Array.isArray(oldAccount?.grades)
                    ? oldAccount.grades
                    : []
            };

            const nextAccounts = accounts.slice();

            if (oldIndex < 0) {
                nextAccounts.push(savedAccount);
            } else {
                nextAccounts[oldIndex] = savedAccount;
            }

            saving = true;
            saveButton.disabled = true;
            saveButton.textContent = "Saving…";

            try {
                accounts = await writeTxt(nextAccounts);

                // After a successful save, clear the form and selection.
                // On mobile, return to the account-list screen.
                resetSelection();

                alert(
                    oldIndex < 0
                        ? "Account created and saved to the TXT file."
                        : "Account updated and saved to the TXT file."
                );

            } catch (error) {
                console.error(
                    "Account Management save error:",
                    error
                );

                alert(
                    "Could not save the TXT file. " +
                    "Run node server.js from the project root.\n\n" +
                    error.message
                );

            } finally {
                saving = false;
                saveButton.disabled = false;
                updateSaveLabel();

                if (saveButton.textContent === "Saving…") {
                    saveButton.textContent =
                        findAccount(idInput.value)
                            ? "Edit"
                            : "Create";
                }
            }
        });

        /* =========================================
           BUTTON EVENTS
        ========================================= */

        $("ac-new").addEventListener(
            "click",
            newAccount
        );

        $("ac-reset").addEventListener(
            "click",
            newAccount
        );

        $("ac-back").addEventListener(
            "click",
            backToList
        );

        $("ac-related-back").addEventListener(
            "click",
            clearRelatedView
        );

        root.querySelectorAll("[data-view]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    openRelatedView(button.dataset.view);
                });
            });

        window.addEventListener("resize", () => {
            if (!isMobile()) {
                root.classList.remove("show-detail");
            }
        });

        /* =========================================
           LOAD TXT
        ========================================= */

        try {
            accounts = await readTxt();

            renderList();

            fillForm({
                createdDate: today()
            });

            clearRelatedView();
            setMobileDetail(false);

        } catch (error) {
            console.error(
                "Account data loading error:",
                error
            );

            count.textContent = "Unavailable";

            showEmpty(
                list,
                "Cannot load user-data. " +
                "Start the app with node server.js."
            );
        }
    };

    /* =========================================
       SPA INITIALIZATION
    ========================================= */

    function watchAccountPage() {
        const root = document.getElementById("ac-page");

        if (root && root.dataset.ready !== "1") {
            window.initAccountManagement();
        }
    }

    const observer = new MutationObserver(
        watchAccountPage
    );

    function startWatching() {
        watchAccountPage();

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            startWatching,
            { once: true }
        );
    } else {
        startWatching();
    }
})();