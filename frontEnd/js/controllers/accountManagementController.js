
/* =========================================
   ACCOUNT MANAGEMENT CONTROLLER
   Create and Edit MariaDB Accounts
========================================= */

import * as Model from "../models/accountManagementModel.js";
import * as View from "../views/accountManagementView.js";


export async function initializeAccountManagement() {

    const page = document.querySelector(
        ".account-management-page"
    );

    if (!page) return;

    let selectedAccountID = null;
    let accounts = [];
    let isSaving = false;
    let isLoaded = false;

    const form = page.querySelector("#accountManagementForm");
    const newAccountButton = page.querySelector("#newAccountButton");
    const submitButton = page.querySelector("#accountSubmitButton");
    const passwordInput = page.querySelector("#accountPassword");

    if (
        !form ||
        !newAccountButton ||
        !submitButton ||
        !passwordInput
    ) {
        console.error("Account Management form is incomplete.");
        return;
    }


    // =====================================
    // RENDER ACCOUNTS
    // =====================================

    function refreshAccounts() {

        if (!page.isConnected) return;

        View.renderAccountList(
            accounts,
            selectedAccountID,
            selectAccount
        );
    }


    // =====================================
    // SELECT EXISTING ACCOUNT
    // =====================================

    function selectAccount(accountID) {

        if (isSaving || !isLoaded) return;

        const account = Model.getAccountByID(
            accounts,
            accountID
        );

        if (!account) return;

        selectedAccountID = accountID;

        View.populateAccountForm(account);
        View.setAccountFormMode(true);

        // Password changes are not part of editing.
        passwordInput.value = "";
        passwordInput.disabled = true;
        passwordInput.required = false;

        submitButton.disabled = false;

        View.showAccountMessage("");

        refreshAccounts();
    }


    // =====================================
    // NEW ACCOUNT MODE
    // =====================================

    function resetToNewAccount() {

        if (isSaving || !isLoaded) return;

        selectedAccountID = null;

        View.clearAccountForm();
        View.setAccountFormMode(false);

        passwordInput.disabled = false;
        passwordInput.required = true;
        passwordInput.value = "";

        submitButton.disabled = false;

        View.showAccountMessage("");

        refreshAccounts();
    }


    // =====================================
    // READ FORM DATA
    // =====================================

    function getFormData() {

        return {
            id: page.querySelector("#accountID").value.trim(),

            surname: page.querySelector(
                "#accountSurname"
            ).value.trim(),

            middleName: page.querySelector(
                "#accountMiddleName"
            ).value.trim(),

            firstName: page.querySelector(
                "#accountFirstName"
            ).value.trim(),

            email: page.querySelector(
                "#accountEmail"
            ).value.trim(),

            type: page.querySelector("#accountType").value,

            status: page.querySelector("#accountStatus").value
        };
    }


    // =====================================
    // CREATE OR UPDATE ACCOUNT
    // =====================================

    form.addEventListener("submit", async event => {

        event.preventDefault();

        if (isSaving || !isLoaded) return;

        const accountData = getFormData();

        if (!/^[A-Za-z0-9]{8}$/.test(accountData.id)) {

            View.showAccountMessage(
                "School ID must contain exactly 8 letters or numbers.",
                true
            );

            return;
        }

        const isEditing = selectedAccountID !== null;

        if (!isEditing) {

            accountData.password = passwordInput.value;

            if (accountData.password.length < 12) {

                View.showAccountMessage(
                    "Password must contain at least 12 characters.",
                    true
                );

                return;
            }
        }

        isSaving = true;

        const originalID = selectedAccountID;

        submitButton.disabled = true;
        newAccountButton.disabled = true;

        submitButton.textContent =
            isEditing ? "Saving..." : "Creating...";

        try {

            let result;

            if (isEditing) {

                result = await Model.updateAccount(
                    originalID,
                    accountData
                );

            } else {

                result = await Model.createAccount(
                    accountData
                );
            }

            // Reload accounts directly from MariaDB.
            accounts = await Model.getAccounts();

            if (!page.isConnected) return;

            isSaving = false;

            selectedAccountID = null;

            View.clearAccountForm();
            View.setAccountFormMode(false);

            passwordInput.disabled = false;
            passwordInput.required = true;
            passwordInput.value = "";

            refreshAccounts();

            View.showAccountMessage(result.message);

        } catch (error) {

            if (!page.isConnected) return;

            console.error(
                "Account Management error:",
                error
            );

            View.showAccountMessage(
                error.message,
                true
            );

        } finally {

            isSaving = false;

            if (page.isConnected) {

                newAccountButton.disabled = false;
                submitButton.disabled = !isLoaded;

                submitButton.textContent =
                    selectedAccountID
                        ? "Save Changes"
                        : "Create";
            }
        }
    });


    // =====================================
    // NEW ACCOUNT BUTTON
    // =====================================

    newAccountButton.addEventListener(
        "click",
        resetToNewAccount
    );


    // =====================================
    // PLACEHOLDER RECORD BUTTONS
    // =====================================

    page.querySelectorAll("[data-record]").forEach(
        button => {

            button.addEventListener("click", () => {

                if (!selectedAccountID) {

                    View.showAccountMessage(
                        "Select an account first.",
                        true
                    );

                    return;
                }

                View.showAccountMessage(
                    `${button.dataset.record} records for ` +
                    `${selectedAccountID} will be implemented later.`
                );
            });
        }
    );


    // =====================================
    // INITIAL DATABASE LOAD
    // =====================================

    View.clearAccountForm();

    submitButton.disabled = true;
    newAccountButton.disabled = true;

    View.showAccountMessage(
        "Loading accounts from MariaDB..."
    );

    try {

        accounts = await Model.getAccounts();

        if (!page.isConnected) return;

        isLoaded = true;

        newAccountButton.disabled = false;

        resetToNewAccount();

        View.showAccountMessage(
            `${accounts.length} accounts loaded from MariaDB.`
        );

    } catch (error) {

        if (!page.isConnected) return;

        console.error(error);

        View.showAccountMessage(
            error.message,
            true
        );
    }
}
