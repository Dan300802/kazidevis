"use client";
import { useState } from "react";
import { Crown, Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { PremiumScreen } from "@/components/screens/PremiumScreen";

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
}

/**
 * Wrapper qui bloque l'accès à une feature si l'utilisateur n'est pas premium.
 * Affiche une modale T-Money si click sur la zone bloquée.
 */
export function PremiumGate({ children, feature, description }: PremiumGateProps) {
  const [showModal, setShowModal] = useState(false);
  const estPremium = useAppStore((s) => s.estPremium);

  if (estPremium()) return <>{children}</>;

  return (
    <>
      <div style={{ position: "relative" }}>
        {/* Contenu flouté */}
        <div style={{ pointerEvents: "none", filter: "blur(2px)", opacity: 0.4, userSelect: "none" }}>
          {children}
        </div>

        {/* Overlay cliquable */}
        <button
          onClick={() => setShowModal(true)}
          style={{ position: "absolute", inset: 0, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label={`Débloquer ${feature}`}
        >
          <div style={{ background: "#fff", borderRadius: 16, padding: "14px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 220 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #FEF9C3, #FDE68A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Crown size={20} style={{ color: "#D97706" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", textAlign: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {feature}
            </p>
            {description && <p style={{ fontSize: 11, color: "#64748B", textAlign: "center" }}>{description}</p>}
            <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", padding: "4px 12px", borderRadius: 20 }}>
              Premium · 1 000 FCFA/mois
            </span>
          </div>
        </button>
      </div>

      {showModal && <PremiumScreen onClose={() => setShowModal(false)} />}
    </>
  );
}

/** Bouton qui déclenche le paywall si pas premium */
export function PremiumButton({
  onClick, children, style, feature, description, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { feature: string; description?: string }) {
  const [showModal, setShowModal] = useState(false);
  const estPremium = useAppStore((s) => s.estPremium);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!estPremium()) { e.preventDefault(); setShowModal(true); return; }
    onClick?.(e);
  };

  return (
    <>
      <button onClick={handleClick} style={{ ...style, position: "relative" }} {...props}>
        {!estPremium() && (
          <Lock size={13} style={{ position: "absolute", top: 6, right: 6, color: "rgba(255,255,255,0.8)" }} />
        )}
        {children}
      </button>
      {showModal && <PremiumScreen onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); onClick?.(undefined as any); }} />}
    </>
  );
}
