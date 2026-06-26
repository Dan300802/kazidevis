"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Devis, Transaction, Artisan, Abonnement, Client } from "@/types";
import { genInitiales, genCouleur } from "@/lib/clients";

interface AppState {
  artisan: Artisan;
  devis: Devis[];
  transactions: Transaction[];
  clients: Client[];
  abonnement: Abonnement;
  activeTab: "home" | "devis" | "finances" | "profil" | "clients" | "rapport";
  setActiveTab: (tab: AppState["activeTab"]) => void;
  addDevis: (d: Devis) => void;
  updateDevis: (d: Devis) => void;
  deleteDevis: (id: string) => void;
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateArtisan: (a: Partial<Artisan>) => void;
  addClient: (c: Client) => void;
  updateClient: (c: Client) => void;
  deleteClient: (id: string) => void;
  activerPremium: (ref: string, telephone: string) => void;
  estPremium: () => boolean;
}

const DEMO_DEVIS: Devis[] = [
  { id: "1", numero: "DEV-001", client: "Kofi Mensah", telephone: "+228 90 11 22 33", typeMetier: "Maçonnerie", statut: "accepte", dateCreation: "2026-06-22",
    lignes: [{ id: "l1", description: "Fourniture ciment (10 sacs)", quantite: 10, prixUnitaire: 2000, unite: "sac" }, { id: "l2", description: "Main d'œuvre", quantite: 3, prixUnitaire: 30000, unite: "jour" }, { id: "l3", description: "Transport matériaux", quantite: 1, prixUnitaire: 15000 }] },
  { id: "2", numero: "DEV-002", client: "Boutique Amina", telephone: "+228 91 44 55 66", typeMetier: "Couture", statut: "envoye", dateCreation: "2026-06-20",
    lignes: [{ id: "l4", description: "Confection robes (5 pièces)", quantite: 5, prixUnitaire: 12000, unite: "pièce" }, { id: "l5", description: "Tissu wax", quantite: 10, prixUnitaire: 3500, unite: "m" }] },
  { id: "3", numero: "DEV-003", client: "Bureau Kodjo & Fils", typeMetier: "Électricité", statut: "envoye", dateCreation: "2026-06-18",
    lignes: [{ id: "l6", description: "Installation tableau électrique", quantite: 1, prixUnitaire: 85000 }, { id: "l7", description: "Câblage (50 m)", quantite: 50, prixUnitaire: 1200, unite: "m" }] },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "revenu",  description: "Paiement Kofi Mensah",   montant: 320000, categorie: "Devis accepté",  date: "2026-06-22" },
  { id: "t2", type: "depense", description: "Achat matériaux marché", montant: 85000,  categorie: "Matériaux",      date: "2026-06-21" },
  { id: "t3", type: "revenu",  description: "Acompte Boutique Amina", montant: 42500,  categorie: "Acompte",        date: "2026-06-20" },
  { id: "t4", type: "depense", description: "Carburant déplacements", montant: 12000,  categorie: "Transport",      date: "2026-06-19" },
  { id: "t5", type: "revenu",  description: "Travaux peinture Togbé", montant: 60000,  categorie: "Paiement direct",date: "2026-06-15" },
  { id: "t6", type: "depense", description: "Achat outils",           montant: 28000,  categorie: "Équipements",    date: "2026-06-12" },
];

const DEMO_CLIENTS: Client[] = [
  { id: "c1", nom: "Kofi Mensah",      telephone: "+228 90 11 22 33", ville: "Lomé",    metier: "Maçonnerie",  dateCreation: "2026-06-22", initiales: "KM", couleur: "#16A34A" },
  { id: "c2", nom: "Boutique Amina",   telephone: "+228 91 44 55 66", ville: "Lomé",    metier: "Couture",     dateCreation: "2026-06-20", initiales: "BA", couleur: "#9333EA" },
  { id: "c3", nom: "Bureau Kodjo & Fils",                              ville: "Aného",   metier: "Électricité", dateCreation: "2026-06-18", initiales: "BK", couleur: "#2563EB" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      artisan:      { nom: "Artisan Bâtisseur", metier: "Maçonnerie", telephone: "+228 90 00 00 00", ville: "Lomé, Togo", initiales: "AB" },
      devis:        DEMO_DEVIS,
      transactions: DEMO_TRANSACTIONS,
      clients:      DEMO_CLIENTS,
      abonnement:   { plan: "gratuit" },
      activeTab:    "home",
      setActiveTab: (tab) => set({ activeTab: tab }),
      addDevis:     (d) => set((s) => ({ devis: [d, ...s.devis] })),
      updateDevis:  (d) => set((s) => ({ devis: s.devis.map((x) => x.id === d.id ? d : x) })),
      deleteDevis:  (id) => set((s) => ({ devis: s.devis.filter((x) => x.id !== id) })),
      addTransaction:    (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      updateArtisan: (a) => set((s) => ({ artisan: { ...s.artisan, ...a } })),
      addClient:    (c) => set((s) => ({ clients: [c, ...s.clients] })),
      updateClient: (c) => set((s) => ({ clients: s.clients.map((x) => x.id === c.id ? c : x) })),
      deleteClient: (id) => set((s) => ({ clients: s.clients.filter((x) => x.id !== id) })),
      activerPremium: (ref, telephone) => {
        const now = new Date(); const exp = new Date(now); exp.setMonth(exp.getMonth() + 1);
        set({ abonnement: { plan: "premium", dateDebut: now.toISOString().slice(0,10), dateExpiration: exp.toISOString().slice(0,10), referenceTransaction: ref, telephone } });
      },
      estPremium: () => {
        // Admin bypass
        try { const u = JSON.parse(localStorage.getItem("kazidevis_auth") || "null"); if (u?.email && ["danielvodjogbe@gmail.com"].includes(u.email)) return true; } catch {}
        // Firebase user check
        try { const keys = Object.keys(localStorage); const fk = keys.find(k => k.includes("firebase:authUser")); if (fk) { const d = JSON.parse(localStorage.getItem(fk)||"null"); if (d?.email && ["danielvodjogbe@gmail.com"].includes(d.email)) return true; } } catch {}
        const { abonnement } = get();
        if (abonnement.plan !== "premium" || !abonnement.dateExpiration) return false;
        return new Date(abonnement.dateExpiration) > new Date();
      },
    }),
    { name: "artisan-app-v1" }
  )
);

// Emails admin avec accès Premium gratuit
export const ADMIN_EMAILS = ["danielvodjogbe@gmail.com"];
