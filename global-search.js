import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchToggle = document.getElementById("user-search-toggle");
const searchModal = document.getElementById("user-search-modal");

const closeSearchBtn = document.getElementById("close-user-search");

const searchInput = document.getElementById("global-user-search-input");
const searchResults = document.getElementById("global-user-search-results");

let allPlayers = [];

searchToggle?.addEventListener("click", async () => {
    searchModal.classList.add("active");

    if (allPlayers.length === 0) {
        await loadPlayers();
    }
});

closeSearchBtn?.addEventListener("click", () => {
    searchModal.classList.remove("active");
});

searchModal?.addEventListener("click", (event) => {
    if (event.target === searchModal) {
        searchModal.classList.remove("active");
    }
});

searchInput?.addEventListener("input", () => {
    renderResults(searchInput.value.trim().toLowerCase());
});

async function loadPlayers() {
    const snapshot = await getDocs(collection(db, "users"));

    allPlayers = [];

    snapshot.forEach((item) => {
        allPlayers.push(item.data());
    });

    renderResults("");
}

function renderResults(searchText = "") {

    if (searchText.length < 2) {
        searchResults.innerHTML = `
            <p style="color:#aaa;"></p>
        `;
        return;
    }

    const filteredPlayers = allPlayers.filter((player) =>
        player.name?.toLowerCase().includes(searchText)
    );

    if (filteredPlayers.length === 0) {
        searchResults.innerHTML = `
            <p style="color:#aaa;">No players found.</p>
        `;
        return;
    }

    searchResults.innerHTML = "";

    filteredPlayers.forEach((player) => {
        searchResults.innerHTML += `
            <a href="profile.html?user=${player.userId}" class="global-search-user">
                <div class="global-search-avatar">🎮</div>

                <div>
                    <h3>${player.name}</h3>
                    <p>${player.bio || "PixelPlay Gamer"}</p>
                </div>
            </a>
        `;
    });
}