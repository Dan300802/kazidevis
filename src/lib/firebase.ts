import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyCB9yv2XqrfDo1J_znpfHUt4D4QJQ5e7xI",
  authDomain:        "kazidevis.firebaseapp.com",
  projectId:         "kazidevis",
  storageBucket:     "kazidevis.firebasestorage.app",
  messagingSenderId: "1038692158393",
  appId:             "1:1038692158393:web:36b866413a01544f73c468",
};

// Évite la double initialisation en dev (Next.js hot reload)
const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
