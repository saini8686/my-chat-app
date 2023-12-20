import React, { createContext, useContext, useEffect, useReducer } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import Swal from "sweetalert2";

const FirebaseContext = createContext();

export const useFirebase = () => {
  return useContext(FirebaseContext);
};

const initialState = {
  user: null,
  error: null,
  items: [],
  ws: null, // WebSocket instance
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_ITEMS":
      return { ...state, items: action.payload.reverse() };
    case "SET_WS":
      return { ...state, ws: action.payload };
    default:
      return state;
  }
};

export const FirebaseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const unsubscribeAuth = firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch({ type: "SET_USER", payload: authUser });

        const unsubscribeFirestore = firebase
          .firestore()
          .collection("items")
          .onSnapshot((snapshot) => {
            const updatedItems = snapshot.docs.map((doc) => doc.data());
            dispatch({ type: "SET_ITEMS", payload: updatedItems });
          });

        // Set up a WebSocket connection
        const ws = new WebSocket("ws://localhost:3001");
        ws.addEventListener("open", () => {
          console.log("Connected to the WebSocket server");
        });

        ws.addEventListener("message", (event) => {
          const receivedMessage = event.data;
          // Handle WebSocket messages here
        });

        dispatch({ type: "SET_WS", payload: ws });

        return () => {
          unsubscribeFirestore();
          ws.close();
        };
      } else {
        dispatch({ type: "SET_USER", payload: null });
        dispatch({ type: "SET_ITEMS", payload: [] });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Welcome ${state.user.displayName}`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const signUpWithEmail = async (name, email, password) => {
    try {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({
        displayName: name,
      });

      // Additional logic if needed
    } catch (error) {
      console.error("Firebase Sign-Up Error:", error);

      if (error.code === "auth/email-already-in-use") {
        dispatch({
          type: "SET_ERROR",
          payload: "An account with this email already exists. Please sign in.",
        });
        throw new Error(
          "An account with this email already exists. Please sign in."
        );
      } else if (error.code === "auth/invalid-email") {
        dispatch({
          type: "SET_ERROR",
          payload:
            "Invalid email format. Please provide a valid email address.",
        });
        throw new Error(
          "Invalid email format. Please provide a valid email address."
        );
      } else if (error.code === "auth/weak-password") {
        dispatch({
          type: "SET_ERROR",
          payload:
            "The password is too weak. Please choose a stronger password.",
        });
        throw new Error(
          "The password is too weak. Please choose a stronger password."
        );
      } else {
        dispatch({ type: "SET_ERROR", payload: "Unknown error" });
        throw error; // Propagate other errors
      }
    }
  };

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Account Has Been Signed out",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const sendMessageToServer = (message) => {
    if (state.ws && message.trim() !== "") {
      state.ws.send(message);
    }
  };

  const value = {
    user: state.user,
    items: state.items,
    signInWithGoogle,
    signUpWithEmail,
    signOut,
    error: state.error,
    sendMessageToServer,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
