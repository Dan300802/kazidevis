"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getUser, saveUser } from "@/lib/auth";
import type { UserAuth } from "@/lib/auth";
import { AuthScreen }   from "@/components/screens/AuthScreen";
import { BottomNav }      from "@/components/layout/BottomNav";
import { HomeScreen }     from "@/components/screens/HomeScreen";
import { DevisScreen }    from "@/components/screens/DevisScreen";
import { ClientsScreen }  from "@/components/screens/ClientsScreen";
import { RapportScreen }  from "@/components/screens/RapportScreen";
import { FinancesScreen } from "@/components/screens/FinancesScreen";
import { ProfilScreen }   from "@/components/screens/ProfilScreen";
import { KaziLogo }       from "@/components/screens/SplashScreen";

type AppState = "splash" | "auth" | "app";

export default function App() {
  const [state,   setState]   = useState<AppState>("splash");
  const [progress, setProgress] = useState(0);
  const [log,     setLog]     = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  const activeTab     = useAppStore((s) => s.activeTab);
  const updateArtisan = useAppStore((s) => s.updateArtisan);

  const addLog = (msg: string) => {
    console.log(msg);
    setLog((l) => [...l, `${new Date().toISOString().slice(11,19)} ${msg}`]);
  };

  useEffect(() => {
    addLog("App monté");

    // Barre de progression animée
    let pct = 0;
    const bar = setInterval(() => {
      pct += Math.random() * 6 + 3;
      if (pct >= 100) { pct = 100; clearInterval(bar); }
      setProgress(Math.min(pct, 100));
    }, 60);

    // Transition vers auth/app après 2.5s max — sans dépendre de Zustand
    const go = () => {
      addLog("Vérification auth...");
      try {
        const u = getUser();
        addLog(u ? `User trouvé: ${u.nom}` : "Pas de user");
        if (u && u.nom) {
          updateArtisan({ nom: u.nom, metier: u.metier || "", telephone: u.telephone || "", ville: u.ville || "Togo", initiales: u.initiales || "AB" });
          setState("app");
        } else {
          setState("auth");
        }
      } catch (e: any) {
        addLog(`Erreur: ${e?.message}`);
        setState("auth");
      }
    };

    // On attend 2.5s (temps du splash) puis on go
    const t = setTimeout(() => {
      addLog("Timeout splash atteint");
      go();
    }, 2500);

    return () => { clearTimeout(t); clearInterval(bar); };
  }, []);

  const handleAuth = (u: UserAuth) => {
    saveUser(u);
    updateArtisan({ nom: u.nom, metier: u.metier, telephone: u.telephone, ville: u.ville || "Togo", initiales: u.initiales });
    setState("app");
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#F1F5F9", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 430, minHeight: "100dvh", background: "#fff", overflow: "hidden" }}>

        {/* ── SPLASH ── */}
        {state === "splash" && (
          <div style={{ minHeight: "100dvh", background: "linear-gradient(160deg,#14532D 0%,#15803D 45%,#16A34A 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.07)", top:-80, right:-80 }} />
            <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)", bottom:-40, left:-60 }} />

            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ width:110, height:110, borderRadius:32, background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>
                <KaziLogo size={72} />
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
                <span style={{ fontSize:42, fontWeight:800, color:"#fff", fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:-1.5 }}>Kazi</span>
                <span style={{ fontSize:42, fontWeight:800, color:"#FBBF24", fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:-1.5 }}>Devis</span>
              </div>
              <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginTop:6, letterSpacing:"0.1em", fontWeight:500 }}>GESTION ARTISANS · TOGO</p>
            </div>

            <div style={{ position:"absolute", bottom:60, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div style={{ width:180, height:3, background:"rgba(255,255,255,0.15)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#FBBF24,#F59E0B)", borderRadius:99, transition:"width 0.06s linear" }} />
              </div>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>Chargement...</p>
            </div>

            {/* Bouton debug — appuie dessus si bloqué */}
            <button
              onClick={() => setShowLog(!showLog)}
              style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.15)", border:"none", borderRadius:8, padding:"6px 12px", color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer" }}
            >
              debug
            </button>

            {/* Log visible sur téléphone */}
            {showLog && (
              <div style={{ position:"absolute", top:50, left:10, right:10, background:"rgba(0,0,0,0.8)", borderRadius:10, padding:12, maxHeight:200, overflowY:"auto" }}>
                {log.map((l,i) => <p key={i} style={{ fontSize:10, color:"#fff", fontFamily:"monospace", marginBottom:3 }}>{l}</p>)}
                {log.length === 0 && <p style={{ fontSize:10, color:"#aaa" }}>En attente...</p>}
              </div>
            )}

            {/* Bouton secours — si toujours bloqué après 5s */}
            <button
              onClick={() => setState("auth")}
              style={{ position:"absolute", bottom:20, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:10, padding:"8px 20px", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer" }}
            >
              Continuer →
            </button>

            <p style={{ position:"absolute", bottom:54, color:"rgba(255,255,255,0.25)", fontSize:11, letterSpacing:"0.06em" }}>Kazi = Travail · Swahili</p>
          </div>
        )}

        {/* ── AUTH ── */}
        {state === "auth" && <AuthScreen onAuth={handleAuth} />}

        {/* ── APP ── */}
        {state === "app" && (
          <>
            <div style={{ minHeight: "100dvh", overflowY: "auto", paddingBottom: 64 }}>
              {activeTab === "home"     && <HomeScreen />}
              {activeTab === "devis"    && <DevisScreen />}
              {activeTab === "clients"  && <ClientsScreen />}
              {activeTab === "rapport"  && <RapportScreen />}
              {activeTab === "finances" && <FinancesScreen />}
              {activeTab === "profil"   && (
                <ProfilScreen onLogout={() => {
                  try { localStorage.removeItem("kazidevis_auth"); } catch {}
                  setState("auth");
                }} />
              )}
            </div>
            <BottomNav />
          </>
        )}
      </div>
    </div>
  );
}
