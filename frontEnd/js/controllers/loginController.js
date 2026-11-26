
/* =========================================
   LOGIN CONTROLLER
========================================= */

import { loginUser }
    from "../models/loginModel.js";

import {
    showLoginMessage,
    clearLoginMessage,
    setLoginLoading
} from "../views/loginView.js";


export function initializeLogin() {

    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearLoginMessage();

        const schoolId =
            document.getElementById("studentID").value.trim();

        const password =
            document.getElementById("password").value;

        if (!schoolId || !password) {

            showLoginMessage(
                "Please enter your school ID and password."
            );

            return;
        }

        setLoginLoading(true);

        try {

            const result = await loginUser(
                schoolId,
                password
            );

            if (result.success) {

                // Temporary confirmation before dashboard
                console.log(
                    "Authenticated user:",
                    result.user
                );

                // Redirect to existing dashboard
                window.location.href = "home.html";

            }

        } catch (error) {

            showLoginMessage(error.message);

        } finally {

            setLoginLoading(false);

        }

    });

}
