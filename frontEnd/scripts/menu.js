
/* =========================================
   ARCHERSHUB 2.0 - MENU SCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS & CONFIGURATION
    ========================================= */

    const menuBtn = document.getElementById("menu-button") || document.getElementById("menu-btn");
    const layout = document.getElementById("layout");
    const overlay = document.getElementById("overlay");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    const roleToggle = document.getElementById("role-toggle");
    const currentRoleText = document.getElementById("current-role");
    const themeToggle = document.getElementById("theme-toggle");
    const userProfile = document.getElementById("user-profile");

    const HOME_URL = "home.html";
    const MOBILE_BREAKPOINT = 800;

    const ROLES = ["student", "teacher", "admin"];

    const ROLE_ACCESS = {
        student: ["general", "student"],
        teacher: ["general", "teacher"],
        admin: ["general", "student", "teacher", "office", "admin"]
    };

    const PAGE_ROLES = {
        home: "general",
        enlistment: "student",
        "add/drop": "student",
        "special-class": "student",
        "course-withdrawal": "student",
        "program-exchange": "student",
        "curriculum-progression": "student",
        "view-schedule": "general",
        "view-record": "general",
        calender: "general",
        organizations: "general",
        profile: "general",
        "grade-encoding": "teacher",
        "view-application": "teacher",
        "make-announcements": "office",
        "account-menegement": "admin",
        "ai-chat": "general"
    };

    const pages = {
        enlistment: "views/student/enlistment.html",
        "add/drop": "views/student/add-drop.html",
        "special-class": "views/student/apply-special.html",
        "course-withdrawal": "views/student/withdrawal.html",
        "program-exchange": "views/student/program-exchange.html",
        "curriculum-progression": "views/student/curriculum.html",
        "view-schedule": "views/general/schedule.html",
        "view-record": "views/student/records.html",
        calender: "views/general/calendar.html",
        organizations: "views/general/organizations.html",
        profile: "views/general/profile.html",
        "grade-encoding": "views/teacher/grade-encoding.html",
        "view-application": "views/teacher/application.html",
        "make-announcements": "views/office/announcements.html",
        "account-menegement": "views/admin/account-menegement.html"
    };

    const homeContent = mainContent ? mainContent.innerHTML : "";

    let pageRequestId = 0;
    let wasMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    let currentRole = sessionStorage.getItem("currentRole");

    if (!ROLES.includes(currentRole)) {
        currentRole = "student";
    }

    if (userProfile) {
        userProfile.addEventListener("click", event => {
            event.preventDefault();
            loadPage("profile");
        });
    }

    /* =========================================
       SIDEBAR & HAMBURGER MENU
    ========================================= */

    function setMenu(open) {
        if (!layout || !menuBtn || !sidebar) return;

        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

        if (!isMobile) {
            open = true;
        }

        // Update layout classes
        layout.classList.toggle("menu-open", open);
        layout.classList.toggle("sidebar-open", open);

        // Update sidebar
        sidebar.classList.toggle("open", open);

        // Update hamburger button
        if (menuBtn) {
            menuBtn.classList.toggle("active", open);

            menuBtn.setAttribute(
                "aria-expanded",
                String(open)
            );

            menuBtn.setAttribute(
                "aria-label",
                open ? "Close Menu" : "Open Menu"
            );
        }

        // Overlay mobile only
        if (overlay) overlay.classList.toggle("active", isMobile && open);
    }


    /* =========================================
       HAMBURGER BUTTON
    ========================================= */

    if (menuBtn && layout && sidebar) {
        menuBtn.addEventListener("click", () => {
            if (window.innerWidth > MOBILE_BREAKPOINT) return;

            const isOpen = sidebar.classList.contains("open");

            setMenu(!isOpen);
        });
    }

    /* =========================================
       OVERLAY
    ========================================= */

    if (overlay) {
        overlay.addEventListener("click", () => {
            setMenu(false);
        });
    }

    /* =========================================
       FILTER PANEL
    ========================================= */

    function initFilterPanel() {
        const filterBtn = document.getElementById("filter-btn");
        const filterPanel = document.getElementById("filter-panel");

        if (!filterBtn || !filterPanel) return;

        // Prevent duplicate event listeners
        if (filterBtn.dataset.initialized === "true") return;

        filterBtn.dataset.initialized = "true";

        filterBtn.setAttribute(
            "aria-expanded",
            String(!filterPanel.hidden)
        );

        filterBtn.addEventListener("click", () => {
            const isHidden = filterPanel.hidden;

            filterPanel.hidden = !isHidden;

            filterBtn.setAttribute("aria-expanded", String(isHidden));
        });
    }

    /* =========================================
    ROLE MANAGEMENT
    ========================================= */

    function canAccessRole(requiredRole) {
        return ROLE_ACCESS[currentRole].includes(requiredRole);
    }

    function canAccessPage(pageName) {
        const requiredRole = PAGE_ROLES[pageName];

        if (!requiredRole) {
            return false;
        }

        return canAccessRole(requiredRole);
    }

    function updateRoleUI() {

        // Update role button
        if (currentRoleText) {
            currentRoleText.textContent = currentRole.toUpperCase();
        }

        // Update sidebar visibility
        if (sidebar) {
            sidebar.querySelectorAll("[data-role]").forEach(item => {
                const requiredRole = item.dataset.role;
                item.hidden = !canAccessRole(requiredRole);
            });
        }
    }

    function changeRole() {
        const currentIndex = ROLES.indexOf(currentRole);
        const nextIndex = (currentIndex + 1) % ROLES.length;
        currentRole = ROLES[nextIndex];

        sessionStorage.setItem("currentRole", currentRole);
        updateRoleUI();

        // Return to Home when switching roles
        loadHome();
    }

    if (roleToggle) {
        roleToggle.addEventListener("click", changeRole);
    }

    /* =========================================
       DARK MODE
    ========================================= */

    function initTheme() {
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
        } else if (savedTheme === "light") {
            document.body.classList.remove("dark-mode");
        }

        if (!themeToggle) return;

        themeToggle.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-mode");

            localStorage.setItem(
                "theme",
                isDark ? "dark" : "light"
            );

            themeToggle.setAttribute(
                "aria-pressed",
                String(isDark)
            );
        });

        themeToggle.setAttribute(
            "aria-pressed",
            String(document.body.classList.contains("dark-mode"))
        );
    }

    /* =========================================
       ACTIVE SIDEBAR LINK
    ========================================= */

    function updateActiveLink(pageName) {
        if (!sidebar) return;

        sidebar.querySelectorAll("a").forEach(link => {
            const isActive = link.dataset.page === pageName;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    /* =========================================
       HOME PAGE
    ========================================= */

    function loadHome(addHistory = true) {
        if (!mainContent) return;

        // Invalidate any pending page requests
        pageRequestId++;

        mainContent.innerHTML = homeContent;
        mainContent.scrollTop = 0;

        updateActiveLink("home");

        // Initialize home page features
        initFilterPanel();
        initSlideshow();

        if (addHistory) {
            history.pushState(
                { page: "home" },
                "",
                HOME_URL
            );
        }

        document.title = "Home | ArchersHub 2.0";

        // Close menu on mobile
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            setMenu(false);
        }
    }

    // Loads teacher/scripts.js only when Grade Encoding is opened,
    // so it can't interfere with the sidebar or theme toggle on other pages.
    let teacherScriptPromise = null;

    function loadTeacherScript() {

        if (typeof window.initGradeEncoding === "function") {
            return Promise.resolve();
        }

        if (!teacherScriptPromise) {
            teacherScriptPromise = new Promise(resolve => {
                const script = document.createElement("script");
                script.src = "teacher/scripts.js";
                script.onload = resolve;
                script.onerror = () => {
                    console.error("Could not load teacher/scripts.js");
                    resolve();
                };
                document.body.appendChild(script);
            });
        }

        return teacherScriptPromise;
    }

    /* =========================================
       DYNAMIC PAGE LOADING
    ========================================= */

    async function loadPage(pageName, addHistory = true) {
        const file = pages[pageName];

        if (!file || !mainContent) return;

        const currentRequest = ++pageRequestId;

        try {

            const response = await fetch(file);

            if (!response.ok) {
                throw new Error(
                    "Could not load " + file
                );
            }

            const html = await response.text();

            // Ignore outdated requests
            if (currentRequest !== pageRequestId) {
                return;
            }

            // Replace only the main content
            mainContent.innerHTML = html;
            mainContent.scrollTop = 0;

            updateActiveLink(pageName);

            // Initialize Organizations page
            if (pageName === "organizations") {
                initOrganizations();
            }

            /* =================================
            STUDENT PAGE INITIALIZATION
            ================================= */

            if (window.ArchersHubStudent) {
                window.ArchersHubStudent.initialize(pageName);
            }

            /* =================================
               PAGE INITIALIZATION
            ================================= */

            if (pageName === "grade-encoding") {
                if (typeof window.initGradeEncoding === "function") {
                    window.initGradeEncoding();
                }
            }

            // Initialize shared page features
            initFilterPanel();
            initSlideshow();


            /* =================================
               BROWSER HISTORY
            ================================= */

            if (addHistory) {
                history.pushState(
                    { page: pageName },
                    "",
                    HOME_URL + "?page=" + encodeURIComponent(pageName)
                );
            }


            /* =================================
               PAGE TITLE
            ================================= */

            switch (pageName) {
                case "enlistment":
                    document.title = "Enlistment | ArchersHub 2.0";
                    break;

                case "grade-encoding":
                    document.title = "Grade Encoding | ArchersHub 2.0";
                    break;

                default: document.title = "ArchersHub 2.0";
            }

            // Close menu on mobile
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                setMenu(false);
            }
        } catch (error) {
            if (currentRequest === pageRequestId) {
                console.error("Page loading error:", error);
            }
        }
    }


    /* =========================================
       SIDEBAR NAVIGATION
    ========================================= */

    if (sidebar) {
        sidebar.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", event => {
                const pageName = link.dataset.page;

                // Home page
                if (pageName === "home") {
                    event.preventDefault();
                    loadHome();
                    return;
                }

                // Dynamic pages
                if (pageName && Object.prototype.hasOwnProperty.call(pages, pageName)) {
                    event.preventDefault();
                    loadPage(pageName);
                    return;
                }

                // Normal links
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    setMenu(false);
                }
            });
        });
    }


    /* =========================================
       BROWSER BACK / FORWARD
    ========================================= */

    window.addEventListener("popstate", () => {
        const params = new URLSearchParams(window.location.search);
        const pageName = params.get("page");

        if (pageName && Object.prototype.hasOwnProperty.call(pages, pageName)) {
            loadPage(pageName, false);
        } else {
            loadHome(false);
        }
    });


    /* =========================================
       RESPONSIVE SIDEBAR
    ========================================= */

    window.addEventListener("resize", () => {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

        if (!isMobile) {
            setMenu(true);
        } else {
            // mobile
            setMenu(false);
        }

        wasMobile = isMobile;
    });

    /* =========================================
       SHARED HELPERS
    ========================================= */

    const $ = id => document.getElementById(id);
    const STORE_KEY = "archershub.enrolled";
    const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

    // SAMPLE DATA until a backend exists
    const CAL_EVENTS = [
        { start: "2026-10-19", end: "2026-10-24", title: "Enlistment period", important: true },
        { start: "2026-10-26", end: "2026-10-26", title: "Start of classes", important: true },
        { start: "2026-11-01", end: "2026-11-01", title: "All Saints' Day (no classes)", important: false },
        { start: "2026-11-20", end: "2026-11-20", title: "Last day of course withdrawal", important: true },
        { start: "2026-12-08", end: "2026-12-08", title: "Feast of the Immaculate Conception", important: false }
    ];

    const RECORDS = [
        { term: "Y2526-1", label: "AY 2025-2026, Term 1", course: "CCPROG1", units: 3, grade: 4.0 },
        { term: "Y2526-1", label: "AY 2025-2026, Term 1", course: "CCDSALM", units: 3, grade: 3.5 },
        { term: "Y2526-2", label: "AY 2025-2026, Term 2", course: "CCAPDEV", units: 3, grade: 3.5 }
    ];

    function escapeHTML(text) {
        return String(text).replace(/[&<>"']/g, ch => (
            { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
        ));
    }

    function toast(message, type = "info") {
        let box = document.querySelector(".toast-container");

        if (!box) {
            box = document.createElement("div");
            box.className = "toast-container";
            box.setAttribute("aria-live", "polite");
            document.body.appendChild(box);
        }

        const item = document.createElement("div");
        item.className = "toast " + type;
        item.textContent = message;
        box.appendChild(item);

        setTimeout(() => {
            item.classList.add("hide");
            setTimeout(() => item.remove(), 300);
        }, 3200);
    }

    function readJSON(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function toMinutes(text) {
        const m = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(text.trim());
        if (!m) return 0;
        let hours = Number(m[1]) % 12;
        if (m[3].toUpperCase() === "PM") hours += 12;
        return hours * 60 + Number(m[2]);
    }

    function formatTime(minutes) {
        let hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const suffix = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return hours + ":" + String(mins).padStart(2, "0") + " " + suffix;
    }

    function formatDate(iso) {
        return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", {
            month: "short", day: "numeric", year: "numeric"
        });
    }

    function formatRange(event) {
        return event.start === event.end
            ? formatDate(event.start)
            : formatDate(event.start) + " - " + formatDate(event.end);
    }

    // Reads "MON 07:30PM-09:00PM | online<br>THU ..." from a course row
    function parseSlots(row) {
        const small = row.querySelector(".section-cell small");
        if (!small) return [];

        return small.innerHTML.split(/<br\s*\/?>/i).map(line => {
            const m = /(MON|TUE|WED|THU|FRI|SAT)\s+(\d{1,2}:\d{2}[AP]M)-(\d{1,2}:\d{2}[AP]M)\s*\|\s*(.+)/i
                .exec(line.trim());

            return m
                ? { day: m[1].toUpperCase(), start: toMinutes(m[2]), end: toMinutes(m[3]), place: m[4].trim() }
                : null;
        }).filter(Boolean);
    }

    function entryFromRow(row) {
        const span = row.querySelector(".section-cell span");
        const section = span ? span.textContent.split("\u2192").pop().trim() : "none";

        return {
            code: row.dataset.code,
            name: row.dataset.name,
            section,
            slots: parseSlots(row)
        };
    }

    function buildGrid(tbody, entries) {
        if (!tbody) return;

        const starts = [...new Set(entries.flatMap(e => e.slots.map(s => s.start)))]
            .sort((a, b) => a - b);

        if (starts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty">No scheduled classes yet.</td></tr>';
            return;
        }

        tbody.innerHTML = starts.map(start => {
            const cells = DAYS.map(day => {
                const hits = entries.filter(e => e.slots.some(s => s.day === day && s.start === start));
                return hits.length
                    ? '<td class="filled">' + hits.map(h => escapeHTML(h.code)).join("<br>") + "</td>"
                    : "<td></td>";
            }).join("");

            return "<tr><td>" + formatTime(start) + "</td>" + cells + "</tr>";
        }).join("");
    }

    function slotText(slot) {
        return slot.day + " " + formatTime(slot.start) + "-" + formatTime(slot.end) + " | " + slot.place;
    }

    /* =========================================
       PAGE INITIALIZERS (keyed by data-page name)
    ========================================= */

    const PAGE_INITS = {
        enlistment: () => initCourseTable("enlist"),
        "add/drop": () => initCourseTable("adddrop"),
        "apply-special": initSpecialClass,
        withdrawal: initWithdrawal,
        "program-exchange": initProgramExchange,
        curriculum: initCurriculum,
        schedule: initSchedule,
        records: initRecords,
        calendar: initCalendar,
        organizations: initOrganizations,
        profile: initProfile
    };

    /* =========================================
       ORGANIZATIONS PAGE
    ========================================= */

    function initOrganizations() {

        const orgSearch = document.getElementById("org-search");
        const orgList = document.getElementById("org-list");
        const orgEmpty = document.getElementById("org-empty");

        if (!orgSearch || !orgList || !orgEmpty) return;

        // ORGANIZATION SEARCH
        orgSearch.addEventListener("input", function () {

            const searchValue = orgSearch.value.toLowerCase().trim();

            const organizations = orgList.querySelectorAll(".org-card");
            let visibleCount = 0;

            organizations.forEach(function (org) {

                const orgName = org.querySelector("h3").textContent.toLowerCase();
                const orgDescription = org.querySelector("p").textContent.toLowerCase();

                if (
                    orgName.includes(searchValue) ||
                    orgDescription.includes(searchValue)
                ) {
                    org.style.display = "";
                    visibleCount++;
                } else {
                    org.style.display = "none";
                }

            });

            // Show message if no organizations match
            orgEmpty.hidden = visibleCount !== 0;

        });


        // APPLY TO ORGANIZATION
        orgList.addEventListener("click", function (event) {

            const button = event.target.closest('[data-action="apply"]');

            if (!button) return;

            const orgCard = button.closest(".org-card");
            const orgName = orgCard.querySelector("h3").textContent;

            // Prevent applying more than once
            if (button.disabled) return;

            // Change button text
            button.textContent = "Joined";
            button.disabled = true;

            button.classList.remove("add");
            button.classList.add("joined");

            // Display confirmation
            toast("Joined " + orgName + "!", "success");

        });

    }

    /* =========================================
       SLIDESHOW
    ========================================= */

    let slideIndex = 1;
    let autoPlay = null;

    function showSlides(n) {
        const slides = document.querySelectorAll(".slide");
        const dots = document.querySelectorAll(".dot");

        if (slides.length === 0) return;

        if (n > slides.length) {
            slideIndex = 1;
        } else if (n < 1) {
            slideIndex = slides.length;
        } else {
            slideIndex = n;
        }

        slides.forEach(slide => {
            slide.classList.remove("active");
        });

        dots.forEach(dot => {
            dot.classList.remove("active");
        });

        if (slides[slideIndex - 1]) {
            slides[slideIndex - 1].classList.add(
                "active"
            );
        }

        if (dots[slideIndex - 1]) {
            dots[slideIndex - 1].classList.add(
                "active"
            );
        }
    }

    function startAutoPlay() {
        clearInterval(autoPlay);

        const slides = document.querySelectorAll(".slide");

        if (slides.length <= 1) return;

        autoPlay = setInterval(() => {
            slideIndex++;
            showSlides(slideIndex);
        }, 5000);
    }

    function restartAutoPlay() {
        clearInterval(autoPlay);
        startAutoPlay();
    }

    function plusSlides(n) {
        showSlides(slideIndex + n);
        restartAutoPlay();
    }

    function currentSlide(n) {
        showSlides(n);
        restartAutoPlay();
    }

    function initSlideshow() {
        clearInterval(autoPlay);
        autoPlay = null;

        const slides = document.querySelectorAll(".slide");

        if (slides.length === 0) return;

        slideIndex = 1;

        showSlides(slideIndex);
        startAutoPlay();
    }

    // Support HTML onclick attributes
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;

    /* =========================================
       INITIAL PAGE SETUP
    ========================================= */

    // Initialize theme
    initTheme();

    // Initialize sidebar
    if (window.innerWidth > MOBILE_BREAKPOINT) {
        setMenu(true);
    } else {
        setMenu(false);
    }

    // Check URL for direct page access
    const initialPage = new URLSearchParams(
        window.location.search
    ).get("page");

    if (initialPage && Object.prototype.hasOwnProperty.call(pages, initialPage)) {
        loadPage(initialPage, false);
    } else {
        updateActiveLink("home");
        initFilterPanel();
        initSlideshow();
    }
});
