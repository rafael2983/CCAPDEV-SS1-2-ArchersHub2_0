const API_URL = "../public/api/register.php";
async function request(options = {}) {
    const response = await fetch(API_URL, {credentials:"same-origin", cache:"no-store", ...options});
    let data;
    try { data = await response.json(); } catch { throw new Error("Unexpected server response. Please try again or check whether your account was created."); }
    if (!response.ok || !data.success) throw new Error(data.message || "Registration request failed.");
    return data;
}
export async function loadPrograms() { return (await request()).programs; }
export async function registerStudent(student) {
    return request({method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(student)});
}
