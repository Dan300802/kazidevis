import { initializeApp, getApps, getApp } from "firebase/app";
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

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
