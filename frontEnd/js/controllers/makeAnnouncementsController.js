
/* =========================================
   MAKE ANNOUNCEMENTS CONTROLLER
   CREATE / READ / UPDATE / DELETE
========================================= */

import * as AnnouncementModel
    from "../models/makeAnnouncementsModel.js";

import * as AnnouncementView
    from "../views/makeAnnouncementsView.js";

import * as ManagementView
    from "../views/announcementManagementView.js";


export function initializeMakeAnnouncements() {

    const page = document.querySelector(".announcements-page");

    if (!page) return;

    const form = page.querySelector("#announcementForm");
    const fileInput = page.querySelector("#announcementFiles");

    const addFilesButton = page.querySelector(
        "#addAnnouncementFiles"
    );

    const saveButton = page.querySelector(
        "#saveAnnouncement"
    );

    const publishButton = form.querySelector(
        'button[type="submit"]'
    );

    const refreshButton = page.querySelector(
        "#refreshAnnouncements"
    );

    const managementList = page.querySelector(
        "#announcementManagementList"
    );

    let selectedFiles = [];
    let editingId = null;
    let isBusy = false;


    // =====================================
    // FILE SELECTION
    // =====================================

    addFilesButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {

        selectedFiles.push(...Array.from(fileInput.files));

        AnnouncementView.renderAnnouncementFiles(
            selectedFiles,
            removeFile
        );

        fileInput.value = "";
    });

    function removeFile(index) {

        selectedFiles.splice(index, 1);

        AnnouncementView.renderAnnouncementFiles(
            selectedFiles,
            removeFile
        );
    }


    // =====================================
    // FORM DATA
    // =====================================

    function getAnnouncementData(status) {

        return {
            title: page.querySelector(
                "#announcementTitle"
            ).value.trim(),

            contents: page.querySelector(
                "#announcementContents"
            ).value.trim(),

            important: page.querySelector(
                "#announcementImportant"
            ).checked,

            startDate: page.querySelector(
                "#announcementStartDate"
            ).value,

            endDate: page.querySelector(
                "#announcementEndDate"
            ).value,

            attachments: selectedFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            })),

            status
        };
    }


    function validateAnnouncement(data) {

        if (!data.title) {
            return "Please enter an announcement title.";
        }

        if (
            data.status === "Published" &&
            !data.contents
        ) {
            return "Please enter announcement contents.";
        }

        if (
            data.status === "Published" &&
            (!data.startDate || !data.endDate)
        ) {
            return "Please select both dates.";
        }

        if (
            data.startDate &&
            data.endDate &&
            data.endDate < data.startDate
        ) {
            return "End date cannot be earlier than start date.";
        }

        if (selectedFiles.length > 0) {
            return "File attachments are not supported yet. Remove the selected files first.";
        }

        return null;
    }


    // =====================================
    // BUTTON STATE
    // =====================================

    function setBusy(busy) {

        isBusy = busy;

        saveButton.disabled = busy;
        publishButton.disabled = busy;
        addFilesButton.disabled = busy;

        if (refreshButton) {
            refreshButton.disabled = busy;
        }

        if (managementList) {
            managementList.querySelectorAll("button")
                .forEach(button => {
                    button.disabled = busy;
                });
        }
    }


    // =====================================
    // RESET FORM
    // =====================================

    function resetEditor() {

        editingId = null;
        selectedFiles = [];

        AnnouncementView.resetAnnouncementForm();
        AnnouncementView.setDefaultAnnouncementDates();

        saveButton.textContent = "Save Draft";
        publishButton.textContent = "Publish Announcement";
    }


    // =====================================
    // SAVE OR UPDATE
    // =====================================

    async function processAnnouncement(status) {

        if (isBusy) return;

        const data = getAnnouncementData(status);
        const error = validateAnnouncement(data);

        if (error) {
            AnnouncementView.showAnnouncementMessage(
                error,
                true
            );
            return;
        }

        setBusy(true);

        try {

            let result;

            if (editingId !== null) {

                result = await AnnouncementModel.updateAnnouncement({
                    ...data,
                    announcement_id: editingId
                });

            } else {

                result = await AnnouncementModel.saveAnnouncement(data);
            }

            if (!page.isConnected) return;

            resetEditor();

            AnnouncementView.showAnnouncementMessage(
                result.message
            );

            await loadAnnouncements();

        } catch (error) {

            if (!page.isConnected) return;

            console.error(error);

            AnnouncementView.showAnnouncementMessage(
                error.message,
                true
            );

        } finally {

            if (page.isConnected) {
                setBusy(false);
            }
        }
    }


    // =====================================
    // LOAD MANAGEMENT LIST
    // =====================================

    async function loadAnnouncements() {

        if (!page.isConnected) return;

        try {

            const announcements =
                await AnnouncementModel.getAllAnnouncements();

            if (!page.isConnected) return;

            ManagementView.renderManagementList(
                announcements,
                {
                    onEdit: editAnnouncement,
                    onToggle: toggleAnnouncement,
                    onDelete: deleteAnnouncement
                }
            );

        } catch (error) {

            if (!page.isConnected) return;

            ManagementView.showManagementMessage(
                error.message,
                true
            );
        }
    }


    // =====================================
    // EDIT ANNOUNCEMENT
    // =====================================

    function editAnnouncement(announcement) {

        if (isBusy) return;

        editingId = Number(announcement.announcement_id);

        page.querySelector("#announcementTitle").value =
            announcement.title;

        page.querySelector("#announcementContents").value =
            announcement.contents || "";

        page.querySelector("#announcementImportant").checked =
            Number(announcement.is_important) === 1;

        page.querySelector("#announcementStartDate").value =
            announcement.start_date || "";

        page.querySelector("#announcementEndDate").value =
            announcement.end_date || "";

        selectedFiles = [];

        AnnouncementView.renderAnnouncementFiles(
            selectedFiles,
            removeFile
        );

        saveButton.textContent = "Save Changes";
        publishButton.textContent = "Publish Changes";

        AnnouncementView.showAnnouncementMessage(
            "Editing: " + announcement.title
        );

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    // =====================================
    // PUBLISH / UNPUBLISH
    // =====================================

    async function toggleAnnouncement(announcement) {

        if (isBusy) return;

        const isPublished =
            announcement.status === "published";

        const newStatus = isPublished
            ? "Draft"
            : "Published";

        const confirmed = window.confirm(
            isPublished
                ? `Unpublish "${announcement.title}"?`
                : `Publish "${announcement.title}"?`
        );

        if (!confirmed) return;

        const data = {
            announcement_id: Number(announcement.announcement_id),
            title: announcement.title,
            contents: announcement.contents || "",
            important: Number(announcement.is_important) === 1,
            startDate: announcement.start_date || "",
            endDate: announcement.end_date || "",
            attachments: [],
            status: newStatus
        };

        if (
            newStatus === "Published" &&
            (!data.contents || !data.startDate || !data.endDate)
        ) {
            ManagementView.showManagementMessage(
                "This draft needs contents and valid dates before publishing. Click Edit first.",
                true
            );
            return;
        }

        if (
            data.startDate &&
            data.endDate &&
            data.endDate < data.startDate
        ) {
            ManagementView.showManagementMessage(
                "Announcement dates are invalid. Edit them first.",
                true
            );
            return;
        }

        setBusy(true);

        try {

            const result =
                await AnnouncementModel.updateAnnouncement(data);

            if (!page.isConnected) return;

            ManagementView.showManagementMessage(
                isPublished
                    ? "Announcement unpublished successfully!"
                    : "Announcement published successfully!"
            );

            await loadAnnouncements();

        } catch (error) {

            if (!page.isConnected) return;

            ManagementView.showManagementMessage(
                error.message,
                true
            );

        } finally {

            if (page.isConnected) {
                setBusy(false);
            }
        }
    }


    // =====================================
    // DELETE ANNOUNCEMENT
    // =====================================

    async function deleteAnnouncement(announcement) {

        if (isBusy) return;

        const confirmed = window.confirm(
            `Permanently delete "${announcement.title}"?`
        );

        if (!confirmed) return;

        setBusy(true);

        try {

            const deletedId =
                Number(announcement.announcement_id);

            await AnnouncementModel.deleteAnnouncement(deletedId);

            if (!page.isConnected) return;

            // Do not keep editing a deleted record.
            if (editingId === deletedId) {
                resetEditor();
            }

            ManagementView.showManagementMessage(
                "Announcement deleted successfully!"
            );

            await loadAnnouncements();

        } catch (error) {

            if (!page.isConnected) return;

            ManagementView.showManagementMessage(
                error.message,
                true
            );

        } finally {

            if (page.isConnected) {
                setBusy(false);
            }
        }
    }


    // =====================================
    // EVENT LISTENERS
    // =====================================

    saveButton.addEventListener("click", () => {
        processAnnouncement("Draft");
    });

    form.addEventListener("submit", event => {

        event.preventDefault();

        processAnnouncement("Published");
    });

    if (refreshButton) {
        refreshButton.addEventListener("click", () => {
            if (!isBusy) {
                loadAnnouncements();
            }
        });
    }


    // =====================================
    // INITIALIZATION
    // =====================================

    AnnouncementView.setDefaultAnnouncementDates();

    loadAnnouncements();
}
