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

const statusOptions = [
    "Want to Play",
    "Playing",
    "Completed",
    "On Hold",
    "Dropped"
];

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (currentUser) {
        setTimeout(markSavedGames, 500);
    }
});

async function isGameInLibrary(gameTitle) {
    if (!currentUser) return false;

    const q = query(
        collection(db, "libraries"),
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
            title: gameCard.querySelector("h3")?.textContent?.trim(),
            releaseDate:
                gameCard.querySelector(".release-date")?.textContent?.trim() ||
                "Unknown"
        };
    }

    const tableRow = button.closest("tr");

    if (tableRow) {
        return {
            title:
                tableRow.querySelector('[data-label="Game Title"]')?.textContent?.trim(),
            releaseDate:
                tableRow.querySelector('[data-label="Release Date"]')?.textContent?.trim() ||
                "Unknown"
        };
    }

    return null;
}

async function markSavedGames() {
    const buttons = document.querySelectorAll(".wishlist-btn");

    for (const button of buttons) {
        const gameInfo = getGameInfoFromButton(button);
        if (!gameInfo || !gameInfo.title) continue;

        const saved = await isGameInLibrary(gameInfo.title);

        if (saved) {
            button.textContent = "In Library";
            button.disabled = true;
        } else {
            button.textContent = "+ Add to Library";
        }
    }
}

function openLibraryStatusPicker(gameInfo, button) {
    const oldModal = document.getElementById("library-status-modal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "library-status-modal";
    modal.className = "library-status-modal";

    modal.innerHTML = `
        <div class="library-status-box">
            <button class="library-modal-close" id="close-library-modal">×</button>

            <span class="section-kicker">ADD TO LIBRARY</span>

            <h2>${gameInfo.title}</h2>

            <p>Choose where this game belongs in your library.</p>

            <div class="library-status-options">
                ${statusOptions.map((status) => `
                    <button class="library-status-choice" data-status="${status}">
                        ${status}
                    </button>
                `).join("")}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("close-library-modal").addEventListener("click", () => {
        modal.remove();
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });

    document.querySelectorAll(".library-status-choice").forEach((choice) => {
        choice.addEventListener("click", async () => {
            const selectedStatus = choice.dataset.status;

            await saveGameToLibrary(gameInfo, selectedStatus, button);

            modal.remove();
        });
    });
}

async function saveGameToLibrary(gameInfo, status, button) {
    try {
        await addDoc(collection(db, "libraries"), {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            gameTitle: gameInfo.title,
            releaseDate: gameInfo.releaseDate,
            status: status,
            createdAt: serverTimestamp()
        });

        button.textContent = "In Library";
        button.disabled = true;

        showToast(`Added to Library: ${status} 🎮`);

    } catch (error) {
        showToast(error.message, "error");
    }
}

window.checkIfGameSaved = async function (gameTitle) {
    return await isGameInLibrary(gameTitle);
};

window.addToWishlist = async function (button) {
    if (!currentUser) {
        const goLogin = confirm(
            "You need an account to add games to your library. Do you want to sign in now?"
        );

        if (goLogin) {
            window.location.href = "login.html";
        }

        return;
    }

    const gameInfo = getGameInfoFromButton(button);

    if (!gameInfo || !gameInfo.title) {
        showToast("Could not find game information.", "error");
        return;
    }

    const saved = await isGameInLibrary(gameInfo.title);

    if (saved) {
        button.textContent = "In Library";
        button.disabled = true;
        return;
    }

    openLibraryStatusPicker(gameInfo, button);
};
window.addSelectedGameToLibrary = async function (game) {
    if (!currentUser) {
        const goLogin = confirm(
            "You need an account to add games to your library. Do you want to sign in now?"
        );

        if (goLogin) {
            window.location.href = "login.html";
        }

        return;
    }

    if (!game || !game.title) {
        showToast("Could not find game information.", "error");
        return;
    }

    const gameInfo = {
        title: game.title,
        releaseDate: game.releaseDate || "Unknown"
    };

    const saved = await isGameInLibrary(gameInfo.title);

    if (saved) {
        showToast("This game is already in your library.", "error");
        return;
    }

    openLibraryStatusPicker(gameInfo, {
        textContent: "",
        disabled: false
    });
};