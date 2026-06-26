"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getProfil, getDevis, getTransactions, getClients, deconnecter } from "@/lib/firebaseAuth";
import { BottomNav }      from "@/components/layout/BottomNav";
import { HomeScreen }     from "@/components/screens/HomeScreen";
import { DevisScreen }    from "@/components/screens/DevisScreen";
import { ClientsScreen }  from "@/components/screens/ClientsScreen";
import { RapportScreen }  from "@/components/screens/RapportScreen";
import { FinancesScreen } from "@/components/screens/FinancesScreen";
import { ProfilScreen }   from "@/components/screens/ProfilScreen";

export function AppShell({ uid, onLogout }: { uid: string; onLogout: () => void }) {
  const [loading, setLoading] = useState(true);
  const activeTab     = useAppStore((s) => s.activeTab);
  const updateArtisan = useAppStore((s) => s.updateArtisan);
  const setDevis      = (d: any[]) => useAppStore.setState({ devis: d });
  const setTx         = (t: any[]) => useAppStore.setState({ transactions: t });
  const setClients    = (c: any[]) => useAppStore.setState({ clients: c });

  useEffect(() => {
    if (!uid) return;
    // Charger toutes les données depuis Firestore
    Promise.all([
      getProfil(uid),
      getDevis(uid),
      getTransactions(uid),
      getClients(uid),
    ]).then(([profil, devis, transactions, clients]) => {
      if (profil) updateArtisan(profil);
      setDevis(devis);
      setTx(transactions);
      setClients(clients);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  if (loading) return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid #E2E8F0", borderTopColor:"#16A34A", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
        <p style={{ fontSize:13, color:"#94A3B8" }}>Chargement de vos données...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100dvh", position:"relative" }}>
      <div style={{ minHeight:"100dvh", overflowY:"auto", paddingBottom:64 }}>
        {activeTab === "home"     && <HomeScreen />}
        {activeTab === "devis"    && <DevisScreen uid={uid} />}
        {activeTab === "clients"  && <ClientsScreen uid={uid} />}
        {activeTab === "rapport"  && <RapportScreen />}
        {activeTab === "finances" && <FinancesScreen uid={uid} />}
        {activeTab === "profil"   && <ProfilScreen onLogout={async () => { await deconnecter(); onLogout(); }} uid={uid} />}
      </div>
      <BottomNav />
    </div>
  );
}
