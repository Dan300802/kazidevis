"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/screens/SplashScreen";
import { AuthScreen }   from "@/components/screens/AuthScreen";
import { AppShell }     from "./AppShell";

type AppState = "splash" | "auth" | "app";

export default function App() {
  const [state, setState] = useState<AppState>("splash");
  const [uid,   setUid]   = useState<string | null>(null);

  useEffect(() => {
    let done = false;

    const goAuth = () => {
      if (done) return;
      done = true;
      setState("auth");
    };

    const goApp = (id: string) => {
      if (done) return;
      done = true;
      setUid(id);
      setState("app");
    };

    // Timeout de secours — 4 secondes max, puis on affiche login
    const fallback = setTimeout(goAuth, 4000);

    // Firebase Auth
    import("firebase/auth").then(({ getAuth, onAuthStateChanged }) => {
      import("@/lib/firebase").then(({ default: app }) => {
        const auth = getAuth(app);
        const unsub = onAuthStateChanged(auth, (user) => {
          clearTimeout(fallback);
          if (user) goApp(user.uid);
          else goAuth();
          unsub();
        }, () => {
          clearTimeout(fallback);
          goAuth();
        });
      }).catch(() => { clearTimeout(fallback); goAuth(); });
    }).catch(() => { clearTimeout(fallback); goAuth(); });

    return () => clearTimeout(fallback);
  }, []);

  if (state === "splash") return <SplashScreen />;
  if (state === "auth")   return <AuthScreen onAuth={(u: any) => { setUid(u.uid); setState("app"); }} />;
  return <AppShell uid={uid!} onLogout={() => { setUid(null); setState("auth"); }} />;
}
