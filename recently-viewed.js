const recentlyViewedContainer = document.getElementById("recently-viewed-container");

function loadRecentlyViewed() {
    if (!recentlyViewedContainer) return;

    const viewedGames =
        JSON.parse(localStorage.getItem("recentlyViewedGames")) || [];

    if (viewedGames.length === 0) {
        recentlyViewedContainer.innerHTML = `
            <p style="color:#aaa;">
                No recently viewed games yet.
            </p>
        `;
        return;
    }

    recentlyViewedContainer.innerHTML = "";

    viewedGames.forEach((game) => {
        recentlyViewedContainer.innerHTML += `
            <div class="home-game-card">
                <img src="${game.image}" alt="${game.title}">
                <h3>${game.title}</h3>
                <p>${game.genre}</p>
            </div>
        `;
    });
}

loadRecentlyViewed();