import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const libraryContainer = document.getElementById("wishlist-container");
const libraryTabs = document.querySelectorAll(".library-tab");

let currentUser = null;
let allLibraryGames = [];
let activeStatus = "all";

const statusOptions = [
    "Want to Play",
    "Playing",
    "Completed",
    "On Hold",
    "Dropped"
];

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        libraryContainer.innerHTML = `
            <div class="library-empty-state">
                <h2>Sign in to view your library</h2>
                <p>Your saved games and progress will appear here.</p>
                <button class="cta-button" onclick="location.href='login.html'">
                    Sign In
                </button>
            </div>
        `;
        return;
    }

    currentUser = user;
    await loadLibrary();
});

async function loadLibrary() {
    try {
        const q = query(
            collection(db, "libraries"),
            where("userId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);

        allLibraryGames = [];

        querySnapshot.forEach((item) => {
            allLibraryGames.push({
                id: item.id,
                ...item.data()
            });
        });

        allLibraryGames.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
        });

        renderLibrary();

    } catch (error) {
        libraryContainer.innerHTML = `
            <div class="library-empty-state">
                <h2>Could not load your library</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function renderLibrary() {
    const filteredGames =
        activeStatus === "all"
            ? allLibraryGames
            : allLibraryGames.filter((game) => game.status === activeStatus);

    if (filteredGames.length === 0) {
        libraryContainer.innerHTML = `
            <div class="library-empty-state">
                <h2>No games here yet</h2>
                <p>Add games from the catalog and track your progress.</p>
                <button class="cta-button" onclick="location.href='games.html'">
                    Explore Games
                </button>
            </div>
        `;
        return;
    }

    libraryContainer.innerHTML = "";

    filteredGames.forEach((game) => {
        const gameStatus = game.status || "Want to Play";

        libraryContainer.innerHTML += `
            <div class="library-game-card">
                <div class="library-game-info">
                    <span class="library-status-pill">${gameStatus}</span>
                    <h3>${game.gameTitle}</h3>
                    <p>${game.releaseDate || "Unknown release date"}</p>
                </div>

                <div class="library-game-actions">
                    <select class="library-status-select" data-id="${game.id}">
                        ${statusOptions
                            .map((status) => `
                                <option value="${status}" ${status === gameStatus ? "selected" : ""}>
                                    ${status}
                                </option>
                            `)
                            .join("")}
                    </select>

                    <button class="library-remove-btn" data-id="${game.id}">
                        Remove
                    </button>
                </div>
            </div>
        `;
    });

    attachLibraryEvents();
}

function attachLibraryEvents() {
    document.querySelectorAll(".library-status-select").forEach((select) => {
        select.addEventListener("change", async () => {
            await updateGameStatus(select.dataset.id, select.value);
        });
    });

    document.querySelectorAll(".library-remove-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            await removeGame(button.dataset.id);
        });
    });
}

async function updateGameStatus(gameId, newStatus) {
    try {
        await updateDoc(doc(db, "libraries", gameId), {
            status: newStatus
        });

        allLibraryGames = allLibraryGames.map((game) =>
            game.id === gameId ? { ...game, status: newStatus } : game
        );

        showToast("Library status updated ✓");
        renderLibrary();

    } catch (error) {
        showToast(error.message, "error");
    }
}

async function removeGame(gameId) {
    try {
        await deleteDoc(doc(db, "libraries", gameId));

        allLibraryGames = allLibraryGames.filter((game) => game.id !== gameId);

        showToast("Game removed from library.");
        renderLibrary();

    } catch (error) {
        showToast(error.message, "error");
    }
}

libraryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        libraryTabs.forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");

        activeStatus = tab.dataset.status;
        renderLibrary();
    });
});