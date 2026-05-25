import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
const profileUserId = params.get("user");

const playerName = document.getElementById("public-player-name");
const playerBio = document.getElementById("public-player-bio");
const followBtn = document.getElementById("public-follow-btn");

const libraryCount = document.getElementById("public-library-count");
const reviewsCount = document.getElementById("public-reviews-count");
const followersCount = document.getElementById("public-followers-count");

const libraryList = document.getElementById("public-library-list");
const reviewsList = document.getElementById("public-reviews-list");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!profileUserId) {
        showProfileError("Player profile not found.");
        return;
    }

    await loadPublicProfile();
});

async function loadPublicProfile() {
    const userDoc = await getDoc(doc(db, "users", profileUserId));

    if (!userDoc.exists()) {
        showProfileError("Player profile not found.");
        return;
    }

    const player = userDoc.data();
   const profilePrivacy = player.profilePrivacy || "public";
if (profilePrivacy === "private") {

    if (!currentUser || currentUser.uid !== profileUserId) {

        playerName.textContent = player.name || "Player";
        playerBio.textContent = "This profile is private.";

        libraryList.innerHTML = `
            <div class="library-empty-state">
                <h2>Private Profile</h2>
                <p>This player's library is hidden.</p>
            </div>
        `;

        reviewsList.innerHTML = "";

        followBtn.style.display = "none";

        return;
    }
}

    playerName.textContent = player.name || "Player";
    playerBio.textContent = player.bio || "PixelPlay Gamer";

    await loadPublicStats();
    await loadPublicLibrary();
    await loadPublicReviews();
    await setupFollowButton();
}

async function loadPublicStats() {
    const libraryQuery = query(
        collection(db, "libraries"),
        where("userId", "==", profileUserId)
    );

    const reviewsQuery = query(
        collection(db, "reviews"),
        where("userId", "==", profileUserId)
    );

    const followersQuery = query(
        collection(db, "following"),
        where("followingId", "==", profileUserId)
    );

    const librarySnapshot = await getDocs(libraryQuery);
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const followersSnapshot = await getDocs(followersQuery);

    libraryCount.textContent = librarySnapshot.size;
    reviewsCount.textContent = reviewsSnapshot.size;
    followersCount.textContent = followersSnapshot.size;
}

async function loadPublicLibrary() {
    const libraryQuery = query(
        collection(db, "libraries"),
        where("userId", "==", profileUserId)
    );

    const snapshot = await getDocs(libraryQuery);

    if (snapshot.empty) {
        libraryList.innerHTML = `<p style="color:#aaa;">No games in this library yet.</p>`;
        return;
    }

    libraryList.innerHTML = "";

    snapshot.forEach((item) => {
        const game = item.data();

        libraryList.innerHTML += `
            <div class="library-game-card">
                <div class="library-game-info">
                    <span class="library-status-pill">${game.status || "Want to Play"}</span>
                    <h3>${game.gameTitle}</h3>
                    <p>${game.releaseDate || "Unknown release date"}</p>
                </div>
            </div>
        `;
    });
}

async function loadPublicReviews() {
    const reviewsQuery = query(
        collection(db, "reviews"),
        where("userId", "==", profileUserId)
    );

    const snapshot = await getDocs(reviewsQuery);

    if (snapshot.empty) {
        reviewsList.innerHTML = `<p style="color:#aaa;">No reviews yet.</p>`;
        return;
    }

    reviewsList.innerHTML = "";

    snapshot.forEach((item) => {
        const review = item.data();
        const stars = "★".repeat(Number(review.rating)) + "☆".repeat(5 - Number(review.rating));

        reviewsList.innerHTML += `
            <div class="review-card">
                <div class="review-stars">${stars}</div>
                <div class="review-user">${review.gameTitle}</div>
                <div class="review-text">${review.text}</div>
            </div>
        `;
    });
}

async function setupFollowButton() {
    if (!currentUser) {
        followBtn.textContent = "Sign In to Follow";
        followBtn.onclick = () => {
            window.location.href = "login.html";
        };
        return;
    }

    if (currentUser.uid === profileUserId) {
        followBtn.textContent = "Your Profile";
        followBtn.disabled = true;
        return;
    }

    const followId = `${currentUser.uid}_${profileUserId}`;
    const followDoc = await getDoc(doc(db, "following", followId));

    if (followDoc.exists()) {
        followBtn.textContent = "Following";
        followBtn.classList.add("following");
    } else {
        followBtn.textContent = "Follow";
        followBtn.classList.remove("following");
    }

    followBtn.onclick = async () => {
        const latestFollowDoc = await getDoc(doc(db, "following", followId));

        if (latestFollowDoc.exists()) {
            await deleteDoc(doc(db, "following", followId));
            showToast("Unfollowed player.");
        } else {
            await setDoc(doc(db, "following", followId), {
                followerId: currentUser.uid,
                followingId: profileUserId
            });
            showToast("Player followed ✓");
        }

        await loadPublicStats();
        await setupFollowButton();
    };
}

function showProfileError(message) {
    playerName.textContent = "Profile unavailable";
    playerBio.textContent = message;
    libraryList.innerHTML = "";
    reviewsList.innerHTML = "";
}