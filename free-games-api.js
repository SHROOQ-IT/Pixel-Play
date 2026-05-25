const FREE_GAMES_URL = "https://www.freetogame.com/api/games";

export async function fetchFreeGames() {
    try {
        const response = await fetch(FREE_GAMES_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch free games.");
        }

        const data = await response.json();

        return data.slice(0, 30).map((game) => ({
            id: `free-${game.id}`,
            title: game.title,
            genre: game.genre || "Free to Play",
            platform: game.platform || "PC",
            releaseDate: game.release_date || "Unknown",
            rating: "Free",
            ratingScore: 0,
            status: "Free",
            image: game.thumbnail,
            description: game.short_description || "Free-to-play game.",
            bestFor: "Players looking for free games",
            difficulty: "Easy",
            whyPlay: "A free-to-play game you can try without buying."
        }));

    } catch (error) {
        console.error("Free Games API Error:", error);
        return [];
    }
}