import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    orderBy
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

    const reviews = [];

    snapshot.forEach((reviewDoc) => {
        reviews.push({
            id: reviewDoc.id,
            ...reviewDoc.data()
        });
    });

    reviews.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
    });

    for (const review of reviews) {
        const stars = "★".repeat(Number(review.rating)) + "☆".repeat(5 - Number(review.rating));
        const replies = await loadReplies(review.id);

        reviewsList.innerHTML += `
            <div class="review-card" data-review-id="${review.id}">
                <div class="review-stars">${stars}</div>
                <div class="review-user">${review.userName}</div>
                <div class="review-text">${review.text}</div>

                <div class="review-replies">
                    ${renderReplies(replies)}
                </div>

                <div class="reply-box">
                    <input type="text" class="reply-input" placeholder="Write a reply...">
                    <button class="reply-btn"
                            data-review-id="${review.id}"
                            data-review-owner="${review.userId}"
                            data-game-title="${review.gameTitle}">
                        Reply
                    </button>
                </div>
            </div>
        `;
    }

    attachReplyEvents();
}

async function loadReplies(reviewId) {
    const repliesQuery = query(
        collection(db, "reviewReplies"),
        where("reviewId", "==", reviewId)
    );

    const repliesSnapshot = await getDocs(repliesQuery);

    const replies = [];

    repliesSnapshot.forEach((replyDoc) => {
        replies.push({
            id: replyDoc.id,
            ...replyDoc.data()
        });
    });

    replies.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime;
    });

    return replies;
}

function renderReplies(replies) {
    if (replies.length === 0) return "";

    return replies.map((reply) => `
        <div class="single-reply">
            <strong>${reply.userName}</strong>
            <p>${reply.text}</p>
        </div>
    `).join("");
}

function attachReplyEvents() {
    document.querySelectorAll(".reply-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            if (!currentUser) {
                const goLogin = confirm(
                    "You need an account to reply. Do you want to login now?"
                );

                if (goLogin) {
                    window.location.href = "login.html";
                }

                return;
            }

            const reviewCard = button.closest(".review-card");
            const replyInput = reviewCard.querySelector(".reply-input");
            const replyText = replyInput.value.trim();

            if (!replyText) {
                showToast("Please write a reply first.", "error");
                return;
            }

            const reviewId = button.dataset.reviewId;
            const reviewOwnerId = button.dataset.reviewOwner;
            const gameTitle = button.dataset.gameTitle;

            try {
                await addDoc(collection(db, "reviewReplies"), {
                    reviewId: reviewId,
                    reviewOwnerId: reviewOwnerId,
                    gameTitle: gameTitle,
                    userId: currentUser.uid,
                    userName: currentUser.displayName || "Player",
                    text: replyText,
                    createdAt: serverTimestamp()
                });

                if (reviewOwnerId !== currentUser.uid) {
                    await addDoc(collection(db, "notifications"), {
                        userId: reviewOwnerId,
                        type: "reply",
                        fromUserId: currentUser.uid,
                        fromUserName: currentUser.displayName || "Player",
                        message: `${currentUser.displayName || "Player"} replied to your review on ${gameTitle}`,
                        read: false,
                        createdAt: serverTimestamp()
                    });
                }

                showToast("Reply added ✓");
                replyInput.value = "";
                loadReviews(currentGameTitle);

            } catch (error) {
                showToast(error.message, "error");
            }
        });
    });
}