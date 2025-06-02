// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvUjQYWz_n9AG2xx1Pm9WqPFAtoCJ0BK4",
  authDomain: "fintrackai-e88ba.firebaseapp.com",
  projectId: "fintrackai-e88ba",
  storageBucket: "fintrackai-e88ba.firebasestorage.app",
  messagingSenderId: "338294819718",
  appId: "1:338294819718:web:ca21ac80181bf61002ba07",
  measurementId: "G-TXZ9T0D9B4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };