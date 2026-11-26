
/* =========================================
   HOME ANNOUNCEMENTS VIEW
========================================= */

// Display published announcements
export function renderHomeAnnouncements(announcements) {

    const container = document.getElementById(
        "homeAnnouncementsList"
    );

    if (!container) return;

    container.replaceChildren();

    // =====================================
    // NO ANNOUNCEMENTS
    // =====================================

    if (!announcements.length) {

        const emptyMessage = document.createElement("div");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            "No announcements from the Provost.";

        container.appendChild(emptyMessage);

        return;
    }


    // =====================================
    // DISPLAY ANNOUNCEMENTS
    // =====================================

    announcements.forEach(announcement => {

        const item = document.createElement("article");

        item.className = "home-announcement-item";

        // Important announcement styling
        if (Number(announcement.is_important) === 1) {
            item.classList.add("important");
        }


        // TITLE
        const heading = document.createElement("h3");

        heading.className = "home-announcement-title";

        heading.textContent = announcement.title;

        item.appendChild(heading);


        // IMPORTANT BADGE
        if (Number(announcement.is_important) === 1) {

            const badge = document.createElement("span");

            badge.className = "home-announcement-important";

            badge.textContent = "Important";

            item.appendChild(badge);
        }


        // CONTENTS
        const contents = document.createElement("p");

        contents.className = "home-announcement-contents";

        contents.textContent = announcement.contents || "";

        item.appendChild(contents);


        // DATE
        const date = document.createElement("small");

        date.className = "home-announcement-date";

        date.textContent =
            `Visible until ${announcement.end_date}`;

        item.appendChild(date);


        container.appendChild(item);

    });

}


// Display an error without crashing Home
export function showHomeAnnouncementsError(message) {

    const container = document.getElementById(
        "homeAnnouncementsList"
    );

    if (!container) return;

    container.replaceChildren();

    const errorMessage = document.createElement("div");

    errorMessage.className = "empty-message";

    errorMessage.textContent = message;

    container.appendChild(errorMessage);
}
