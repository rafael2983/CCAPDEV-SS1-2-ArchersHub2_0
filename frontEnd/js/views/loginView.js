
/* =========================================
   LOGIN VIEW
========================================= */

export function showLoginMessage(message, isError = true) {

    const messageElement =
        document.getElementById("loginMessage");

    if (!messageElement) return;

    messageElement.textContent = message;

    messageElement.style.color =
        isError ? "#c0392b" : "#007b35";

    messageElement.style.display = "block";
}


export function clearLoginMessage() {

    const messageElement =
        document.getElementById("loginMessage");

    if (!messageElement) return;

    messageElement.textContent = "";
    messageElement.style.display = "none";
}


export function setLoginLoading(isLoading) {

    const loginButton =
        document.querySelector("#loginForm .login-button");

    if (!loginButton) return;

    loginButton.disabled = isLoading;

    loginButton.textContent =
        isLoading ? "Signing in..." : "Login →";
}
