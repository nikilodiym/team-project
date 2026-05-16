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

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


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
export const storage = getStorage(app);

export const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export const logout = () => {
  return signOut(auth);
};

export const uploadImageToFirebase = async (file, path) => {
  if (!file) return null;
  try{
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }catch(error){
    console.error("Image upload error:", error);
    return null;
  }
  
}


// SAVE FORM FUNCTION

export const saveFormToFirestore = async (
  formTitle,
  questions,
  formBanner = ""
) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("Login first");
      return;
    }

    await addDoc(collection(db, "forms"), {
      title: formTitle,
      banner: formBanner,
      questions: questions,

      userId: user.uid,
      userName: user.displayName,
      userEmail: user.email,

      createdAt: serverTimestamp(),
    });

    alert("Form saved successfully!");
  } catch (error) {
    console.log("Firestore Error:", error);
  }
};