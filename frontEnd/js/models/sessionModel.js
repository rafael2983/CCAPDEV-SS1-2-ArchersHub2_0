
/* =========================================
   SESSION MODEL
   Communicates with PHP authentication API
========================================= */

const API_BASE = "../public/api";


export async function getCurrentSession() {

    const response = await fetch(
        `${API_BASE}/session.php`,
        {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        }
    );

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            "Unable to verify your login session."
        );
    }

    const result = await response.json();

    if (!result.success || !result.user) {
        throw new Error("Invalid session response.");
    }

    return result.user;
}


export async function logoutUser() {

    const response = await fetch(
        `${API_BASE}/logout.php`,
        {
            method: "POST",
            credentials: "same-origin"
        }
    );

    if (!response.ok) {
        throw new Error("Logout failed.");
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(
            result.message || "Logout failed."
        );
    }

    return result;
}
