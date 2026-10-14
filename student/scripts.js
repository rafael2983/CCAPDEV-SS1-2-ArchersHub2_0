
document.addEventListener("DOMContentLoaded", () => {
    // =========================================
    // ELEMENTS
    // =========================================

    const menuBtn = document.getElementById("menu-button");
    const layout = document.getElementById("layout");
    const overlay = document.getElementById("overlay");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");

    const HOME_URL = "home.html";
    const MOBILE_BREAKPOINT = 800;

    const homeContent = mainContent ? mainContent.innerHTML : "";

    const pages = {
        enlistment: "enlistment.html",
        "grade-encoding": "teacher/grade-encoding.html"
    };

    let pageRequestId = 0;

    // =========================================
    // SIDEBAR & HAMBURGER MENU
    // =========================================

    function setMenu(open) {
        if (!layout || !menuBtn) return;

        layout.classList.toggle("menu-open", open);
        menuBtn.classList.toggle("active", open);

        menuBtn.setAttribute(
            "aria-expanded",
            String(open)
        );

        menuBtn.setAttribute(
            "aria-label",
            open ? "Close Menu" : "Open Menu"
        );

        menuBtn.textContent = open ? "✕" : "☰";

        // Synchronize sidebar state
        if (sidebar) {
            sidebar.classList.toggle("open", open);
        }

        // Synchronize overlay state
        if (overlay) {
            overlay.classList.toggle("active", open);
        }

        // Save desktop sidebar state
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            sessionStorage.setItem(
                "sidebarOpen",
                String(open)
            );
        }
    }

    // Hamburger button
    if (menuBtn && layout) {
        menuBtn.addEventListener("click", () => {
            const isOpen = layout.classList.contains("menu-open");
            setMenu(!isOpen);
        });
    }

    // Close sidebar when overlay is clicked
    if (overlay) {
        overlay.addEventListener("click", () => {
            setMenu(false);
        });
    }

    // =========================================
    // FILTER PANEL
    // =========================================

    function initFilterPanel() {
        const filterBtn = document.getElementById("filter-btn");
        const filterPanel = document.getElementById("filter-panel");

        if (!filterBtn || !filterPanel) return;

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

    // =========================================
    // ACTIVE SIDEBAR LINK
    // =========================================

    function updateActiveLink(pageName) {
        if (!sidebar) return;

        sidebar.querySelectorAll("a").forEach(link => {
            const isActive = link.dataset.page === pageName;

            link.classList.toggle("active", isActive);

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

    // =========================================
    // HOME PAGE
    // =========================================

    function loadHome(addHistory = true) {
        if (!mainContent) return;

        // Invalidate previous page requests
        pageRequestId++;

        mainContent.innerHTML = homeContent;
        mainContent.scrollTop = 0;

        updateActiveLink("home");

        if (addHistory) {
            history.pushState(
                { page: "home" },
                "",
                HOME_URL
            );
        }

        document.title = "Home | ArchersHub 2.0";

        // Initialize filters if present
        initFilterPanel();

        // Close sidebar on mobile
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            setMenu(false);
        }
    }

    // =========================================
    // DYNAMIC PAGE LOADING
    // =========================================

    async function loadPage(pageName, addHistory = true) {
        const file = pages[pageName];

        if (!file || !mainContent) return;

        const currentRequest = ++pageRequestId;

        try {
            const response = await fetch(file);

            if (!response.ok) {
                throw new Error("Could not load " + file);
            }

            const html = await response.text();

            // Ignore outdated requests
            if (currentRequest !== pageRequestId) {
                return;
            }

            mainContent.innerHTML = html;
            mainContent.scrollTop = 0;

            updateActiveLink(pageName);

            // Initialize page-specific features
            if (pageName === "enlistment") {
                initEnlistment();
            }

            if (pageName === "grade-encoding") {
                if (typeof window.initGradeEncoding === "function") {
                    window.initGradeEncoding();
                }
            }

            // Initialize filter panel after loading
            initFilterPanel();

            if (addHistory) {
                history.pushState(
                    { page: pageName },
                    "",
                    HOME_URL + "?page=" +
                    encodeURIComponent(pageName)
                );
            }

            document.title =
                pageName === "enlistment"
                    ? "Enlistment | ArchersHub 2.0"
                    : pageName === "grade-encoding"
                    ? "Grade Encoding | ArchersHub 2.0"
                    : "ArchersHub 2.0";

            // Close menu on mobile
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
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

    // =========================================
    // SIDEBAR NAVIGATION
    // =========================================

    if (sidebar) {
        sidebar.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", event => {
                const pageName = link.dataset.page;

                if (pageName === "home") {
                    event.preventDefault();
                    loadHome();
                    return;
                }

                if (pageName && pages[pageName]) {
                    event.preventDefault();
                    loadPage(pageName);
                    return;
                }

                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    setMenu(false);
                }
            });
        });
    }

    // =========================================
    // BROWSER BACK / FORWARD
    // =========================================

    window.addEventListener("popstate", () => {
        const params = new URLSearchParams(
            window.location.search
        );

        const pageName = params.get("page");

        if (pageName && pages[pageName]) {
            loadPage(pageName, false);
        } else {
            loadHome(false);
        }
    });

    // =========================================
    // RESPONSIVE SIDEBAR
    // =========================================

    let wasMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    window.addEventListener("resize", () => {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

        // Only update when crossing breakpoint
        if (isMobile === wasMobile) return;

        wasMobile = isMobile;

        if (isMobile) {
            setMenu(false);
        } else {
            const savedState = sessionStorage.getItem("sidebarOpen") === "true";
            setMenu(savedState);
        }
    });

    // =========================================
    // ENLISTMENT INITIALIZATION
    // =========================================
    
    function initEnlistment() {
        const searchInput = document.getElementById("course-search");
        const sortSelect = document.getElementById("course-sort");
        const courseBody = document.getElementById("course-body");

        if (!searchInput || !sortSelect || !courseBody) return;
    }

    // =========================================
    // INITIAL PAGE SETUP
    // =========================================

    if (window.innerWidth > MOBILE_BREAKPOINT) {
        const savedState = sessionStorage.getItem("sidebarOpen") === "true";
        setMenu(savedState);
    } else {
        setMenu(false);
    }

    const initialPage = new URLSearchParams(window.location.search).get("page");

    if (initialPage && pages[initialPage]) {
        loadPage(initialPage, false);
    } else {
        updateActiveLink("home");
        initFilterPanel();
    }
});