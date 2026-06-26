"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/screens/SplashScreen";

type AppState = "splash" | "auth" | "app";

export default function App() {
  const [state, setState] = useState<AppState>("splash");
  const [uid,   setUid]   = useState<string | null>(null);

  useEffect(() => {
    // Import Firebase Auth uniquement côté client
    import("@/lib/firebaseAuth").then(({ onAuth }) => {
      const unsub = onAuth((user) => {
        if (user) {
          setUid(user.uid);
          setState("app");
        } else {
          setState("auth");
        }
      });
      return () => unsub();
    }).catch(() => setState("auth"));
  }, []);

  if (state === "splash") return <SplashScreen />;

  if (state === "auth") {
    const AuthScreen = require("@/components/screens/AuthScreen").AuthScreen;
    return <AuthScreen onAuth={(u: any) => { setUid(u.uid); setState("app"); }} />;
  }

  const AppShell = require("./AppShell").AppShell;
  return <AppShell uid={uid!} onLogout={() => { setUid(null); setState("auth"); }} />;
}
