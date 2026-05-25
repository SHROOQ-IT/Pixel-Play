function toggleTips(category) {
    const content = document.getElementById(`${category}-tips`);
    if (!content) return;

    const header = content.previousElementSibling;
    const icon = header ? header.querySelector(".toggle-icon") : null;

    content.classList.toggle("active");

    if (icon) {
        icon.textContent = content.classList.contains("active") ? "−" : "+";
    }
}

function searchTips() {
    const searchInput = document.getElementById("tip-search");
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase();
    const tips = document.querySelectorAll(".tip-content li");

    tips.forEach((tip) => {
        const text = tip.textContent.toLowerCase();

        if (searchTerm && !text.includes(searchTerm)) {
            tip.style.display = "none";
        } else {
            tip.style.display = "list-item";
        }
    });
}

function filterTeam(role) {
    const members = document.querySelectorAll(".member-card");
    const tabs = document.querySelectorAll(".role-tab");

    tabs.forEach((tab) => {
        tab.classList.remove("active");

        if (tab.textContent.toLowerCase().includes(role)) {
            tab.classList.add("active");
        } else if (role === "all" && tab.textContent === "All Members") {
            tab.classList.add("active");
        }
    });

    members.forEach((member) => {
        if (role === "all") {
            member.style.display = "block";
        } else {
            const memberRole = member.getAttribute("data-role");
            member.style.display = memberRole === role ? "block" : "none";
        }
    });

    const teamMembers = document.getElementById("team-members");

    if (teamMembers) {
        teamMembers.scrollIntoView({
            behavior: "smooth"
        });
    }
}

window.showToast = function (message, type = "success") {
    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
};
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

}
const searchToggle = document.getElementById("user-search-toggle");
const searchModal = document.getElementById("user-search-modal");

searchToggle?.addEventListener("click", () => {
    searchModal?.classList.toggle("active");
});