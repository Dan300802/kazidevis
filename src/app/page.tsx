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
  const [state, setState] = useState<AppState>("splash");
  const [user,  setUser]  = useState<UserAuth | null>(null);
  const activeTab = useAppStore((s) => s.activeTab);
  const updateArtisan = useAppStore((s) => s.updateArtisan);

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

  return (
    <div className="min-h-dvh bg-gray-100 flex items-start justify-center">
      <div className="relative w-full bg-white overflow-hidden" style={{ maxWidth: 430, minHeight: "100dvh" }}>

        {/* SPLASH */}
        {state === "splash" && (
          <SplashScreen onDone={() => {
            const existing = getUser();
            if (existing) { setUser(existing); updateArtisan({ nom: existing.nom, metier: existing.metier, telephone: existing.telephone, ville: existing.ville || "Togo", initiales: existing.initiales }); setState("app"); }
            else setState("auth");
          }} />
        )}

        {/* AUTH */}
        {state === "auth" && <AuthScreen onAuth={handleAuth} />}

        {/* APP */}
        {state === "app" && (
          <>
            <div className="overflow-y-auto" style={{ minHeight: "100dvh" }}>
              {activeTab === "home"     && <HomeScreen />}
              {activeTab === "devis"    && <DevisScreen />}
              {activeTab === "clients"  && <ClientsScreen />}
              {activeTab === "rapport"  && <RapportScreen />}
              {activeTab === "finances" && <FinancesScreen />}
              {activeTab === "profil"   && <ProfilScreen onLogout={() => { localStorage.removeItem("kazidevis_auth"); setState("auth"); }} />}
            </div>
            <BottomNav />
          </>
        )}
      </div>
    </div>
  );
}
