
import { initializeAddDrop }
    from "./controllers/addDropController.js";


function initializeApp() {
    initializeAddDrop();
}


if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", initializeApp);

} else {

    initializeApp();

}
