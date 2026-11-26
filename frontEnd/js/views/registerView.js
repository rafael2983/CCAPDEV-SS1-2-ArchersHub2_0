const byId = id => document.getElementById(id);
export function readForm() {
    return { school_id: byId("schoolId").value.trim(), first_name: byId("firstName").value.trim(), middle_name: byId("middleName").value.trim(), last_name: byId("lastName").value.trim(), email: byId("email").value.trim().toLowerCase(), password: byId("password").value, confirm_password: byId("confirmPassword").value, program_id: Number(byId("program").value) };
}
export function renderPrograms(programs) {
    const select = byId("program");
    select.replaceChildren(new Option("Select your program", ""));
    for (const program of programs) select.add(new Option(`${program.program_code} - ${program.program_name}`, String(program.program_id)));
    select.disabled = false;
}
export function showMessage(message, success = false) {
    const element = byId("registerMessage");
    element.textContent = message;
    element.classList.toggle("success", success);
    element.hidden = !message;
}
export function setLoading(loading, completed = false) {
    for (const field of byId("registerForm").elements) field.disabled = loading || completed;
    const button = byId("registerButton");
    button.textContent = completed ? "Account created" : loading ? "Creating account..." : "Create Student Account →";
}
export function togglePasswords(visible) {
    for (const id of ["password", "confirmPassword"]) byId(id).type = visible ? "text" : "password";
}
