import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const newsletterForm = document.getElementById("newsletter-form");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = newsletterForm.querySelector("input[type='email']");
        const email = emailInput.value.trim();

        if (!email) {
            showToast("Please enter your email.", "error");
            return;
        }

        try {
            await addDoc(collection(db, "subscribers"), {
                email: email,
                createdAt: serverTimestamp()
            });

            showToast("You joined PixelPlay Community successfully! 🎮");
            newsletterForm.reset();

        } catch (error) {
            showToast(error.message, "error");
        }
    });
}