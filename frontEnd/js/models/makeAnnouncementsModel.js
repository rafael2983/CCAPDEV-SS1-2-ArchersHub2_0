
/* =========================================
   MAKE ANNOUNCEMENTS MODEL
   MariaDB via PHP API
========================================= */

const API_URL = "../public/api/announcements.php";


// Retrieve CSRF token from PHP session
async function getCsrfToken() {

    const response = await fetch(
        "../public/api/session.php",
        {
            credentials: "same-origin",
            cache: "no-store"
        }
    );

    const result = await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.csrf_token
    ) {
        throw new Error(
            "Unable to verify session. Please log in again."
        );
    }

    return result.csrf_token;
}


// =====================================
// SAVE DRAFT OR PUBLISH
// =====================================

export async function saveAnnouncement(announcement) {

    const csrfToken = await getCsrfToken();

    const response = await fetch(API_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify(announcement)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to save announcement."
        );
    }

    return result;
}


// =====================================
// GET CURRENTLY VISIBLE ANNOUNCEMENTS
// =====================================

export async function getPublishedAnnouncements() {

    const response = await fetch(API_URL, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store"
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to load announcements."
        );
    }

    return result.announcements;
}


// =========================================
// ADMIN: GET ALL ANNOUNCEMENTS
// =========================================

export async function getAllAnnouncements() {

    const response = await fetch(
        `${API_URL}?scope=manage`,
        {
            credentials: "same-origin",
            cache: "no-store"
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
            "Unable to load announcements."
        );
    }

    return result.announcements;
}


// =========================================
// ADMIN: UPDATE ANNOUNCEMENT
// =========================================

export async function updateAnnouncement(announcement) {

    const csrfToken = await getCsrfToken();

    const response = await fetch(API_URL, {
        method: "PUT",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify(announcement)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
            "Unable to update announcement."
        );
    }

    return result;
}


// =========================================
// ADMIN: DELETE ANNOUNCEMENT
// =========================================

export async function deleteAnnouncement(announcementId) {

    const csrfToken = await getCsrfToken();

    const response = await fetch(API_URL, {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({
            announcement_id: announcementId
        })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
            "Unable to delete announcement."
        );
    }

    return result;
}
