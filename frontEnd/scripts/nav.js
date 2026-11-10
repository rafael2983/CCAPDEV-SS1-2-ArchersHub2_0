document.addEventListener("DOMContentLoaded", () => {
    const MOBILE_BREAKPOINT = 800;

    const menuBtn = document.getElementById("menu-btn");
    const layout = document.getElementById("layout");
    const overlay = document.getElementById("overlay");
    const sidebar = document.getElementById("sidebar");
    const themeToggle = document.getElementById("theme-toggle");

    // Sidebar + hamburger
    function setMenu(open) {
        if (!layout || !menuBtn || !sidebar) return;
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        if (!isMobile) open = true;

        layout.classList.toggle("menu-open", open);
        layout.classList.toggle("sidebar-open", open);
        sidebar.classList.toggle("open", open);
        menuBtn.classList.toggle("active", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        menuBtn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
        if (overlay) overlay.classList.toggle("active", isMobile && open);
    }

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            if (window.innerWidth > MOBILE_BREAKPOINT) return;
            setMenu(!sidebar.classList.contains("open"));
        });
    }
    if (overlay) overlay.addEventListener("click", () => setMenu(false));
    window.addEventListener("resize", () => setMenu(sidebar.classList.contains("open")));
    setMenu(window.innerWidth > MOBILE_BREAKPOINT);

    // Dark mode (remembered in the browser)
    if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }

    // Filter panel
    const filterBtn = document.getElementById("filter-btn");
    const filterPanel = document.getElementById("filter-panel");
    if (filterBtn && filterPanel) {
        filterBtn.addEventListener("click", () => {
            const wasHidden = filterPanel.hidden;
            filterPanel.hidden = !wasHidden;
            filterBtn.setAttribute("aria-expanded", String(wasHidden));
        });
    }
});
