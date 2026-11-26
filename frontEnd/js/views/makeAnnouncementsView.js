
/* =========================================
   MAKE ANNOUNCEMENTS VIEW
========================================= */


// Render selected attachments
export function renderAnnouncementFiles(files, onRemove) {

    const container = document.getElementById(
        "announcementFileList"
    );

    container.replaceChildren();

    if (files.length === 0) {

        container.textContent = "No files attached yet.";
        return;

    }

    files.forEach((file, index) => {

        const item = document.createElement("div");
        item.className = "announcement-file-item";

        const fileName = document.createElement("span");
        fileName.textContent = file.name;

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "announcement-remove-file";

        removeButton.addEventListener("click", () => {
            onRemove(index);
        });

        item.append(fileName, removeButton);

        container.appendChild(item);

    });

}


// Display feedback
export function showAnnouncementMessage(message, isError = false) {

    const element = document.getElementById(
        "announcementMessage"
    );

    element.textContent = message;

    element.classList.toggle("error", isError);

}


// Reset form
export function resetAnnouncementForm() {

    document.getElementById("announcementForm").reset();

    document.getElementById(
        "announcementFileList"
    ).textContent = "No files attached yet.";

}


// Set default dates
export function setDefaultAnnouncementDates() {

    const today = new Date();

    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    document.getElementById(
        "announcementStartDate"
    ).value = localDate;

    document.getElementById(
        "announcementEndDate"
    ).value = localDate;

}
