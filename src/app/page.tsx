"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getUser, saveUser } from "@/lib/auth";
import type { UserAuth } from "@/lib/auth";
import { SplashScreen } from "@/components/screens/SplashScreen";
import { AuthScreen }   from "@/components/screens/AuthScreen";
import { BottomNav }      from "@/components/layout/BottomNav";
import { HomeScreen }     from "@/components/screens/HomeScreen";
import { DevisScreen }    from "@/components/screens/DevisScreen";
import { ClientsScreen }  from "@/components/screens/ClientsScreen";
import { RapportScreen }  from "@/components/screens/RapportScreen";
import { FinancesScreen } from "@/components/screens/FinancesScreen";
import { ProfilScreen }   from "@/components/screens/ProfilScreen";

type AppState = "splash" | "auth" | "app";

export default function App() {
  const [state,    setState]   = useState<AppState>("splash");
  const [user,     setUser]    = useState<UserAuth | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const activeTab     = useAppStore((s) => s.activeTab);
  const updateArtisan = useAppStore((s) => s.updateArtisan);

  // ── Attendre l'hydratation Zustand (critique sur mobile) ──
  useEffect(() => {
    // Zustand persist a besoin d'un tick pour lire localStorage
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // Si déjà hydraté (PC rapide)
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return () => unsub();
  }, []);

  const handleAuth = (u: UserAuth) => {
    saveUser(u);
    setUser(u);
    updateArtisan({
      nom:       u.nom,
      metier:    u.metier,
      telephone: u.telephone,
      ville:     u.ville || "Togo",
      initiales: u.initiales,
    });
    setState("app");
  };

  const handleSplashDone = () => {
    if (!hydrated) {
      // Attendre hydratation si pas encore prête
      const check = setInterval(() => {
        if (useAppStore.persist.hasHydrated()) {
          clearInterval(check);
          doAfterHydration();
        }
      }, 50);
      setTimeout(() => { clearInterval(check); doAfterHydration(); }, 2000);
    } else {
      doAfterHydration();
    }
  };

  const doAfterHydration = () => {
    try {
      const existing = getUser();
      if (existing) {
        setUser(existing);
        updateArtisan({
          nom:       existing.nom,
          metier:    existing.metier,
          telephone: existing.telephone,
          ville:     existing.ville || "Togo",
          initiales: existing.initiales,
        });
        setState("app");
      } else {
        setState("auth");
      }
    } catch {
      setState("auth");
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#F1F5F9", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 430, minHeight: "100dvh", background: "#fff", overflow: "hidden" }}>

        {/* SPLASH */}
        {state === "splash" && <SplashScreen onDone={handleSplashDone} />}

        {/* AUTH */}
        {state === "auth" && <AuthScreen onAuth={handleAuth} />}

        {/* APP */}
        {state === "app" && (
          <>
            <div style={{ minHeight: "100dvh", overflowY: "auto" }}>
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
