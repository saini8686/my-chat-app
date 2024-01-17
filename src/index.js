import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import firebase from "firebase/compat/app";
import "./index.css";
import "firebase/compat/auth";
import { FirebaseProvider } from "./components/FirebaseDataProv";
import { BrowserRouter } from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyBJV9TJi5hYWnTbHyJH8VC45zfFtu5xZls",
  authDomain: "my-first-firebase-data-app.firebaseapp.com",
  projectId: "my-first-firebase-data-app",
  storageBucket: "my-first-firebase-data-app.appspot.com",
  messagingSenderId: "775677507588",
  appId: "1:775677507588:web:134988c2db2e541f639d51",
  // measurementId: "G-KEG4HSPGEB",
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <BrowserRouter>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
