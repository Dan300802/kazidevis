"use client";
import { useState, useEffect } from "react";
import { onAuth } from "@/lib/firebaseAuth";
import { KaziLogo } from "@/components/screens/SplashScreen";

type AppState = "splash" | "auth" | "app";

export default function App() {
  const [state, setState] = useState<AppState>("splash");
  const [uid,   setUid]   = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Barre de progression
    let pct = 0;
    const bar = setInterval(() => {
      pct += Math.random() * 8 + 4;
      if (pct >= 100) { pct = 100; clearInterval(bar); }
      setProgress(Math.min(pct, 100));
    }, 50);

    // Firebase Auth — détecte si user connecté ou non
    // onAuthStateChanged fonctionne parfaitement sur iOS Safari
    const unsub = onAuth((user) => {
      clearInterval(bar);
      setProgress(100);
      setTimeout(() => {
        if (user) {
          setUid(user.uid);
          setState("app");
        } else {
          setState("auth");
        }
      }, 400);
    });

    return () => { clearInterval(bar); unsub(); };
  }, []);

  if (state === "splash") return <Splash progress={progress} />;

  const AuthScreen = require("@/components/screens/AuthScreen").AuthScreen;
  const AppShell   = require("./AppShell").AppShell;

  if (state === "auth") return (
    <AuthScreen onAuth={(u: any) => { setUid(u.uid); setState("app"); }} />
  );

  return (
    <AppShell
      uid={uid!}
      onLogout={() => { setUid(null); setState("auth"); }}
    />
  );
}

function Splash({ progress }: { progress: number }) {
  return (
    <div style={{ minHeight:"100dvh", background:"linear-gradient(160deg,#14532D 0%,#15803D 45%,#16A34A 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.07)", top:-80, right:-80 }} />
      <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)", bottom:-40, left:-60 }} />

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ width:110, height:110, borderRadius:32, background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>
          <KaziLogo size={72} />
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
          <span style={{ fontSize:42, fontWeight:800, color:"#fff", fontFamily:"sans-serif", letterSpacing:-1.5 }}>Kazi</span>
          <span style={{ fontSize:42, fontWeight:800, color:"#FBBF24", fontFamily:"sans-serif", letterSpacing:-1.5 }}>Devis</span>
        </div>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginTop:6, letterSpacing:"0.1em" }}>GESTION ARTISANS · TOGO</p>
      </div>

      <div style={{ position:"absolute", bottom:60, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <div style={{ width:180, height:3, background:"rgba(255,255,255,0.15)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#FBBF24,#F59E0B)", borderRadius:99, transition:"width 0.05s linear" }} />
        </div>
        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>Chargement...</p>
      </div>
      <p style={{ position:"absolute", bottom:20, color:"rgba(255,255,255,0.25)", fontSize:11, letterSpacing:"0.06em" }}>Kazi = Travail · Swahili</p>
    </div>
  );
}
