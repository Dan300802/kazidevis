export function formatMontant(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function totalDevis(lignes: { quantite: number; prixUnitaire: number }[]): number {
  return lignes.reduce((acc, l) => acc + l.quantite * l.prixUnitaire, 0);
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function genNumeroDevis(count: number): string {
  return `DEV-${String(count + 1).padStart(3, "0")}`;
}

export const STATUT_LABEL: Record<string, string> = {
  brouillon: "Brouillon", envoye: "Envoyé", accepte: "Accepté", refuse: "Refusé",
};

export const STATUT_COLOR: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-600",
  envoye:    "bg-yellow-50 text-yellow-700",
  accepte:   "bg-green-50 text-green-700",
  refuse:    "bg-red-50 text-red-600",
};

export const METIERS = [
  "Maçonnerie", "Couture / Tailleur", "Électricité", "Plomberie",
  "Menuiserie", "Peinture", "Carrelage", "Soudure", "Mécanique", "Autre",
];

export const CATEGORIES_DEPENSE = ["Matériaux", "Transport", "Équipements", "Alimentation", "Divers"];
export const CATEGORIES_REVENU  = ["Devis accepté", "Acompte", "Paiement direct", "Autre"];

export function getMoisLabel(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

export function getMoisKey(date: string): string {
  return date.slice(0, 7); // "2026-06"
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function getMoisNom(key: string): string {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-FR", { month: "short" });
}
