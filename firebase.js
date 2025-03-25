// Firebase configuration file
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0tzC0RCuwXq9JuDqBxI6A1ezqjsXjDvk",
  authDomain: "lms-se-fe760.firebaseapp.com",
  projectId: "lms-se-fe760",
  storageBucket: "lms-se-fe760.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "918042822312",
  appId: "1:918042822312:web:3df3d647c7c275c6bee49d",
  measurementId: "G-Q0XQNWVX65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { auth, db, analytics, storage };