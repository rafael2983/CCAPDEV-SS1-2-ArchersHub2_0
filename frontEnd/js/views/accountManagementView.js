
/* =========================================
   ACCOUNT MANAGEMENT VIEW
========================================= */

// Build display name
function getDisplayName(account) {

    return [
        account.firstName,
        account.middleName,
        account.surname
    ].filter(Boolean).join(" ");
}


// Render existing accounts
export function renderAccountList(accounts, selectedID, onSelect) {

    const container = document.getElementById("accountList");
    const count = document.getElementById("accountCount");

    count.textContent = `${accounts.length} accounts`;

    container.replaceChildren();

    accounts.forEach(account => {

        const card = document.createElement("button");

        card.type = "button";
        card.className = "account-item";

        if (account.id === selectedID) {
            card.classList.add("selected");
        }

        const name = getDisplayName(account);

        const initials = name
            .split(" ")
            .filter(Boolean)
            .map(word => word.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase();

        const avatar = document.createElement("span");
        avatar.className = "account-avatar";
        avatar.textContent = initials;

        const info = document.createElement("span");
        info.className = "account-item-info";

        const nameElement = document.createElement("strong");
        nameElement.textContent = name;

        const idElement = document.createElement("small");
        idElement.textContent = account.id;

        info.append(nameElement, idElement);

        const badges = document.createElement("span");
        badges.className = "account-badges";

        const typeBadge = document.createElement("span");
        typeBadge.className = "account-type-badge";
        typeBadge.textContent = account.type;

        const statusBadge = document.createElement("span");
        statusBadge.className =
            `account-status-badge ${account.status.toLowerCase()}`;

        statusBadge.textContent = account.status;

        badges.append(typeBadge, statusBadge);

        card.append(avatar, info, badges);

        card.addEventListener("click", () => onSelect(account.id));

        container.appendChild(card);
    });
}


// Populate form with selected account
export function populateAccountForm(account) {

    document.getElementById("accountID").value =
        account.id;

    document.getElementById("accountSurname").value =
        account.surname;

    document.getElementById("accountMiddleName").value =
        account.middleName;

    document.getElementById("accountFirstName").value =
        account.firstName;

    document.getElementById("accountEmail").value =
        account.email;

    document.getElementById("accountType").value =
        account.type;

    document.getElementById("accountStatus").value =
        account.status;
}


// Clear form
export function clearAccountForm() {

    document.getElementById(
        "accountManagementForm"
    ).reset();
}


// Change submit button label
export function setAccountFormMode(isEditing) {

    document.getElementById(
        "accountSubmitButton"
    ).textContent = isEditing ? "Save Changes" : "Create";
}


// Display feedback
export function showAccountMessage(message, isError = false) {

    const element = document.getElementById(
        "accountFormMessage"
    );

    element.textContent = message;

    element.classList.toggle("error", isError);
}
