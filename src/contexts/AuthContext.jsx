import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) setLoading(false);

      const userRef = doc(db, "users", user?.uid);
      getDoc(userRef)
        .then((docSnap) =>
          setUser({
            id: user.uid,
            email: user.email,
            firstName: docSnap.data().firstName,
            lastName: docSnap.data().lastName,
            permissions: docSnap.data().permissions,
          })
        )
        .then(() => setLoading(false));
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    currentUser,
    login,
    logout,
    signup,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
}
