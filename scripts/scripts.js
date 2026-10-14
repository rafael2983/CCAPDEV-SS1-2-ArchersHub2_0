/* =========================================
   SIDE MENU CONTROLLER (home.html & others)
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    // --- SIDEBAR & HAMBURGER MENU CONTROLLER ---
    const menuBtn = document.getElementById("menu-btn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const layout = document.getElementById("layout");

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("open");
        menuBtn.classList.toggle("active", isOpen);
        if (layout) layout.classList.toggle("sidebar-open", isOpen);
        if (overlay) overlay.classList.toggle("active", isOpen);
    });

    if (overlay) {
        overlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            menuBtn.classList.remove("active");
            overlay.classList.remove("active");
            if (layout) layout.classList.remove("sidebar-open");
        });
    }
}

    // --- FILTER PANEL TOGGLE ---
    const filterBtn = document.getElementById("filter-btn");
    const filterPanel = document.getElementById("filter-panel");

    if (filterBtn && filterPanel) {
        filterBtn.addEventListener("click", () => {
            const isHidden = filterPanel.hidden;
            filterPanel.hidden = !isHidden;
            filterBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
        });
    }
});

/* =========================================
   SLIDESHOW 
========================================= */

let slideIndex = 1;
let autoPlay;

function plusSlides(n) {
    showSlides(slideIndex += n);
    restartAutoPlay();
}

function currentSlide(n) {
    showSlides(slideIndex = n);
    restartAutoPlay();
}

function showSlides(n) {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    if (slides.length === 0) return;

    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;

    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    if (slides[slideIndex - 1]) slides[slideIndex - 1].classList.add("active");
    if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add("active");
}

function startAutoPlay() {
    autoPlay = setInterval(() => showSlides(slideIndex += 1), 5000);
}

function restartAutoPlay() {
    clearInterval(autoPlay);
    startAutoPlay();
}

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
    if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}