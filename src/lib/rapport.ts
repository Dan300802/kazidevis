import type { Devis, Transaction } from "@/types";
import { totalDevis, getMoisKey, getLast6Months } from "./utils";

export interface StatsMois {
  key:       string;   // "2026-06"
  revenus:   number;
  depenses:  number;
  benefice:  number;
  nbDevis:   number;
  nbAcceptes:number;
}

export interface RapportData {
  moisActuel:    StatsMois;
  moisPrecedent: StatsMois;
  last6Months:   StatsMois[];
  topClients:    { nom: string; ca: number; nbDevis: number }[];
  topMetiers:    { metier: string; ca: number; nb: number }[];
  repartDepenses:{ categorie: string; total: number; pct: number }[];
  tauxAcceptation: number;
  revenuMoyen:   number;
}

function statsMois(key: string, devis: Devis[], transactions: Transaction[]): StatsMois {
  const txMois    = transactions.filter((t) => t.date.startsWith(key));
  const devisMois = devis.filter((d) => d.dateCreation.startsWith(key));
  const revenus   = txMois.filter((t) => t.type === "revenu").reduce((a, t) => a + t.montant, 0);
  const depenses  = txMois.filter((t) => t.type === "depense").reduce((a, t) => a + t.montant, 0);
  return {
    key, revenus, depenses, benefice: revenus - depenses,
    nbDevis:    devisMois.length,
    nbAcceptes: devisMois.filter((d) => d.statut === "accepte").length,
  };
}

export function calcRapport(devis: Devis[], transactions: Transaction[]): RapportData {
  const now    = new Date();
  const keyNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prev   = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const keyPrev= `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  const last6  = getLast6Months().map((k) => statsMois(k, devis, transactions));

  // Top clients
  const clientMap: Record<string, { ca: number; nbDevis: number }> = {};
  devis.filter((d) => d.statut === "accepte").forEach((d) => {
    if (!clientMap[d.client]) clientMap[d.client] = { ca: 0, nbDevis: 0 };
    clientMap[d.client].ca     += totalDevis(d.lignes);
    clientMap[d.client].nbDevis++;
  });
  const topClients = Object.entries(clientMap)
    .map(([nom, v]) => ({ nom, ...v }))
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 5);

  // Top métiers
  const metierMap: Record<string, { ca: number; nb: number }> = {};
  devis.filter((d) => d.statut === "accepte").forEach((d) => {
    if (!metierMap[d.typeMetier]) metierMap[d.typeMetier] = { ca: 0, nb: 0 };
    metierMap[d.typeMetier].ca += totalDevis(d.lignes);
    metierMap[d.typeMetier].nb++;
  });
  const topMetiers = Object.entries(metierMap)
    .map(([metier, v]) => ({ metier, ...v }))
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 5);

  // Répartition dépenses
  const totalDep = transactions.filter((t) => t.type === "depense").reduce((a, t) => a + t.montant, 0);
  const catMap: Record<string, number> = {};
  transactions.filter((t) => t.type === "depense").forEach((t) => {
    catMap[t.categorie] = (catMap[t.categorie] || 0) + t.montant;
  });
  const repartDepenses = Object.entries(catMap)
    .map(([categorie, total]) => ({ categorie, total, pct: totalDep > 0 ? Math.round((total / totalDep) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);

  // Taux acceptation global
  const total     = devis.length;
  const acceptes  = devis.filter((d) => d.statut === "accepte").length;
  const tauxAcceptation = total > 0 ? Math.round((acceptes / total) * 100) : 0;

  // Revenu moyen par devis accepté
  const totalCA   = devis.filter((d) => d.statut === "accepte").reduce((a, d) => a + totalDevis(d.lignes), 0);
  const revenuMoyen = acceptes > 0 ? Math.round(totalCA / acceptes) : 0;

  return {
    moisActuel:    statsMois(keyNow,  devis, transactions),
    moisPrecedent: statsMois(keyPrev, devis, transactions),
    last6Months:   last6,
    topClients, topMetiers, repartDepenses,
    tauxAcceptation, revenuMoyen,
  };
}

export function delta(current: number, previous: number): { pct: number; positif: boolean } {
  if (previous === 0) return { pct: 0, positif: current >= 0 };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct, positif: pct >= 0 };
}
