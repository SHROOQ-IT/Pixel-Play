import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    query,
    orderBy,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;

const tipForm = document.getElementById("tip-form");
const tipGame = document.getElementById("tip-game");
const tipCategory = document.getElementById("tip-category");
const tipContent = document.getElementById("tip-content");
const communityTipsList = document.getElementById("community-tips-list");

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    loadCommunityTips();
});

tipForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
        const goLogin = confirm("You need an account to share a tip. Do you want to login or register now?");
        if (goLogin) window.location.href = "login.html";
        return;
    }

    try {
        await addDoc(collection(db, "tips"), {
            game: tipGame.value.trim(),
            category: tipCategory.value,
            content: tipContent.value.trim(),
            userId: currentUser.uid,
            userName: currentUser.displayName || "Player",
            createdAt: serverTimestamp()
        });

        showToast("Your tip has been shared successfully! 🎮");
        tipForm.reset();
        loadCommunityTips();

    } catch (error) {
        showToast(error.message, "error");
    }
});

async function loadCommunityTips() {
    const q = query(collection(db, "tips"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        communityTipsList.innerHTML = `<p style="color:#ccc;">No community tips yet.</p>`;
        return;
    }

    communityTipsList.innerHTML = "";

    snapshot.forEach((item) => {
        const tip = item.data();
        const isOwner = currentUser && currentUser.uid === tip.userId;

        communityTipsList.innerHTML += `
            <div class="community-tip-card">
                <div class="community-tip-header">
                    <span>${tip.game}</span>
                    <span>${tip.category}</span>
                </div>

                <p>${tip.content}</p>

                <div class="community-tip-user">
                    Shared by ${tip.userName}
                </div>

                ${
                    isOwner
                        ? `<button class="delete-tip-btn" onclick="deleteTip('${item.id}')">Delete</button>`
                        : ""
                }
            </div>
        `;
    });
}

window.deleteTip = async function (tipId) {
    const confirmDelete = confirm("Are you sure you want to delete this tip?");
    if (!confirmDelete) return;

    try {
        await deleteDoc(doc(db, "tips", tipId));
        showToast("Tip deleted successfully.");
        loadCommunityTips();
    } catch (error) {
        showToast(error.message, "error");
    }
};