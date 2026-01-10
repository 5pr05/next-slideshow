// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics"; // Added Analytics type for TS
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// NOTE: You can remove these side-effect imports as you are using the modular SDK above
// import 'firebase/firestore'
// import 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDzJ4IYDgDL3joN5vyLt_XyL5zhSzsQnLQ",
  authDomain: "slidershow-1f64e.firebaseapp.com",
  projectId: "slidershow-1f64e",
  storageBucket: "slidershow-1f64e.firebasestorage.app",
  messagingSenderId: "255094631542",
  appId: "1:255094631542:web:7add3b674100280fd20357",
  measurementId: "G-G79QGNP2XW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// FIX: Check if window is defined before initializing analytics
// Next.js runs this on the server (where window is undefined), causing the crash.
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };
export const auth = getAuth(app);
export const db = getFirestore(app);