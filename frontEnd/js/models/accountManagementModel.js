
/* =========================================
   ACCOUNT MANAGEMENT MODEL
   MariaDB-backed accounts
========================================= */

const API_URL = "../public/api/accounts.php";


// Get CSRF token from authenticated session
async function getCsrfToken() {

    const response = await fetch(
        "../public/api/session.php",
        {
            credentials: "same-origin",
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Session expired. Please log in again."
        );
    }

    const result = await response.json();

    if (!result.success || !result.csrf_token) {
        throw new Error(
            "Unable to obtain a security token."
        );
    }

    return result.csrf_token;
}


// Retrieve accounts
export async function getAccounts() {

    const response = await fetch(API_URL, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store"
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to load accounts."
        );
    }

    return result.accounts;
}


// Find account in the loaded list
export function getAccountByID(accounts, id) {

    return accounts.find(
        account => account.id === id
    ) || null;
}


// Create a new database account
export async function createAccount(account) {

    const csrfToken = await getCsrfToken();

    const response = await fetch(API_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify(account)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to create account."
        );
    }

    return result;
}


/* =========================================
   UPDATE EXISTING ACCOUNT
========================================= */

export async function updateAccount(originalID, account) {

    const csrfToken = await getCsrfToken();

    const response = await fetch(API_URL, {
        method: "PUT",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({
            ...account,
            originalID
        })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to update account."
        );
    }

    return result;
}
