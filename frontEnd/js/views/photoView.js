const schoolPhoto = document.getElementById("schoolPhoto");

const indicators = document.querySelectorAll(
    "#photoIndicators span"
);

export function renderPhoto(photo, index) {

    // Make sure the image element exists
    if (!schoolPhoto) {
        console.error("School photo element not found!");
        return;
    }

    schoolPhoto.classList.add("fade");

    const newImage = new Image();

    newImage.onload = () => {

        // Update displayed photograph
        schoolPhoto.src = newImage.src;

        // Update active indicator
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle("active", i === index);
        });

        // Fade image back in
        requestAnimationFrame(() => {
            schoolPhoto.classList.remove("fade");
        });

    };

    newImage.onerror = () => {

        console.error("Unable to load image:", photo);

        schoolPhoto.classList.remove("fade");

    };

    newImage.src = photo;
}
