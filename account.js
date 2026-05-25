import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const welcomeUser = document.getElementById("welcome-user");
const userEmail = document.getElementById("user-email");
const wishlistCount = document.getElementById("wishlist-count");
const reviewsCount = document.getElementById("reviews-count");
const profileBadge = document.getElementById("profile-badge");
const myReviewsList = document.getElementById("my-reviews-list");
const logoutBtn = document.getElementById("logout-btn");

const displayNameInput = document.getElementById("display-name-input");
const profileImageInput = document.getElementById("profile-image-input");
const saveProfileBtn = document.getElementById("save-profile-btn");
const profilePrivacySelect = document.getElementById("profile-privacy-select");
const profilePhoto = document.getElementById("profile-photo");
const defaultAvatar = document.getElementById("default-avatar");
const profilePhotoWrapper = document.querySelector(".profile-photo-wrapper");

let currentUser = null;

function updateWelcomeName(name) {
    const currentLang = localStorage.getItem("pixelplay-lang") || "en";

    welcomeUser.textContent =
        currentLang === "ar"
            ? `مرحبًا ${name}`
            : `Welcome ${name}`;
}

function hideEmail(email) {
    const emailParts = email.split("@");
    const namePart = emailParts[0];
    const domainPart = emailParts[1];
    const visiblePart = namePart.substring(0, 5);

    return `${visiblePart}****@${domainPart}`;
}

function createStars(rating) {
    const fullStars = "★".repeat(Number(rating));
    const emptyStars = "☆".repeat(5 - Number(rating));

    return fullStars + emptyStars;
}

function getProfileImageKey(userId) {
    return `pixelplay-profile-image-${userId}`;
}

function loadProfileImage(userId) {
    const savedImage = localStorage.getItem(getProfileImageKey(userId));

    if (savedImage) {
        profilePhoto.src = savedImage;
        profilePhoto.style.display = "block";
        defaultAvatar.style.display = "none";
    } else {
        profilePhoto.style.display = "none";
        defaultAvatar.style.display = "flex";
    }
}

function saveProfileImage(userId, file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            localStorage.setItem(getProfileImageKey(userId), reader.result);
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject("Could not upload profile image.");
        };

        reader.readAsDataURL(file);
    });
}

profilePhotoWrapper.addEventListener("click", () => {
    profileImageInput.click();
});

profileImageInput.addEventListener("change", async () => {
    if (!currentUser) return;

    const selectedImage = profileImageInput.files[0];

    if (!selectedImage) return;

    try {
        const imageUrl = await saveProfileImage(currentUser.uid, selectedImage);

        profilePhoto.src = imageUrl;
        profilePhoto.style.display = "block";
        defaultAvatar.style.display = "none";

        showToast("Profile picture updated! 👤");

    } catch (error) {
        showToast(error.message || error, "error");
    }
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    const userName = user.displayName || "Player";

    updateWelcomeName(userName);
    userEmail.textContent = hideEmail(user.email);
    displayNameInput.value = userName;
   const userDoc = await getDoc(doc(db, "users", user.uid));

if (userDoc.exists()) {
    const userData = userDoc.data();

    profilePrivacySelect.value =
        userData.profilePrivacy || "public";
}
    loadProfileImage(user.uid);

    const libraryQuery = query(
        collection(db, "libraries"),
        where("userId", "==", user.uid)
    );

    const librarySnapshot = await getDocs(libraryQuery);
    wishlistCount.textContent = librarySnapshot.size;

    const reviewsQuery = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid)
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);
    reviewsCount.textContent = reviewsSnapshot.size;

    let totalRating = 0;

    if (reviewsSnapshot.empty) {

        myReviewsList.innerHTML = `
            <div class="review-card">
                <div class="review-text">
                    You have not written any reviews yet.
                </div>
            </div>
        `;
    } else {
        myReviewsList.innerHTML = "";

        reviewsSnapshot.forEach((item) => {
            const review = item.data();
            totalRating += Number(review.rating);

            myReviewsList.innerHTML += `
                <div class="review-card">
                    <div class="review-stars">${createStars(review.rating)}</div>
                    <div class="review-user">${review.gameTitle}</div>
                    <div class="review-text">${review.text}</div>
                </div>
            `;
        });


    }

    if (librarySnapshot.size >= 5 || reviewsSnapshot.size >= 3) {
        profileBadge.textContent = "Badge: Active Gamer";
    } else {
        profileBadge.textContent = "Badge: PixelPlay Gamer";
    }
});

saveProfileBtn.addEventListener("click", async () => {
    if (!currentUser) return;

    const newDisplayName = displayNameInput.value.trim();
const selectedPrivacy = profilePrivacySelect.value;
    if (!newDisplayName) {
        showToast("Please enter a display name.", "error");
        return;
    }

    try {
        await updateProfile(currentUser, {
            displayName: newDisplayName
        });

        updateWelcomeName(newDisplayName);
      await updateDoc(doc(db, "users", currentUser.uid), {
    profilePrivacy: selectedPrivacy
});

        showToast("Profile updated successfully! 👤");

    } catch (error) {
        showToast(error.message || error, "error");
    }
});

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});
const openEditProfileBtn = document.getElementById("open-edit-profile");
const editProfileModal = document.getElementById("edit-profile-modal");
const closeEditProfileBtn = document.getElementById("close-edit-profile");

openEditProfileBtn?.addEventListener("click", () => {
    editProfileModal.classList.add("active");
});

closeEditProfileBtn?.addEventListener("click", () => {
    editProfileModal.classList.remove("active");
});

editProfileModal?.addEventListener("click", (event) => {
    if (event.target === editProfileModal) {
        editProfileModal.classList.remove("active");
    }
});