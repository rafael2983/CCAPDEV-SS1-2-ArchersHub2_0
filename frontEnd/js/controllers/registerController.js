import * as Model from "../models/registerModel.js";
import * as View from "../views/registerView.js";
export async function initializeRegistration() {
    const form = document.getElementById("registerForm");
    const button = document.getElementById("registerButton");
    let busy = false, ready = false, completed = false;
    document.getElementById("showPassword").addEventListener("change", event => View.togglePasswords(event.target.checked));
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (busy || !ready || completed) return;
        View.showMessage("");
        const data = View.readForm();
        if (!data.first_name || !data.last_name || !/^[0-9]{8}$/.test(data.school_id)) return View.showMessage("Enter your name and valid 8-digit student ID.");
        if (!/^[^\s@]+@dlsu\.edu\.ph$/i.test(data.email)) return View.showMessage("Only @dlsu.edu.ph email addresses are accepted.");
        if (Array.from(data.password).length < 8 || new TextEncoder().encode(data.password).length > 72 || data.password.includes("\0")) return View.showMessage("Use at least 8 characters and at most 72 password bytes.");
        if (data.password !== data.confirm_password) return View.showMessage("Passwords do not match.");
        if (!Number.isSafeInteger(data.program_id) || data.program_id < 1) return View.showMessage("Please select an academic program.");
        busy = true;
        View.setLoading(true);
        try {
            const result = await Model.registerStudent(data);
            completed = true;
            form.reset();
            View.togglePasswords(false);
            View.showMessage(result.message, true);
        } catch (error) {
            View.showMessage(error.message || "Registration failed. If the connection was interrupted, try logging in before retrying.");
        } finally {
            busy = false;
            View.setLoading(false, completed);
        }
    });
    try {
        const programs = await Model.loadPrograms();
        if (!Array.isArray(programs) || !programs.length) throw new Error("No academic programs are available.");
        View.renderPrograms(programs);
        ready = true;
        button.disabled = false;
    } catch (error) {
        View.showMessage(`${error.message} Reload this page to retry.`);
    }
}
