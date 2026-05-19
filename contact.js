import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const contactForm = document.getElementById("contact-form");

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const subject = document.getElementById("contact-subject").value;
    const message = document.getElementById("contact-message").value.trim();

    if (!name || !email || !subject || !message) {
        showToast("Please fill in all fields.", "error");
        return;
    }

    try {
        await addDoc(collection(db, "contactMessages"), {
            name: name,
            email: email,
            subject: subject,
            message: message,
            createdAt: serverTimestamp()
        });

        showToast("Message sent successfully! 💚");
        contactForm.reset();

    } catch (error) {
        showToast(error.message, "error");
    }
});