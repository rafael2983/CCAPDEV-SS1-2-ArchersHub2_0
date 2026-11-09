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