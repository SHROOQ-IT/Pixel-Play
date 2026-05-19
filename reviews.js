import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;
let currentGameTitle = null;

const reviewRating = document.getElementById("review-rating");
const reviewText = document.getElementById("review-text");
const submitReviewBtn = document.getElementById("submit-review-btn");
const reviewsList = document.getElementById("reviews-list");

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

window.setReviewGame = function (gameTitle) {
    currentGameTitle = gameTitle;
    loadReviews(gameTitle);
};

submitReviewBtn.addEventListener("click", async () => {
    if (!currentUser) {
        const goLogin = confirm(
            "You need an account to write a review. Do you want to login or register now?"
        );

        if (goLogin) {
            window.location.href = "login.html";
        }

        return;
    }

    if (!currentGameTitle) return;

    const text = reviewText.value.trim();

    if (text === "") {
        showToast("Please write a review first.", "error");
        return;
    }

    try {
        await addDoc(collection(db, "reviews"), {
            gameTitle: currentGameTitle,
            userId: currentUser.uid,
            userName: currentUser.displayName || "Player",
            rating: reviewRating.value,
            text: text,
            createdAt: serverTimestamp()
        });

        showToast("Review shared successfully! ⭐");
        reviewText.value = "";
        loadReviews(currentGameTitle);

    } catch (error) {
        showToast(error.message, "error");
    }
});

async function loadReviews(gameTitle) {
    const q = query(
        collection(db, "reviews"),
        where("gameTitle", "==", gameTitle)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        reviewsList.innerHTML = `<p style="color:#ccc;">No reviews yet.</p>`;
        return;
    }

    reviewsList.innerHTML = "";

    snapshot.forEach((doc) => {
        const review = doc.data();
        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

        reviewsList.innerHTML += `
            <div class="review-card">
                <div class="review-stars">${stars}</div>
                <div class="review-user">${review.userName}</div>
                <div class="review-text">${review.text}</div>
            </div>
        `;
    });
}