
/* =========================================
   LOGIN MODEL
   Communicates with PHP backend
========================================= */

export async function loginUser(schoolId, password) {

    const response = await fetch(
        "../public/api/login.php",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "same-origin",

            body: JSON.stringify({
                school_id: schoolId,
                password: password
            })
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Login failed."
        );
    }

    return result;
}
