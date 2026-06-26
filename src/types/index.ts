export type DevisStatut = "brouillon" | "envoye" | "accepte" | "refuse";
export type TransactionType = "revenu" | "depense";

export interface LigneDevis {
  id: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
  unite?: string;
}

export interface Acompte {
  id: string;
  montant: number;
  date: string;
  note?: string;
}

export interface Devis {
  id: string;
  numero: string;
  client: string;
  telephone?: string;
  typeMetier: string;
  statut: DevisStatut;
  lignes: LigneDevis[];
  acomptes?: Acompte[];
  dateCreation: string;
  dateValidite?: string;
  titre?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  montant: number;
  categorie: string;
  date: string;
  devisId?: string;
}

export interface Artisan {
  nom: string;
  metier: string;
  telephone: string;
  ville: string;
  initiales: string;
}

export type PlanType = "gratuit" | "premium";

export interface Abonnement {
  plan: PlanType;
  dateDebut?: string;
  dateExpiration?: string;
  referenceTransaction?: string;
  telephone?: string;
}

export interface Client {
  id: string;
  nom: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  metier?: string;         // type de travaux fréquent
  titre?: string;
  notes?: string;
  dateCreation: string;
  initiales: string;
  couleur: string;         // couleur avatar générée
}
