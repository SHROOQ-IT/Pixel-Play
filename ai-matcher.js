const aiMood = document.getElementById("ai-mood");
const aiMatchBtn = document.getElementById("ai-match-btn");
const aiResults = document.getElementById("ai-results");

const recommendations = {
    action: ["PUBG Mobile", "Fortnite", "Call of Duty: Warzone", "Valorant"],
    story: ["The Last of Us", "Elden Ring", "Genshin Impact"],
    creative: ["Minecraft", "Roblox"],
    competitive: ["Valorant", "PUBG Mobile", "Fortnite"],
    casual: ["Among Us", "Roblox", "Minecraft"]
};

aiMatchBtn.addEventListener("click", () => {
    const mood = aiMood.value;

    if (!mood) {
        showToast("Choose your gaming mood first.", "error");
        return;
    }

    const games = recommendations[mood];

    aiResults.innerHTML = `
        <h3>Recommended for you:</h3>
        <div class="ai-game-list">
            ${games.map(game => `<span>${game}</span>`).join("")}
        </div>
    `;

    showToast("AI recommendations ready! 🤖");
});