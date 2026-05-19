// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpqMZMrUXQ5iPkJUbfsn-AuK6xnBCL3pA",
  authDomain: "pixel-play-8b4c9.firebaseapp.com",
  projectId: "pixel-play-8b4c9",
  storageBucket: "pixel-play-8b4c9.firebasestorage.app",
  messagingSenderId: "154554157127",
  appId: "1:154554157127:web:e94b5648b6a22f263c4962",
  measurementId: "G-JPGBK8V7GS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);