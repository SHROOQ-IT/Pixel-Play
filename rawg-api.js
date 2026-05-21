const API_KEY = "ff8280bd443a4c748a254ef078122660";
const BASE_URL = "https://api.rawg.io/api";
const CACHE_KEY = "pixelplay-rawg-games";

async function fetchGames(endpoint) {
    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error("RAWG request failed");
    }

    const data = await response.json();
    return data.results || [];
}

export async function fetchPopularGames() {
    try {
        const popularPage1 = await fetchGames(
            `${BASE_URL}/games?key=${API_KEY}&page_size=40&page=1&ordering=-rating`
        );

        const popularPage2 = await fetchGames(
            `${BASE_URL}/games?key=${API_KEY}&page_size=40&page=2&ordering=-rating`
        );

        const popularPage3 = await fetchGames(
            `${BASE_URL}/games?key=${API_KEY}&page_size=40&page=3&ordering=-rating`
        );

        const mobileGames = await fetchGames(
            `${BASE_URL}/games?key=${API_KEY}&page_size=40&parent_platforms=4,8&ordering=-rating`
        );

        const allGames = [
            ...popularPage1,
            ...popularPage2,
            ...popularPage3,
            ...mobileGames
        ];

        const uniqueGames = allGames.filter(
            (game, index, self) =>
                index === self.findIndex((item) => item.id === game.id)
        );

        localStorage.setItem(CACHE_KEY, JSON.stringify(uniqueGames));

        return uniqueGames;

    } catch (error) {
        console.error("RAWG API Error:", error);

        const cachedGames = localStorage.getItem(CACHE_KEY);

        if (cachedGames) {
            return JSON.parse(cachedGames);
        }

        return [];
    }
}
export async function fetchUpcomingGames() {

    try {

        const response = await fetch(
            `${BASE_URL}/games?key=${API_KEY}&dates=2026-01-01,2027-12-31&ordering=released&page_size=12`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch upcoming games.");
        }

        const data = await response.json();

        return data.results || [];

    } catch (error) {

        console.error("Upcoming Games Error:", error);

        return [];
    }
}