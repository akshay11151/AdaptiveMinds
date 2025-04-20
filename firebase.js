// Firebase configuration file
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8h-UZsBimuDoGvFHj5VoXuLdywODlWpw",
  authDomain: "learninghub-c553d.firebaseapp.com",
  projectId: "learninghub-c553d",
  storageBucket: "learninghub-c553d.firebasestorage.app",
  messagingSenderId: "16563526630",
  appId: "1:16563526630:web:2c28f8657683b704591427",
  measurementId: "G-F1L739VKYL"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { auth, db, analytics, storage };