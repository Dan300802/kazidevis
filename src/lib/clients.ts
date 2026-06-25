import type { Client } from "@/types";

const COULEURS = [
  "#16A34A", "#2563EB", "#9333EA", "#DC2626",
  "#D97706", "#0891B2", "#BE185D", "#059669",
];

export function genInitiales(nom: string): string {
  return nom.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function genCouleur(nom: string): string {
  let hash = 0;
  for (const c of nom) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return COULEURS[Math.abs(hash) % COULEURS.length];
}

export function clientDepuisDevis(nom: string, telephone?: string): Omit<Client, "id"> {
  return {
    nom,
    telephone,
    dateCreation: new Date().toISOString().slice(0, 10),
    initiales:    genInitiales(nom),
    couleur:      genCouleur(nom),
  };
}
