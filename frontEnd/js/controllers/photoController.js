import * as PhotoModel from "../models/photoModel.js";

import { renderPhoto } from "../views/photoView.js";

export function initializePhotoCarousel() {

    const nextPhotoButton = document.getElementById("nextPhoto");

    if (!nextPhotoButton) {
        console.error("Next photo button not found!");
        return;
    }

    // Display initial photograph
    renderPhoto(
        PhotoModel.getCurrentPhoto(),
        PhotoModel.getCurrentIndex()
    );

    // Handle next-photo button
    nextPhotoButton.addEventListener("click", () => {

        const nextImage = PhotoModel.nextPhoto();

        renderPhoto(
            nextImage,
            PhotoModel.getCurrentIndex()
        );

    });

}
