// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJV9TJi5hYWnTbHyJH8VC45zfFtu5xZls",
  authDomain: "my-first-firebase-data-app.firebaseapp.com",
  projectId: "my-first-firebase-data-app",
  storageBucket: "my-first-firebase-data-app.appspot.com",
  messagingSenderId: "775677507588",
  appId: "1:775677507588:web:134988c2db2e541f639d51",
  // measurementId: "G-KEG4HSPGEB",
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth2 = getAuth(firebaseApp);
export const googleProvider2 = new GoogleAuthProvider();
export default firebaseApp;
