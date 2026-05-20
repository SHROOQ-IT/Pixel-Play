import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerEmailInput = document.getElementById("register-email");
const registerPasswordInput = document.getElementById("register-password");

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");

const showLoginBtn = document.getElementById("show-login");
const showRegisterBtn = document.getElementById("show-register");
const loginFormBox = document.getElementById("login-form-box");
const registerFormBox = document.getElementById("register-form-box");

const message = document.getElementById("auth-message");
const authCard = document.getElementById("auth-card");
const loggedCard = document.getElementById("logged-card");
const loggedTitle = document.getElementById("logged-title");
const loggedEmail = document.getElementById("logged-email");

function hideEmail(email) {
    const emailParts = email.split("@");
    return `${emailParts[0].substring(0, 5)}****@${emailParts[1]}`;
}

function isStrongPassword(password) {
    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return strongPasswordPattern.test(password);
}

async function saveUserToFirestore(user, name) {
    await setDoc(doc(db, "users", user.uid), {
        userId: user.uid,
        name: name || user.displayName || user.email.split("@")[0],
        email: user.email,
        createdAt: serverTimestamp()
    }, { merge: true });
}

showLoginBtn.addEventListener("click", () => {
    loginFormBox.style.display = "block";
    registerFormBox.style.display = "none";

    showLoginBtn.classList.add("active");
    showRegisterBtn.classList.remove("active");
});

showRegisterBtn.addEventListener("click", () => {
    loginFormBox.style.display = "none";
    registerFormBox.style.display = "block";

    showRegisterBtn.classList.add("active");
    showLoginBtn.classList.remove("active");
});

registerBtn.addEventListener("click", async () => {
    const name = usernameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;

    if (!name || !email || !password) {
        showToast("Please fill in all fields.", "error");
        return;
    }

    if (!isStrongPassword(password)) {
        showToast("Password must include uppercase, lowercase, number, and symbol.", "error");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
            displayName: name
        });

        await saveUserToFirestore(userCredential.user, name);

        try {
            await sendEmailVerification(userCredential.user);
            showToast("Account created! Verification email sent. ✉️");
        } catch {
            showToast("Account created, but verification email could not be sent.");
        }

        showLoginBtn.click();

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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        await saveUserToFirestore(
            userCredential.user,
            userCredential.user.displayName || email.split("@")[0]
        );

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
        authCard.style.display = "grid";
        loggedCard.style.display = "none";
        message.textContent = "";
    }
});