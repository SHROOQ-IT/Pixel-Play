import { games } from "./games-data.js";

const gameTableBody = document.getElementById("games-table-body");
const comingSoonContainer = document.getElementById("coming-soon-games");

const searchInput = document.getElementById("search-input");
const genreFilter = document.getElementById("genre-filter");
const platformFilter = document.getElementById("platform-filter");
const sortFilter = document.getElementById("sort-filter");

const gameModal = document.getElementById("game-modal");
const closeModal = document.querySelector(".close-modal");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalGenre = document.getElementById("modal-genre");
const modalPlatform = document.getElementById("modal-platform");
const modalRating = document.getElementById("modal-rating");
const modalWishlistBtn = document.getElementById("modal-wishlist-btn");

let selectedGame = null;

function renderGames(filteredGames = games) {
    gameTableBody.innerHTML = "";
    comingSoonContainer.innerHTML = "";

    filteredGames.forEach((game) => {
        if (game.status === "Coming Soon") {
            comingSoonContainer.innerHTML += `
                <div class="game-card">
                    <img src="${game.image}" alt="${game.title}">
                    <h3>${game.title}</h3>
                    <p class="release-date">Release: ${game.releaseDate}</p>
                    <p style="padding: 0 1rem 1rem; color:#ccc;">${game.genre} • ${game.platform}</p>
                    <button class="details-btn" onclick="openGameDetails('${game.id}')">View Details</button>
                    <button class="wishlist-btn" onclick="addToWishlist(this)">+ Wishlist</button>
                </div>
            `;
        } else {
            gameTableBody.innerHTML += `
                <tr>
                    <td data-label="Game Title">${game.title}</td>
                    <td data-label="Genre">${game.genre}</td>
                    <td data-label="Platform">${game.platform}</td>
                    <td data-label="Release Date">${game.releaseDate}</td>
                    <td data-label="Rating">${game.rating}</td>
                    <td data-label="Status"><span class="status-badge">${game.status}</span></td>
                    <td data-label="Action">
                        <button class="details-btn" onclick="openGameDetails('${game.id}')">View Details</button>
                        <button class="wishlist-btn" onclick="addToWishlist(this)">+ Wishlist</button>
                    </td>
                </tr>
            `;
        }
    });
}

function filterGames() {
    const searchText = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;
    const selectedPlatform = platformFilter.value;
    const selectedSort = sortFilter.value;

    let filteredGames = games.filter((game) => {
        const matchesSearch = game.title.toLowerCase().includes(searchText);
        const matchesGenre = selectedGenre === "all" || game.genre === selectedGenre;
        const matchesPlatform = selectedPlatform === "all" || game.platform.includes(selectedPlatform);

        return matchesSearch && matchesGenre && matchesPlatform;
    });

    if (selectedSort === "rating-high") {
        filteredGames.sort((a, b) => b.ratingScore - a.ratingScore);
    }

    if (selectedSort === "newest") {
        filteredGames.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    }

    if (selectedSort === "az") {
        filteredGames.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderGames(filteredGames);
}

window.openGameDetails = async function (gameId) {
    selectedGame = games.find((item) => item.id === gameId);

    modalImage.src = selectedGame.image;
    modalTitle.textContent = selectedGame.title;
    modalDescription.textContent = selectedGame.description;
    modalGenre.textContent = selectedGame.genre;
    modalPlatform.textContent = selectedGame.platform;
    modalRating.textContent = selectedGame.rating;

    window.setReviewGame(selectedGame.title);

    modalWishlistBtn.textContent = "+ Add to Wishlist";
    modalWishlistBtn.disabled = false;

    if (window.checkIfGameSaved) {
        const saved = await window.checkIfGameSaved(selectedGame.title);

        if (saved) {
            modalWishlistBtn.textContent = "Already Added";
            modalWishlistBtn.disabled = true;
        }
    }

    gameModal.style.display = "flex";
};

modalWishlistBtn.addEventListener("click", async () => {
    if (!selectedGame) return;

    const fakeButton = document.createElement("button");
    fakeButton.innerHTML = `
        <h3>${selectedGame.title}</h3>
        <p class="release-date">Release: ${selectedGame.releaseDate}</p>
    `;

    fakeButton.closest = () => fakeButton;

    await window.addToWishlist(fakeButton);

    modalWishlistBtn.textContent = fakeButton.textContent || "Added ✓";
    modalWishlistBtn.disabled = true;
});

closeModal.addEventListener("click", () => {
    gameModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === gameModal) {
        gameModal.style.display = "none";
    }
});

searchInput.addEventListener("input", filterGames);
genreFilter.addEventListener("change", filterGames);
platformFilter.addEventListener("change", filterGames);
sortFilter.addEventListener("change", filterGames);

renderGames();