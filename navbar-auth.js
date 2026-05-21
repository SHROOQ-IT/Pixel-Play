import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const authLink = document.getElementById("auth-link");

onAuthStateChanged(auth, (user) => {

    if (!authLink) return;

    if (user) {

        const savedImage =
            localStorage.getItem(
                `pixelplay-profile-image-${user.uid}`
            );

        if (savedImage) {

            authLink.innerHTML = `
                <img
                    src="${savedImage}"
                    alt="Profile"
                    class="nav-profile-avatar"
                >
            `;

        } else {

            const firstLetter =
                user.displayName
                    ?.charAt(0)
                    .toUpperCase() ||

                user.email
                    ?.charAt(0)
                    .toUpperCase() ||

                "P";

            authLink.innerHTML = `
                <div class="nav-profile-avatar default-avatar">
                    ${firstLetter}
                </div>
            `;
        }

        authLink.href = "account.html";

    } else {

        authLink.textContent = "Sign In";

        authLink.href = "login.html";

        authLink.setAttribute("data-en", "Sign In");
        authLink.setAttribute("data-ar", "تسجيل الدخول");
    }
});