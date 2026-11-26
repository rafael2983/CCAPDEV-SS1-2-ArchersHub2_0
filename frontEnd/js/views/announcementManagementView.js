
/* =========================================
   ANNOUNCEMENT MANAGEMENT VIEW
========================================= */

export function renderManagementList(
    announcements,
    handlers
) {

    const container = document.getElementById(
        "announcementManagementList"
    );

    if (!container) return;

    container.replaceChildren();

    if (announcements.length === 0) {

        const empty = document.createElement("p");

        empty.className = "empty-message";
        empty.textContent = "No announcements created yet.";

        container.appendChild(empty);
        return;
    }

    announcements.forEach(announcement => {

        const item = document.createElement("article");
        item.className = "management-announcement-item";

        const details = document.createElement("div");
        details.className = "management-announcement-details";

        const title = document.createElement("h3");
        title.textContent = announcement.title;

        const status = document.createElement("p");
        status.className = "management-announcement-status";

        const isPublished =
            announcement.status === "published";

        status.textContent = isPublished
            ? "Published"
            : "Draft";

        if (Number(announcement.is_important) === 1) {
            status.textContent += " · Important";
        }

        const dates = document.createElement("small");

        dates.textContent =
            `Start: ${announcement.start_date || "Not set"} | ` +
            `End: ${announcement.end_date || "Not set"}`;

        details.append(title, status, dates);


        // =====================================
        // ACTION BUTTONS
        // =====================================

        const actions = document.createElement("div");
        actions.className = "management-announcement-actions";

        function createButton(label, className, callback) {

            const button = document.createElement("button");

            button.type = "button";
            button.textContent = label;
            button.className = className;

            button.addEventListener("click", callback);

            return button;
        }

        const editButton = createButton(
            "Edit",
            "management-edit-button",
            () => handlers.onEdit(announcement)
        );

        const toggleButton = createButton(
            isPublished ? "Unpublish" : "Publish",
            "management-toggle-button",
            () => handlers.onToggle(announcement)
        );

        const deleteButton = createButton(
            "Delete",
            "management-delete-button",
            () => handlers.onDelete(announcement)
        );

        actions.append(
            editButton,
            toggleButton,
            deleteButton
        );

        item.append(details, actions);

        container.appendChild(item);
    });
}


export function showManagementMessage(
    message,
    isError = false
) {

    const element = document.getElementById(
        "managementMessage"
    );

    if (!element) return;

    element.textContent = message;
    element.classList.toggle("error", isError);
}
