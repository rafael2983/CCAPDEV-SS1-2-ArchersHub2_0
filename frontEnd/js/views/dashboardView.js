
/* =========================================
   DASHBOARD VIEW
========================================= */

// Render student information
export function renderStudent(student) {

    document.getElementById("studentName").textContent =
        student.name;

    document.getElementById("studentID").textContent =
        student.id;

    document.getElementById("currentRole").textContent =
        student.role;

}

// Update the role displayed in the header
export function renderRole(roleName) {

    const roleLabel = document.getElementById("currentRole");

    if (roleLabel) {
        roleLabel.textContent = roleName;
    }

}


// Render sidebar navigation
export function renderNavigation(navigation) {

    const sidebar = document.getElementById("sidebarNavigation");

    sidebar.innerHTML = "";

    navigation.forEach((item, index) => {

        const button = document.createElement("button");

        button.className = "nav-item";

        button.textContent = item;

        button.dataset.page = item;

        // Home is selected by default
        if (index === 0) {
            button.classList.add("active");
        }

        sidebar.appendChild(button);

    });

}


// Update active sidebar item
export function setActiveNavigation(selectedButton) {

    const buttons = document.querySelectorAll(".nav-item");

    buttons.forEach(button => {
        button.classList.remove("active");
    });

    selectedButton.classList.add("active");

}


// Display temporary notification
export function showNotice(message) {

    // Remove existing notification
    const existingNotice = document.querySelector(".dashboard-notice");

    if (existingNotice) {
        existingNotice.remove();
    }

    const notice = document.createElement("div");

    notice.className = "dashboard-notice";
    notice.textContent = message;

    document.body.appendChild(notice);

    setTimeout(() => {
        notice.remove();
    }, 2500);

}


/* =========================================
   DYNAMIC PAGE RENDERING
========================================= */

// Display a selected page inside the dashboard
export function renderPage(pageName) {

    const container = document.getElementById("pageContent");

    let templateId;

    switch (pageName) {

        case "Home":
            templateId = "homeTemplate";
            break;

        case "Add / Drop":
            templateId = "addDropTemplate";
            break;

        case "Special Class":
            templateId = "specialClassTemplate";
            break;

        case "Course Withdrawal":
            templateId = "courseWithdrawalTemplate";
            break;

        case "Program Exchange":
            templateId = "programExchangeTemplate";
            break;

        case "Curriculum Progression":
            templateId = "curriculumProgressionTemplate";
            break;

        case "View Schedule":
            templateId = "viewScheduleTemplate";
            break;

        case "View Records":
            templateId = "viewRecordsTemplate";
            break;

        case "Enlistment":
            templateId = "enlistmentTemplate";
            break;

        case "University Calendar":
            templateId = "universityCalendarTemplate";
            break;

        case "Grade Encoding":
            templateId = "gradeEncodingTemplate";
            break;

        case "View Application":
            templateId = "viewApplicationTemplate";
            break;

        case "Account Management":
            templateId = "accountManagementTemplate";
            break;

        case "Make Announcements":
            templateId = "makeAnnouncementsTemplate";
            break;

        default:
            renderPlaceholder(pageName);
            return;
    }

    const template = document.getElementById(templateId);

    if (!template) {
        console.error("Template not found:", templateId);
        return;
    }

    // Replace only the central content
    container.replaceChildren(
        template.content.cloneNode(true)
    );

}


// Display a placeholder for unfinished pages
export function renderPlaceholder(pageName) {

    const container = document.getElementById("pageContent");

    container.replaceChildren();

    const section = document.createElement("section");
    section.className = "dashboard-content";

    const heading = document.createElement("h1");
    heading.className = "page-title";
    heading.textContent = pageName;

    const message = document.createElement("p");
    message.textContent =
        "This section of ArchersHub is currently under development.";

    message.style.marginTop = "20px";

    section.append(heading, message);
    container.appendChild(section);

}
