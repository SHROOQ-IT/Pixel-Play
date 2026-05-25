import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    query,
    where,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const playersList = document.getElementById("players-list");
const playerSearchInput = document.getElementById("player-search-input");

const followersCount = document.getElementById("followers-count");
const followingCount = document.getElementById("following-count");

const socialModal = document.getElementById("social-modal");
const socialModalList = document.getElementById("social-modal-list");
const socialModalTitle = document.getElementById("social-modal-title");
const closeSocialModal = document.getElementById("close-social-modal");

const followersStat = document.querySelector('[data-list="followers"]');
const followingStat = document.querySelector('[data-list="following"]');

let currentUser = null;
let allPlayers = [];

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (playersList) {
        await loadPlayers();
    }

    if (currentUser) {
        await updateSocialCounts();
    }
});

if (playerSearchInput) {
    playerSearchInput.addEventListener("input", () => {
        renderPlayers(playerSearchInput.value.trim().toLowerCase());
    });
}

followersStat?.addEventListener("click", async () => {
    await openSocialModal("followers");
});

followingStat?.addEventListener("click", async () => {
    await openSocialModal("following");
});

closeSocialModal?.addEventListener("click", () => {
    socialModal.classList.remove("active");
});

socialModal?.addEventListener("click", (e) => {
    if (e.target === socialModal) {
        socialModal.classList.remove("active");
    }
});

async function loadPlayers() {
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));

        allPlayers = [];

        usersSnapshot.forEach((item) => {
            const player = item.data();

            if (currentUser && player.userId === currentUser.uid) return;

            allPlayers.push(player);
        });

        renderPlayers("");

    } catch (error) {
        playersList.innerHTML = `<p style="color:#ff5c8a;">${error.message}</p>`;
    }
}

async function renderPlayers(searchText = "") {
    if (!playersList) return;

    const filteredPlayers = allPlayers.filter((player) =>
        player.name?.toLowerCase().includes(searchText)
    );

    if (filteredPlayers.length === 0) {
        playersList.innerHTML = `
            <div class="library-empty-state">
                <h2>No players found</h2>
                <p>Try searching another player name.</p>
            </div>
        `;
        return;
    }

    playersList.innerHTML = "";

    for (const player of filteredPlayers) {
        const isFollowing = currentUser
            ? await checkIfFollowing(player.userId)
            : false;

        playersList.innerHTML += `
            <div class="player-follow-card">

                <div class="player-follow-top">
                    <div class="player-follow-avatar">🎮</div>

                    <div>
                       <h3 class="clickable-player-name" onclick="location.href='profile.html?user=${player.userId}'">
    ${player.name}
</h3>
<p>${player.bio || "PixelPlay Gamer"}</p>
                    </div>
                </div>

                <button
                    class="follow-btn ${isFollowing ? "following" : ""}"
                    data-user="${player.userId}"
                >
                    ${isFollowing ? "Following" : "Follow"}
                </button>

            </div>
        `;
    }

    attachFollowEvents();
}

async function updateSocialCounts() {
    if (!currentUser) return;

    const followersQuery = query(
        collection(db, "following"),
        where("followingId", "==", currentUser.uid)
    );

    const followingQuery = query(
        collection(db, "following"),
        where("followerId", "==", currentUser.uid)
    );

    const followersSnapshot = await getDocs(followersQuery);
    const followingSnapshot = await getDocs(followingQuery);

    if (followersCount) {
        followersCount.textContent = followersSnapshot.size;
    }

    if (followingCount) {
        followingCount.textContent = followingSnapshot.size;
    }
}

async function openSocialModal(type) {
    if (!currentUser) return;

    socialModal.classList.add("active");

    socialModalTitle.textContent =
        type === "followers"
            ? "Followers"
            : "Following";

    socialModalList.innerHTML = `
        <p style="color:#aaa;">Loading...</p>
    `;

    let socialQuery;

    if (type === "followers") {
        socialQuery = query(
            collection(db, "following"),
            where("followingId", "==", currentUser.uid)
        );
    } else {
        socialQuery = query(
            collection(db, "following"),
            where("followerId", "==", currentUser.uid)
        );
    }

    const socialSnapshot = await getDocs(socialQuery);

    if (socialSnapshot.empty) {
        socialModalList.innerHTML = `
            <div class="following-empty">
                <p>No users found.</p>
            </div>
        `;
        return;
    }

    socialModalList.innerHTML = "";

    for (const item of socialSnapshot.docs) {
        const data = item.data();

        const targetId =
            type === "followers"
                ? data.followerId
                : data.followingId;

        const userDoc = await getDoc(doc(db, "users", targetId));

        if (!userDoc.exists()) continue;

        const player = userDoc.data();

        socialModalList.innerHTML += `
            <div class="following-user-card">
                <div class="following-avatar">🎮</div>

                <div>
                   <h3 class="clickable-player-name" onclick="location.href='profile.html?user=${player.userId}'">
    ${player.name}
</h3>
<p>${player.bio || "PixelPlay Gamer"}</p>
                </div>
            </div>
        `;
    }
}

async function checkIfFollowing(targetUserId) {
    if (!currentUser) return false;

    const followDoc = await getDoc(
        doc(db, "following", `${currentUser.uid}_${targetUserId}`)
    );

    return followDoc.exists();
}

function attachFollowEvents() {
    document.querySelectorAll(".follow-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const targetUserId = button.dataset.user;

            if (!currentUser) {
                window.location.href = "login.html";
                return;
            }

            if (button.classList.contains("following")) {
                await unfollowUser(targetUserId);
            } else {
                await followUser(targetUserId);
            }

            await updateSocialCounts();

            await renderPlayers(
                playerSearchInput?.value.trim().toLowerCase() || ""
            );
        });
    });
}

async function followUser(targetUserId) {
await setDoc(
    doc(db, "following", `${currentUser.uid}_${targetUserId}`),
    {
        followerId: currentUser.uid,
        followingId: targetUserId
    }
);

await addDoc(collection(db, "notifications"), {
    userId: targetUserId,
    type: "follow",
    fromUserId: currentUser.uid,
    fromUserName: currentUser.displayName || "Player",
    message: `${currentUser.displayName || "Player"} started following you.`,
    read: false,
    createdAt: serverTimestamp()
});
    showToast("Player followed ✓");
}

async function unfollowUser(targetUserId) {
    await deleteDoc(
        doc(db, "following", `${currentUser.uid}_${targetUserId}`)
    );

    showToast("Unfollowed player.");
}