
/* =========================================
   ARCHERSHUB 2.0 - STUDENT SCRIPT
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

    const ROLES = ["student", "teacher", "office", "admin"];

    const ROLE_ACCESS = {
        student: ["general", "student"],
        teacher: ["general", "teacher"],
        office: ["general", "student", "teacher", "office"],
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
        enlistment: "student/enlistment.html",
        "add/drop": "student/add-drop.html",
        "special-class": "student/apply-special.html",
        "course-withdrawal": "student/withdrawal.html",
        "program-exchange": "student/program-exchange.html",
        "curriculum-progression": "student/curriculum.html",
        "view-schedule": "general/schedule.html",
        "view-record": "student/records.html",
        calender: "general/calendar.html",
        organizations: "general/organizations.html",
        profile: "general/profile.html",
        "grade-encoding": "teacher/grade-encoding.html",
        "view-application": "teacher/application.html",
        "make-announcements": "office/announcements.html",
        "account-menegement": "admin/account-menegement.html",
        "ai-chat": "general/ai-chat.html"
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

        if (!layout || !menuBtn || !sidebar) {
            return;
        }

        // Update layout classes
        layout.classList.toggle("menu-open", open);
        layout.classList.toggle("sidebar-open", open);

        // Update sidebar
        sidebar.classList.toggle("open", open);

        // Update hamburger button
        menuBtn.classList.toggle("active", open);

        menuBtn.setAttribute(
            "aria-expanded",
            String(open)
        );

        menuBtn.setAttribute(
            "aria-label",
            open ? "Close Menu" : "Open Menu"
        );

        // Support both icon-based and text-based buttons
        const hasBars =
            menuBtn.querySelector(".bar") !== null;

        if (!hasBars) {
            menuBtn.textContent = open ? "✕" : "☰";
        }

        // Overlay is used on mobile only
        if (overlay) {
            const showOverlay =
                open &&
                window.innerWidth <= MOBILE_BREAKPOINT;

            overlay.classList.toggle(
                "active",
                showOverlay
            );
        }

        // Save desktop sidebar state
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            sessionStorage.setItem(
                "sidebarOpen",
                String(open)
            );
        }
    }


    /* =========================================
       HAMBURGER BUTTON
    ========================================= */

    if (menuBtn && layout && sidebar) {

        menuBtn.addEventListener("click", () => {

            const isOpen =
                sidebar.classList.contains("open");

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

        const filterBtn =
            document.getElementById("filter-btn");

        const filterPanel =
            document.getElementById("filter-panel");

        if (!filterBtn || !filterPanel) {
            return;
        }

        // Prevent duplicate event listeners
        if (filterBtn.dataset.initialized === "true") {
            return;
        }

        filterBtn.dataset.initialized = "true";

        filterBtn.setAttribute(
            "aria-expanded",
            String(!filterPanel.hidden)
        );

        filterBtn.addEventListener("click", () => {

            const isHidden = filterPanel.hidden;

            filterPanel.hidden = !isHidden;

            filterBtn.setAttribute(
                "aria-expanded",
                String(isHidden)
            );

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

        const savedTheme =
            localStorage.getItem("theme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
        } else if (savedTheme === "light") {
            document.body.classList.remove("dark-mode");
        }

        if (!themeToggle) {
            return;
        }

        themeToggle.addEventListener("click", () => {

            const isDark =
                document.body.classList.toggle(
                    "dark-mode"
                );

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
            String(
                document.body.classList.contains(
                    "dark-mode"
                )
            )
        );

    }

    /* =========================================
       ACTIVE SIDEBAR LINK
    ========================================= */

    function updateActiveLink(pageName) {

        if (!sidebar) {
            return;
        }

        sidebar.querySelectorAll("a").forEach(link => {

            const isActive =
                link.dataset.page === pageName;

            link.classList.toggle(
                "active",
                isActive
            );

            if (isActive) {

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                link.removeAttribute("aria-current");

            }

        });

    }


    /* =========================================
       HOME PAGE
    ========================================= */

    function loadHome(addHistory = true) {

        if (!mainContent) {
            return;
        }

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

    /* =========================================
       DYNAMIC PAGE LOADING
    ========================================= */

    async function loadPage(
        pageName,
        addHistory = true
    ) {

        const file = pages[pageName];

        if (!file || !mainContent) {
            return;
        }

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


            /* =================================
               PAGE INITIALIZATION
            ================================= */

            if (pageName === "enlistment") {

                initEnlistment();

            }

            if (pageName === "grade-encoding") {

                if (
                    typeof window.initGradeEncoding ===
                    "function"
                ) {

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
                    HOME_URL +
                    "?page=" +
                    encodeURIComponent(pageName)
                );

            }


            /* =================================
               PAGE TITLE
            ================================= */

            switch (pageName) {

                case "enlistment":
                    document.title =
                        "Enlistment | ArchersHub 2.0";
                    break;

                case "grade-encoding":
                    document.title =
                        "Grade Encoding | ArchersHub 2.0";
                    break;

                default:
                    document.title =
                        "ArchersHub 2.0";

            }


            // Close menu on mobile
            if (
                window.innerWidth <= MOBILE_BREAKPOINT
            ) {

                setMenu(false);

            }

        } catch (error) {

            if (currentRequest === pageRequestId) {

                console.error(
                    "Page loading error:",
                    error
                );

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
                if (
                    pageName &&
                    Object.prototype.hasOwnProperty.call(
                        pages,
                        pageName
                    )
                ) {

                    event.preventDefault();

                    loadPage(pageName);

                    return;
                }

                // Normal links
                if (
                    window.innerWidth <=
                    MOBILE_BREAKPOINT
                ) {

                    setMenu(false);

                }

            });

        });

    }


    /* =========================================
       BROWSER BACK / FORWARD
    ========================================= */

    window.addEventListener("popstate", () => {

        const params = new URLSearchParams(
            window.location.search
        );

        const pageName = params.get("page");

        if (
            pageName &&
            Object.prototype.hasOwnProperty.call(
                pages,
                pageName
            )
        ) {

            loadPage(pageName, false);

        } else {

            loadHome(false);

        }

    });


    /* =========================================
       RESPONSIVE SIDEBAR
    ========================================= */

    window.addEventListener("resize", () => {

        const isMobile =
            window.innerWidth <= MOBILE_BREAKPOINT;

        // Only act when crossing breakpoint
        if (isMobile === wasMobile) {
            return;
        }

        wasMobile = isMobile;

        if (isMobile) {

            // Enter mobile mode
            setMenu(false);

        } else {

            // Restore desktop menu state
            const savedState =
                sessionStorage.getItem(
                    "sidebarOpen"
                ) === "true";

            setMenu(savedState);

        }

    });


    /* =========================================
       ENLISTMENT INITIALIZATION
    ========================================= */

    function initEnlistment() {

        const searchInput =
            document.getElementById("course-search");

        const sortSelect =
            document.getElementById("course-sort");

        const courseBody =
            document.getElementById("course-body");

        if (
            !searchInput ||
            !sortSelect ||
            !courseBody
        ) {
            return;
        }

        // Add the existing search and sorting
        // functionality here when available.

    }


    /* =========================================
       SLIDESHOW
    ========================================= */

    let slideIndex = 1;
    let autoPlay = null;

    function showSlides(n) {

        const slides =
            document.querySelectorAll(".slide");

        const dots =
            document.querySelectorAll(".dot");

        if (slides.length === 0) {
            return;
        }

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

        const slides =
            document.querySelectorAll(".slide");

        if (slides.length <= 1) {
            return;
        }

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

        const slides =
            document.querySelectorAll(".slide");

        if (slides.length === 0) {
            return;
        }

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

    // Restore sidebar state
    if (
        window.innerWidth > MOBILE_BREAKPOINT
    ) {

        const savedState =
            sessionStorage.getItem(
                "sidebarOpen"
            ) === "true";

        setMenu(savedState);

    } else {

        setMenu(false);

    }

    // Check URL for direct page access
    const initialPage = new URLSearchParams(
        window.location.search
    ).get("page");

    if (
        initialPage &&
        Object.prototype.hasOwnProperty.call(
            pages,
            initialPage
        )
    ) {

        loadPage(initialPage, false);

    } else {

        updateActiveLink("home");

        initFilterPanel();
        initSlideshow();

    }

});