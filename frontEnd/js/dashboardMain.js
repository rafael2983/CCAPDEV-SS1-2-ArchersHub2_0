
/* =========================================
   ARCHERSHUB DASHBOARD ENTRY POINT
========================================= */

import {
    initializeDashboard
} from "./controllers/dashboardController.js";

import {
    getCurrentSession
} from "./models/sessionModel.js";


async function initializeApp() {

    try {

        // Ask PHP who is currently logged in
        const user = await getCurrentSession();

        // No authenticated session
        if (!user) {

            window.location.replace("index.html");
            return;

        }

        // Initialize dashboard with authenticated user
        initializeDashboard(user);

    } catch (error) {

        console.error(
            "Dashboard authentication error:",
            error
        );

        // Do not initialize the dashboard if
        // session verification fails.
        const container =
            document.getElementById("pageContent");

        if (container) {
            container.textContent =
                "Unable to verify your session. Please refresh and try again.";
        }

    }

}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}
