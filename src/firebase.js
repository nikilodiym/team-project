import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJR4kk1GuaDLoTp-ALsdK4pdGHGkK9Pjg",
  authDomain: "form-1b40f.firebaseapp.com",
  projectId: "form-1b40f",
  storageBucket: "form-1b40f.firebasestorage.app",
  messagingSenderId: "928590941824",
  appId: "1:928590941824:web:ad1d9e0a77666ae0d82065",
  measurementId: "G-0H67VZNX55",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export const logout = () => {
  return signOut(auth);
};

// SAVE FORM FUNCTION

export const saveFormToFirestore = async (
  formTitle,
  questions
) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("Login first");
      return;
    }

    await addDoc(collection(db, "forms"), {
      title: formTitle,
      questions: questions,

      // Keep legacy userId and add ownerId for new queries
      userId: user.uid,
      ownerId: user.uid,
      userName: user.displayName,
      userEmail: user.email,

      createdAt: serverTimestamp(),
    });

    alert("Form saved successfully!");
  } catch (error) {
    console.log("Firestore Error:", error);
  }
};