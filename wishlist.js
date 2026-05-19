import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (currentUser) {
        setTimeout(markSavedGames, 300);
    }
});

async function isGameSaved(gameTitle) {
    if (!currentUser) return false;

    const q = query(
        collection(db, "wishlists"),
        where("userId", "==", currentUser.uid),
        where("gameTitle", "==", gameTitle)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

function getGameInfoFromButton(button) {
    const gameCard = button.closest(".game-card");

    if (gameCard) {
        return {
            title: gameCard.querySelector("h3").textContent,
            releaseDate: gameCard.querySelector(".release-date").textContent
        };
    }

    const tableRow = button.closest("tr");

    if (tableRow) {
        return {
            title: tableRow.querySelector('[data-label="Game Title"]').textContent,
            releaseDate: tableRow.querySelector('[data-label="Release Date"]').textContent
        };
    }

    return null;
}

async function markSavedGames() {
    const buttons = document.querySelectorAll(".wishlist-btn");

    for (const button of buttons) {
        const gameInfo = getGameInfoFromButton(button);
        if (!gameInfo) continue;

        const saved = await isGameSaved(gameInfo.title);

        if (saved) {
            button.textContent = "Already Added";
            button.disabled = true;
        }
    }
}

window.checkIfGameSaved = async function (gameTitle) {
    return await isGameSaved(gameTitle);
};

window.addToWishlist = async function (button) {
    if (!currentUser) {
        const goLogin = confirm(
            "You need an account to save games to your library. Do you want to login or register now?"
        );

        if (goLogin) {
            window.location.href = "login.html";
        }

        return;
    }

    const gameInfo = getGameInfoFromButton(button);

    if (!gameInfo) {
        showToast("Could not find game information.", "error");
        return;
    }

    const saved = await isGameSaved(gameInfo.title);

    if (saved) {
        button.textContent = "Already Added";
        button.disabled = true;
        return;
    }

    try {
        await addDoc(collection(db, "wishlists"), {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            gameTitle: gameInfo.title,
            releaseDate: gameInfo.releaseDate,
            createdAt: serverTimestamp()
        });

        button.textContent = "Added ✓";
        button.disabled = true;

        showToast("Game added to your library! 🎮");

    } catch (error) {
        showToast(error.message, "error");
    }
};