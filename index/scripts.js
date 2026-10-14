let slideIndex = 1;
let autoPlay;

showSlides(slideIndex);
startAutoPlay();

// Next / previous arrows
function plusSlides(n) {
    showSlides(slideIndex += n);
    restartAutoPlay();
}

// Dots
function currentSlide(n) {
    showSlides(slideIndex = n);
    restartAutoPlay();
}

function showSlides(n) {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    // Wrap around
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;

    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    slides[slideIndex - 1].classList.add("active");
    dots[slideIndex - 1].classList.add("active");
}

// Optional: auto-advance every 5 seconds
function startAutoPlay() {
    autoPlay = setInterval(() => showSlides(slideIndex += 1), 5000);
}

function restartAutoPlay() {
    clearInterval(autoPlay);
    startAutoPlay();
}