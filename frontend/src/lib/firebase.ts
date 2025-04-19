// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOUweA8iJCyRjIMFZyPKjcpZKRfUF_R-4",
  authDomain: "votesmart-3f5b0.firebaseapp.com",
  projectId: "votesmart-3f5b0",
  storageBucket: "votesmart-3f5b0.firebasestorage.app",
  messagingSenderId: "43367420192",
  appId: "1:43367420192:web:717bbd666c2123f2d9c745",
  measurementId: "G-JXCMLNWZ6E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);