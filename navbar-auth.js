import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const authLink = document.getElementById("auth-link");

onAuthStateChanged(auth, (user) => {
    if (!authLink) return;

    if (user) {
        const userName = user.displayName || user.email.split("@")[0];

        authLink.textContent = `👤 ${userName}`;
        authLink.href = "account.html";

        authLink.setAttribute("data-en", `👤 ${userName}`);
        authLink.setAttribute("data-ar", `👤 ${userName}`);
    } else {
        authLink.textContent = "Sign In";
        authLink.href = "login.html";

        authLink.setAttribute("data-en", "Sign In");
        authLink.setAttribute("data-ar", "تسجيل الدخول");
    }
});