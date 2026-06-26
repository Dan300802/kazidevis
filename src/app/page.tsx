"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/screens/SplashScreen";
import { AuthScreen }   from "@/components/screens/AuthScreen";
import { AppShell }     from "./AppShell";

type AppState = "splash" | "auth" | "app";

// Vérifie si un user est connecté via le token stocké
function getSavedUid(): string | null {
  try {
    const keys = Object.keys(localStorage);
    const fbKey = keys.find(k => k.includes("firebase:authUser"));
    if (!fbKey) return null;
    const data = JSON.parse(localStorage.getItem(fbKey) || "null");
    return data?.uid || null;
  } catch { return null; }
}

export default function App() {
  const [state, setState] = useState<AppState>("splash");
  const [uid,   setUid]   = useState<string | null>(null);

  useEffect(() => {
    let done = false;

    const goAuth = () => { if (!done) { done = true; setState("auth"); } };
    const goApp  = (id: string) => { if (!done) { done = true; setUid(id); setState("app"); } };

    // 1. Vérifier d'abord localStorage (instantané, marche sur iOS)
    const savedUid = getSavedUid();
    if (savedUid) {
      goApp(savedUid);
      return;
    }

    // 2. Timeout de 3s si pas de session sauvegardée
    const fallback = setTimeout(goAuth, 3000);

    // 3. Essayer Firebase Auth en arrière-plan
    try {
      const { auth } = require("@/lib/firebase");
      const { onAuthStateChanged } = require("firebase/auth");
      const unsub = onAuthStateChanged(auth,
        (user: any) => { clearTimeout(fallback); if (user) goApp(user.uid); else goAuth(); unsub(); },
        () => { clearTimeout(fallback); goAuth(); }
      );
    } catch { clearTimeout(fallback); goAuth(); }

    return () => clearTimeout(fallback);
  }, []);

  if (state === "splash") return <SplashScreen />;
  if (state === "auth")   return <AuthScreen onAuth={(u: any) => { setUid(u.uid); setState("app"); }} />;
  return <AppShell uid={uid!} onLogout={() => { setUid(null); setState("auth"); }} />;
}
