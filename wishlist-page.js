import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const message = document.getElementById("auth-message");

const authCard = document.getElementById("auth-card");
const loggedCard = document.getElementById("logged-card");
const loggedTitle = document.getElementById("logged-title");
const loggedEmail = document.getElementById("logged-email");

function hideEmail(email) {
    const emailParts = email.split("@");
    return `${emailParts[0].substring(0, 5)}****@${emailParts[1]}`;
}

registerBtn.addEventListener("click", async () => {
    const name = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !email || !password) {
        showToast("Please fill in all fields.", "error");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
            displayName: name
        });

        showToast("Account created successfully! 🎮");
        setTimeout(() => {
            location.reload();
        }, 800);

    } catch (error) {
        showToast(error.message, "error");
    }
});

loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showToast("Please enter your email and password.", "error");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);

        showToast("Logged in successfully! 💚");
        setTimeout(() => {
            location.reload();
        }, 800);

    } catch (error) {
        showToast(error.message, "error");
    }
});

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    showToast("Logged out successfully.");
    setTimeout(() => {
        location.reload();
    }, 800);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userName = user.displayName || user.email.split("@")[0];

        authCard.style.display = "none";
        loggedCard.style.display = "block";

        loggedTitle.textContent = `👋 Welcome back, ${userName}`;
        loggedEmail.textContent = hideEmail(user.email);
    } else {
        authCard.style.display = "block";
        loggedCard.style.display = "none";
        message.textContent = "";
    }
});