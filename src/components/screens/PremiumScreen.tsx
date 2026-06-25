"use client";
import { useState, useEffect, useRef } from "react";
import { Check, X, Loader2, Crown, Shield, Download, Share2, BarChart3, Star, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { OPERATEURS, PRIX_MENSUEL_FCFA, genReference, formatTel, detecterOperateur, initierPaiement, verifierPaiement } from "@/lib/tmoney";
import type { OperateurType } from "@/lib/tmoney";
import { formatDate } from "@/lib/utils";

type Step = "offre" | "choix_operateur" | "telephone" | "attente" | "succes" | "echec";

interface PremiumScreenProps { onClose: () => void; onSuccess?: () => void; }

const AVANTAGES = [
  { icon: Download,  label: "Export PDF illimité",        sub: "Devis professionnels en un clic"  },
  { icon: Share2,    label: "Partage WhatsApp illimité",  sub: "Envoyez à vos clients directement" },
  { icon: BarChart3, label: "Rapport mensuel complet",    sub: "Statistiques et graphiques"        },
  { icon: Shield,    label: "Données sauvegardées",       sub: "Accès sécurisé en tout temps"      },
  { icon: Star,      label: "Nouvelles fonctionnalités",  sub: "Mises à jour prioritaires"         },
];

export function PremiumScreen({ onClose, onSuccess }: PremiumScreenProps) {
  const [step,      setStep]      = useState<Step>("offre");
  const [operateur, setOperateur] = useState<OperateurType>("tmoney");
  const [telephone, setTelephone] = useState("");
  const [telError,  setTelError]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState("");
  const [reference, setReference] = useState("");
  const [tentative, setTentative] = useState(0);
  const [countdown, setCountdown] = useState(180);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { activerPremium, abonnement } = useAppStore();

  const op = OPERATEURS[operateur];

  // Auto-detect opérateur selon numéro
  const handleTelChange = (val: string) => {
    setTelephone(val);
    setTelError("");
    const detected = detecterOperateur(val);
    if (detected) setOperateur(detected);
  };

  // Décompte
  useEffect(() => {
    if (step !== "attente") return;
    const t = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(t); setStep("echec"); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [step]);

  // Polling
  useEffect(() => {
    if (step !== "attente") { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    let n = 0;
    intervalRef.current = setInterval(async () => {
      n++; setTentative(n);
      const res = await verifierPaiement(reference, operateur, n);
      setMessage(res.message || "");
      if (res.status === "SUCCESS") {
        clearInterval(intervalRef.current!);
        activerPremium(reference, telephone);
        setStep("succes"); onSuccess?.();
      } else if (res.status === "FAILED") {
        clearInterval(intervalRef.current!); setStep("echec");
      }
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [step, reference]);

  const handlePayer = async () => {
    if (!telephone.trim()) { setTelError("Entrez votre numéro de téléphone"); return; }
    if (telephone.replace(/\s/g,"").length < 8) { setTelError("Numéro invalide"); return; }
    setTelError(""); setLoading(true);
    const ref = genReference(operateur);
    setReference(ref);
    const res = await initierPaiement({ operateur, telephone, montant: PRIX_MENSUEL_FCFA, reference: ref, description: "KaziDevis Premium — 1 mois" });
    setLoading(false);
    if (res.success) { setStep("attente"); setMessage(res.message); }
    else setMessage(res.message);
  };

  const mins = String(Math.floor(countdown / 60)).padStart(2, "0");
  const secs = String(countdown % 60).padStart(2, "0");

  const overlay: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.55)" };
  const sheet: React.CSSProperties  = { width: "100%", maxWidth: 430, background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "94dvh", overflowY: "auto", paddingBottom: 28 };

  return (
    <div style={overlay}>
      <div style={sheet}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
          <div style={{ width: 36, height: 4, background: "#E2E8F0", borderRadius: 99 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px 0" }}>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} style={{ color: "#64748B" }} />
          </button>
        </div>

        {/* ── OFFRE ── */}
        {step === "offre" && (
          <div style={{ padding: "8px 20px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#FEF9C3,#FDE68A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 4px 16px rgba(234,179,8,0.3)" }}>
                <Crown size={30} style={{ color: "#D97706" }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 6 }}>Passer à Premium</h2>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>Débloquez toutes les fonctionnalités pour développer votre activité</p>
            </div>

            {/* Prix */}
            <div style={{ background: "linear-gradient(135deg,#16A34A,#15803D)", borderRadius: 18, padding: "18px 20px", marginBottom: 20, textAlign: "center", boxShadow: "0 6px 20px rgba(22,163,74,0.3)" }}>
              <p style={{ color: "#BBF7D0", fontSize: 11, fontWeight: 700, marginBottom: 4, letterSpacing: "0.06em" }}>ABONNEMENT MENSUEL</p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: "#fff", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>1 000</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#86EFAC" }}>FCFA</span>
              </div>
              <p style={{ color: "#86EFAC", fontSize: 12, marginTop: 4 }}>par mois · Annulable à tout moment</p>
            </div>

            {/* Avantages */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {AVANTAGES.map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} style={{ color: "#16A34A" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{label}</p>
                    <p style={{ fontSize: 12, color: "#94A3B8" }}>{sub}</p>
                  </div>
                  <Check size={15} style={{ color: "#16A34A", flexShrink: 0 }} />
                </div>
              ))}
            </div>

            <button onClick={() => setStep("choix_operateur")} style={{ width: "100%", padding: 16, borderRadius: 14, background: "#16A34A", color: "#fff", border: "none", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 6px 20px rgba(22,163,74,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Crown size={18} /> Souscrire maintenant
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginTop: 10 }}>Paiement Mobile Money sécurisé · Togo</p>
          </div>
        )}

        {/* ── CHOIX OPÉRATEUR ── */}
        {step === "choix_operateur" && (
          <div style={{ padding: "8px 20px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>ÉTAPE 1 / 2</p>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 6 }}>Choisir le mode de paiement</h2>
              <p style={{ fontSize: 13, color: "#64748B" }}>Sélectionnez votre opérateur Mobile Money</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {(Object.values(OPERATEURS) as typeof OPERATEURS[OperateurType][]).map((o) => (
                <button
                  key={o.id}
                  onClick={() => { setOperateur(o.id); setStep("telephone"); }}
                  style={{ background: "#fff", border: `2px solid ${operateur === o.id ? o.couleur : "#E2E8F0"}`, borderRadius: 16, padding: "16px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, transition: "all 0.15s" }}
                >
                  {/* Logo/couleur opérateur */}
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: o.couleurBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${o.couleur}33` }}>
                    <span style={{ fontSize: 26 }}>{o.logo}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 2 }}>{o.nom}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{o.operateur}</p>
                    <p style={{ fontSize: 11, color: o.couleur, fontWeight: 600, marginTop: 4 }}>Composer {o.ussd} pour valider</p>
                  </div>
                  <ChevronRight size={18} style={{ color: "#CBD5E1", flexShrink: 0 }} />
                </button>
              ))}
            </div>

            {/* Infos */}
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
                💡 <strong>Comment ça marche :</strong> Vous entrez votre numéro, vous recevez une demande de paiement sur votre téléphone, vous validez avec votre code secret, et votre abonnement est activé automatiquement.
              </p>
            </div>

            <button onClick={() => setStep("offre")} style={{ width: "100%", padding: 13, borderRadius: 12, background: "#F1F5F9", color: "#64748B", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              ← Retour
            </button>
          </div>
        )}

        {/* ── SAISIE TÉLÉPHONE ── */}
        {step === "telephone" && (
          <div style={{ padding: "8px 20px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>ÉTAPE 2 / 2</p>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: op.couleurBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: `1.5px solid ${op.couleur}44` }}>
                <span style={{ fontSize: 30 }}>{op.logo}</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4 }}>
                Payer via {op.nom}
              </h2>
              <p style={{ fontSize: 12, color: "#64748B" }}>{op.operateur}</p>
            </div>

            {/* Récap */}
            <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #BBF7D0" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>KaziDevis Premium</p>
                <p style={{ fontSize: 11, color: "#64748B" }}>1 mois d'accès complet</p>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#16A34A", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>1 000 FCFA</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Numéro {op.nom} *
              </label>
              <input
                type="tel"
                placeholder="+228 90 00 00 00"
                value={telephone}
                onChange={(e) => handleTelChange(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${telError ? "#FCA5A5" : op.couleur + "66"}`, background: "#fff", fontSize: 16, color: "#0F172A", outline: "none", boxSizing: "border-box", letterSpacing: "0.04em" }}
              />
              {telError && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 6 }}>{telError}</p>}
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>
                {op.id === "tmoney" ? "Numéros Togocel : 228 9X XXX XXXX" : "Numéros Moov : 228 7X/8X XXX XXXX"}
              </p>
            </div>

            {message && <p style={{ fontSize: 13, color: "#DC2626", marginBottom: 12, textAlign: "center" }}>{message}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
              <button onClick={() => setStep("choix_operateur")} style={{ padding: 14, borderRadius: 12, background: "#F1F5F9", color: "#64748B", border: "none", fontWeight: 600, cursor: "pointer" }}>
                ← Retour
              </button>
              <button onClick={handlePayer} disabled={loading} style={{ padding: 14, borderRadius: 12, background: op.couleur, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Traitement...</> : `Payer via ${op.nom}`}
              </button>
            </div>

            {/* Changer d'opérateur */}
            <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 14 }}>
              Mauvais opérateur ?{" "}
              <button onClick={() => setStep("choix_operateur")} style={{ background: "none", border: "none", color: "#16A34A", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Changer
              </button>
            </p>
          </div>
        )}

        {/* ── ATTENTE ── */}
        {step === "attente" && (
          <div style={{ padding: "16px 20px 0", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: op.couleurBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `3px solid ${op.couleur}44` }}>
              <Loader2 size={32} style={{ color: op.couleur, animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8 }}>
              En attente de paiement
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20, lineHeight: 1.6 }}>
              Demande envoyée à <strong>{telephone}</strong> via <strong style={{ color: op.couleur }}>{op.nom}</strong>.<br/>Validez sur votre téléphone.
            </p>

            {/* Instructions par opérateur */}
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "14px 16px", marginBottom: 20, textAlign: "left" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Comment valider ({op.nom}) :</p>
              {[
                `Composez ${op.ussd} sur votre téléphone`,
                op.id === "tmoney" ? "Sélectionnez « Payer » puis « Marchands »" : "Sélectionnez « Paiement marchand »",
                `Validez la demande de ${PRIX_MENSUEL_FCFA} FCFA pour KaziDevis`,
                "Entrez votre code secret pour confirmer",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: op.couleur, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</span>
                  <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{s}</p>
                </div>
              ))}
            </div>

            {/* Référence */}
            <div style={{ background: "#F1F5F9", borderRadius: 10, padding: "8px 12px", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "#64748B" }}>Référence</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>{reference}</span>
            </div>

            {message && <p style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>{message}</p>}

            <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 18 }}>
              Expire dans <span style={{ fontWeight: 700, color: countdown < 30 ? "#DC2626" : "#0F172A" }}>{mins}:{secs}</span>
            </p>

            <button onClick={() => setStep("echec")} style={{ padding: "10px 20px", borderRadius: 10, background: "#FEF2F2", color: "#DC2626", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Annuler
            </button>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ── SUCCÈS ── */}
        {step === "succes" && (
          <div style={{ padding: "16px 20px 0", textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8 }}>Bienvenue Premium !</h2>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 8 }}>
              Paiement confirmé via <strong style={{ color: op.couleur }}>{op.nom}</strong>
            </p>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>
              Abonnement actif jusqu'au{" "}
              <strong style={{ color: "#0F172A" }}>{abonnement.dateExpiration ? formatDate(abonnement.dateExpiration) : "—"}</strong>
            </p>
            <div style={{ background: "#F0FDF4", borderRadius: 16, padding: 16, marginBottom: 24, textAlign: "left" }}>
              {AVANTAGES.map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Check size={14} style={{ color: "#16A34A", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{label}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{ width: "100%", padding: 15, borderRadius: 14, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 6px 20px rgba(22,163,74,0.35)" }}>
              Commencer à utiliser Premium
            </button>
          </div>
        )}

        {/* ── ÉCHEC ── */}
        {step === "echec" && (
          <div style={{ padding: "16px 20px 0", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>😔</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8 }}>Paiement non reçu</h2>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24, lineHeight: 1.6 }}>
              Nous n'avons pas reçu la confirmation de votre paiement {op.nom}. Vérifiez votre solde et réessayez.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={onClose} style={{ padding: 13, borderRadius: 12, background: "#F1F5F9", color: "#64748B", border: "none", fontWeight: 600, cursor: "pointer" }}>Fermer</button>
              <button onClick={() => { setStep("choix_operateur"); setCountdown(180); setTentative(0); }} style={{ padding: 13, borderRadius: 12, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>Réessayer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
