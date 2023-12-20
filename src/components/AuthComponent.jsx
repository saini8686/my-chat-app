import React from "react";
import { useFirebase } from "./FirebaseDataProv";
const AuthComponent = () => {
  const { user, signInWithGoogle, signInAnonymously, signOut } = useFirebase();
  return (
    <div>
      <div>
        {user ? (
          <>
            <p>Welcome, {user.displayName}</p>
            <button onClick={signOut}>Sign Out</button>
          </>
        ) : (
          <div>
            {" "}
            <button onClick={signInWithGoogle}>Sign in with Google</button>
            <br />
            <button onClick={signInAnonymously}>signInAnonymously</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthComponent;
