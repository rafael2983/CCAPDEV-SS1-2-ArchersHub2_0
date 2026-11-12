// Special Class page: filters the "already applied" table and lets "Apply" fill the form.
// Saving and withdrawing are normal form posts handled by SpecialClassController.
(function () {
    const body = document.getElementById("applied-body");
    if (!body) return;

    const search = document.getElementById("applied-search");
    const none = document.getElementById("no-applied");
    const course = document.getElementById("sc-course");
    const campusSelect = document.getElementById("sc-campus");
    const reason = document.getElementById("sc-reason");
    const buttons = document.querySelectorAll(".campus-btn");
    const rows = body.querySelectorAll("tr[data-code]");

    let campus = "either";

    function filterApplied() {
        const q = search.value.trim().toLowerCase();
        let visible = 0;

        rows.forEach(row => {
            const matches =
                (!q || row.dataset.code.toLowerCase().includes(q) || row.dataset.name.toLowerCase().includes(q)) &&
                (campus === "either" || row.dataset.campus === campus);
            row.hidden = !matches;
            if (matches) visible++;
        });

        // Only show the "no match" text when there are rows that got filtered out
        none.hidden = rows.length === 0 || visible > 0;
        if (rows.length > 0) none.textContent = "No special class applications match your search.";
    }

    search.addEventListener("input", filterApplied);

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            campus = btn.dataset.campus;
            buttons.forEach(b => {
                const on = b === btn;
                b.classList.toggle("active", on);
                b.setAttribute("aria-pressed", on ? "true" : "false");
            });
            filterApplied();
        });
    });

    // "Apply" beside a course fills in the form below it
    body.addEventListener("click", event => {
        const btn = event.target.closest(".row-btn");
        if (!btn || btn.disabled) return;

        const row = btn.closest("tr[data-code]");
        course.value = row.dataset.code;
        // data-campus is lowercase, the select values are Either / Laguna / Manila
        [...campusSelect.options].forEach(o => {
            if (o.value.toLowerCase() === row.dataset.campus) campusSelect.value = o.value;
        });
        reason.focus();
    });
})();