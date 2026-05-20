import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const playersCount = document.getElementById("players-count");

async function loadPlayersCount() {
    if (!playersCount) return;

    try {
        const snapshot = await getDocs(collection(db, "users"));
        playersCount.textContent = snapshot.size;
    } catch (error) {
        playersCount.textContent = "0";
    }
}

loadPlayersCount();