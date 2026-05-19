import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const welcomeUser = document.getElementById("welcome-user");
const userEmail = document.getElementById("user-email");
const wishlistCount = document.getElementById("wishlist-count");
const reviewsCount = document.getElementById("reviews-count");
const averageRating = document.getElementById("average-rating");
const profileBadge = document.getElementById("profile-badge");
const myReviewsList = document.getElementById("my-reviews-list");
const logoutBtn = document.getElementById("logout-btn");

function hideEmail(email) {
    const emailParts = email.split("@");
    const namePart = emailParts[0];
    const domainPart = emailParts[1];

    const visiblePart = namePart.substring(0, 5);

    return `${visiblePart}****@${domainPart}`;
}

function createStars(rating) {
    const fullStars = "★".repeat(Number(rating));
    const emptyStars = "☆".repeat(5 - Number(rating));

    return fullStars + emptyStars;
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userName = user.displayName || "Player";

    welcomeUser.textContent = `👋 Welcome, ${userName}`;
    userEmail.textContent = hideEmail(user.email);

    const wishlistQuery = query(
        collection(db, "wishlists"),
        where("userId", "==", user.uid)
    );

    const wishlistSnapshot = await getDocs(wishlistQuery);
    wishlistCount.textContent = wishlistSnapshot.size;

    const reviewsQuery = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid)
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);
    reviewsCount.textContent = reviewsSnapshot.size;

    let totalRating = 0;

    if (reviewsSnapshot.empty) {
        averageRating.textContent = "0.0";

        myReviewsList.innerHTML = `
            <div class="review-card">
                <div class="review-text">
                    You have not written any reviews yet.
                </div>
            </div>
        `;
    } else {
        myReviewsList.innerHTML = "";

        reviewsSnapshot.forEach((item) => {
            const review = item.data();
            totalRating += Number(review.rating);

            myReviewsList.innerHTML += `
                <div class="review-card">
                    <div class="review-stars">${createStars(review.rating)}</div>
                    <div class="review-user">${review.gameTitle}</div>
                    <div class="review-text">${review.text}</div>
                </div>
            `;
        });

        const avg = totalRating / reviewsSnapshot.size;
        averageRating.textContent = avg.toFixed(1);
    }

    if (wishlistSnapshot.size >= 5 || reviewsSnapshot.size >= 3) {
        profileBadge.textContent = "Badge: Active Gamer";
    } else {
        profileBadge.textContent = "Badge: PixelPlay Gamer";
    }
});

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});