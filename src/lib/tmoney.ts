/**
 * Intégration paiement mobile Togo
 * T-Money → Togocel (Yas)
 * Flooz   → Moov Africa Togo
 */

export type OperateurType = "tmoney" | "flooz";

export interface OperateurConfig {
  id:          OperateurType;
  nom:         string;
  operateur:   string;
  couleur:     string;
  couleurBg:   string;
  ussd:        string;
  prefixes:    string[];   // préfixes valides
  logo:        string;     // emoji provisoire
  apiBase:     string;
}

export const OPERATEURS: Record<OperateurType, OperateurConfig> = {
  tmoney: {
    id:        "tmoney",
    nom:       "T-Money",
    operateur: "Togocel (Yas)",
    couleur:   "#F59E0B",
    couleurBg: "#FFFBEB",
    ussd:      "*145#",
    prefixes:  ["9", "22"],   // 228 9X — Togocel
    logo:      "🟡",
    apiBase:   "https://api.togocel.tg/v1",
  },
  flooz: {
    id:        "flooz",
    nom:       "Flooz",
    operateur: "Moov Africa Togo",
    couleur:   "#2563EB",
    couleurBg: "#EFF6FF",
    ussd:      "*155#",
    prefixes:  ["7", "8"],    // 228 7X / 8X — Moov
    logo:      "🔵",
    apiBase:   "https://api.moov-africa.tg/v1",
  },
};

export const PRIX_MENSUEL_FCFA = 1000;

export interface PaymentRequest {
  operateur:   OperateurType;
  telephone:   string;
  montant:     number;
  reference:   string;
  description: string;
}

export interface PaymentStatus {
  status:    "PENDING" | "SUCCESS" | "FAILED" | "TIMEOUT";
  reference: string;
  message?:  string;
}

export function genReference(op: OperateurType): string {
  const prefix = op === "tmoney" ? "TM" : "FL";
  return `KD-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
}

export function formatTel(tel: string): string {
  return tel.replace(/[\s\-().+]/g, "").replace(/^00228/, "228").replace(/^0/, "228");
}

/** Détecte automatiquement l'opérateur selon le numéro */
export function detecterOperateur(tel: string): OperateurType | null {
  const clean = formatTel(tel);
  if (!/^228/.test(clean) || clean.length !== 11) return null;
  const prefix = clean[3]; // 4e chiffre après 228
  if (["9", "2"].includes(prefix)) return "tmoney";
  if (["7", "8"].includes(prefix)) return "flooz";
  return null;
}

export function validerTelephone(tel: string, op: OperateurType): boolean {
  const clean = formatTel(tel);
  if (!/^228\d{8}$/.test(clean)) return false;
  const detected = detecterOperateur(tel);
  return detected === op || detected !== null; // accepte si numéro valide
}

const API_KEY = process.env.NEXT_PUBLIC_PAYMENT_API_KEY || "DEMO";

export async function initierPaiement(req: PaymentRequest): Promise<{ success: boolean; reference: string; message: string }> {
  // ── MODE DEMO ──
  if (API_KEY === "DEMO") {
    await new Promise((r) => setTimeout(r, 1500));
    return { success: true, reference: req.reference, message: `Demande envoyée sur ${req.telephone}. Validez via ${OPERATEURS[req.operateur].ussd}.` };
  }

  // ── MODE PRODUCTION ──
  const op = OPERATEURS[req.operateur];
  try {
    const res = await fetch(`${op.apiBase}/payment/collect`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        amount:      req.montant,
        currency:    "XOF",
        subscriber:  { phone: formatTel(req.telephone) },
        reference:   req.reference,
        description: req.description,
      }),
    });
    const data = await res.json();
    return { success: res.ok, reference: data.reference || req.reference, message: data.message || "Demande envoyée." };
  } catch {
    return { success: false, reference: req.reference, message: "Erreur réseau. Vérifiez votre connexion." };
  }
}

export async function verifierPaiement(reference: string, operateur: OperateurType, tentative: number): Promise<PaymentStatus> {
  if (API_KEY === "DEMO") {
    await new Promise((r) => setTimeout(r, 2000));
    if (tentative >= 3) return { status: "SUCCESS", reference, message: "Paiement confirmé (démo)" };
    return { status: "PENDING", reference, message: "En attente de confirmation..." };
  }
  const op = OPERATEURS[operateur];
  try {
    const res  = await fetch(`${op.apiBase}/payment/status/${reference}`, { headers: { "Authorization": `Bearer ${API_KEY}` } });
    const data = await res.json();
    return { status: data.status, reference, message: data.message };
  } catch {
    return { status: "PENDING", reference, message: "Vérification en cours..." };
  }
}
