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

const hubForm = document.getElementById("hub-form");
const hubTitle = document.getElementById("hub-title");
const hubCategory = document.getElementById("hub-category");
const hubContent = document.getElementById("hub-content");
const hubPostsList = document.getElementById("hub-posts-list");

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    loadHubPosts();
});

hubForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
        const goLogin = confirm("You need an account to publish a Hub post. Do you want to login or register now?");

        if (goLogin) {
            window.location.href = "login.html";
        }

        return;
    }

    try {
        await addDoc(collection(db, "hubPosts"), {
            title: hubTitle.value.trim(),
            category: hubCategory.value,
            content: hubContent.value.trim(),
            userId: currentUser.uid,
            userName: currentUser.displayName || "Player",
            createdAt: serverTimestamp()
        });

        showToast("Your Hub post has been published! 🚀");
        hubForm.reset();
        loadHubPosts();

    } catch (error) {
        showToast(error.message, "error");
    }
});

async function loadHubPosts() {
    const q = query(
        collection(db, "hubPosts"),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        hubPostsList.innerHTML = `<p style="color:#ccc;">No Hub posts yet.</p>`;
        return;
    }

    hubPostsList.innerHTML = "";

    snapshot.forEach((item) => {
        const post = item.data();
        const isOwner = currentUser && currentUser.uid === post.userId;

        hubPostsList.innerHTML += `
            <div class="hub-post-card">
                <div class="hub-post-top">
                    <span>${post.category}</span>
                    <small>By ${post.userName}</small>
                </div>

                <h3>${post.title}</h3>
                <p>${post.content}</p>

                ${
                    isOwner
                        ? `<button class="delete-tip-btn" onclick="deleteHubPost('${item.id}')">Delete</button>`
                        : ""
                }
            </div>
        `;
    });
}

window.deleteHubPost = async function (postId) {
    const confirmDelete = confirm("Are you sure you want to delete this Hub post?");

    if (!confirmDelete) return;

    try {
        await deleteDoc(doc(db, "hubPosts", postId));
        showToast("Hub post deleted successfully.");
        loadHubPosts();

    } catch (error) {
        showToast(error.message, "error");
    }
};