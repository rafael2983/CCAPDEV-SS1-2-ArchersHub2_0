
const photos = [
    "images/school-picture1.png",
    "images/school-picture2.png",
    "images/school-picture3.png",
    "images/school-picture4.png"
];

let currentPhoto = 0;

export function getCurrentPhoto() {
    return photos[currentPhoto];
}

export function getCurrentIndex() {
    return currentPhoto;
}

export function getTotalPhotos() {
    return photos.length;
}

export function nextPhoto() {
    currentPhoto = (currentPhoto + 1) % photos.length;

    return getCurrentPhoto();
}
