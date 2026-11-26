
import { initializePhotoCarousel }
    from "./controllers/photoController.js";

import { initializeLogin }
    from "./controllers/loginController.js";


// Initialize frontend components
function initializeApp() {

    initializePhotoCarousel();

    initializeLogin();

}


// Wait until HTML is ready
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}
