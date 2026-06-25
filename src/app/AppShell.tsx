"use client";
import { useAppStore } from "@/store/useAppStore";
import { BottomNav }      from "@/components/layout/BottomNav";
import { HomeScreen }     from "@/components/screens/HomeScreen";
import { DevisScreen }    from "@/components/screens/DevisScreen";
import { ClientsScreen }  from "@/components/screens/ClientsScreen";
import { RapportScreen }  from "@/components/screens/RapportScreen";
import { FinancesScreen } from "@/components/screens/FinancesScreen";
import { ProfilScreen }   from "@/components/screens/ProfilScreen";

export function AppShell({ onLogout }: { onLogout: () => void }) {
  const activeTab = useAppStore((s) => s.activeTab);
  return (
    <div style={{ minHeight:"100dvh", position:"relative" }}>
      <div style={{ minHeight:"100dvh", overflowY:"auto", paddingBottom:64 }}>
        {activeTab === "home"     && <HomeScreen />}
        {activeTab === "devis"    && <DevisScreen />}
        {activeTab === "clients"  && <ClientsScreen />}
        {activeTab === "rapport"  && <RapportScreen />}
        {activeTab === "finances" && <FinancesScreen />}
        {activeTab === "profil"   && <ProfilScreen onLogout={onLogout} />}
      </div>
      <BottomNav />
    </div>
  );
}