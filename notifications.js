import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const openNotificationsBtn = document.getElementById("open-notifications");
const notificationsModal = document.getElementById("notifications-modal");
const closeNotificationsModal = document.getElementById("close-notifications-modal");

const notificationsList = document.getElementById("notifications-list");
const notificationBadge = document.getElementById("notification-badge");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (currentUser) {
        await loadNotifications();
    }
});

openNotificationsBtn?.addEventListener("click", async () => {
    notificationsModal.classList.add("active");

    await markNotificationsAsRead();
});

closeNotificationsModal?.addEventListener("click", () => {
    notificationsModal.classList.remove("active");
});

notificationsModal?.addEventListener("click", (event) => {
    if (event.target === notificationsModal) {
        notificationsModal.classList.remove("active");
    }
});

async function loadNotifications() {
    if (!currentUser) return;

    const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(notificationsQuery);

    const notifications = [];

    snapshot.forEach((item) => {
        notifications.push({
            id: item.id,
            ...item.data()
        });
    });

    notifications.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;

        return bTime - aTime;
    });

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    if (notificationBadge) {
        notificationBadge.textContent = unreadCount;

        if (unreadCount === 0) {
            notificationBadge.style.display = "none";
        } else {
            notificationBadge.style.display = "flex";
        }
    }

    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="following-empty">
                <p>No notifications yet.</p>
            </div>
        `;
        return;
    }

    notificationsList.innerHTML = "";

    notifications.forEach((notification) => {
        notificationsList.innerHTML += `
            <div class="notification-card ${notification.read ? "" : "unread"}">
                <strong>${notification.fromUserName}</strong>
                <p>${notification.message}</p>
            </div>
        `;
    });
}

async function markNotificationsAsRead() {
    if (!currentUser) return;

    const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(notificationsQuery);

    const unreadDocs = snapshot.docs.filter(
        (item) => item.data().read === false
    );

    for (const item of unreadDocs) {
        await updateDoc(
            doc(db, "notifications", item.id),
            {
                read: true
            }
        );
    }

    if (notificationBadge) {
        notificationBadge.style.display = "none";
    }

    loadNotifications();
}