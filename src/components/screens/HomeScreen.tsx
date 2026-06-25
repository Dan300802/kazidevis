"use client";
import { TrendingUp, TrendingDown, Plus, ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, formatDate, totalDevis } from "@/lib/utils";

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  accepte:  { bg: "#F0FDF4", color: "#15803D", label: "Accepté"  },
  envoye:   { bg: "#F1F5F9", color: "#475569", label: "Envoyé"   },
  brouillon:{ bg: "#F8FAFC", color: "#94A3B8", label: "Brouillon"},
  refuse:   { bg: "#FEF2F2", color: "#DC2626", label: "Refusé"   },
};

export function HomeScreen() {
  const { artisan, devis, transactions, setActiveTab } = useAppStore();

  const revenus  = transactions.filter((t) => t.type === "revenu").reduce((a, t) => a + t.montant, 0);
  const depenses = transactions.filter((t) => t.type === "depense").reduce((a, t) => a + t.montant, 0);
  const benefice = revenus - depenses;
  const nbAcceptes = devis.filter((d) => d.statut === "accepte").length;
  const nbEnvoyes  = devis.filter((d) => d.statut === "envoye").length;
  const tauxAccept = Math.round((nbAcceptes / Math.max(devis.length, 1)) * 100);

  const mois    = ["Jan","Fév","Mar","Avr","Mai","Jun"];
  const barData = [38, 52, 44, 68, 60, 100];
  const maxBar  = Math.max(...barData);

  return (
    <div style={{ paddingBottom: 80, background: "#F8FAFC", minHeight: "100%" }}>

      {/* ── Header ── */}
      <div style={{ background: "#fff", paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 16, borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#DCFCE7", color: "#15803D",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
            flexShrink: 0,
          }}>
            {artisan.initiales}
          </div>
          <div>
            <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 1 }}>Bonjour 👋</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2 }}>
              {artisan.nom}
            </h2>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* ── Hero card bénéfice ── */}
        <div style={{
          background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
          borderRadius: 20, padding: "20px 20px 18px",
          marginBottom: 12,
          boxShadow: "0 8px 24px rgba(22,163,74,0.28)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#86EFAC", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            Bénéfice net ce mois
          </p>
          <p style={{ fontSize: 34, fontWeight: 800, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.1, marginBottom: 16 }}>
            {formatMontant(benefice)}
          </p>
          <div style={{ display: "flex", gap: 0, background: "rgba(0,0,0,0.15)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ flex: 1, padding: "10px 14px" }}>
              <p style={{ fontSize: 10, color: "#86EFAC", fontWeight: 600, marginBottom: 3 }}>REVENUS</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(revenus)}</p>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ flex: 1, padding: "10px 14px" }}>
              <p style={{ fontSize: 10, color: "#86EFAC", fontWeight: 600, marginBottom: 3 }}>DÉPENSES</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(depenses)}</p>
            </div>
          </div>
        </div>

        {/* ── 2 métriques ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { label: "Devis envoyés", value: String(devis.length), sub: `${nbEnvoyes} en attente`, icon: null },
            { label: "Taux d'acceptation", value: `${tauxAccept}%`, sub: `${nbAcceptes} acceptés`, trend: "up" as const },
          ].map(({ label, value, sub, trend }) => (
            <div key={label} style={{
              background: "#fff", borderRadius: 16, padding: "14px 14px 12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
            }}>
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: 11, color: trend === "up" ? "#16A34A" : "#64748B", marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
                {trend === "up" && <TrendingUp size={10} />}
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Graphique ── */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "16px 16px 12px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
            Revenus — 6 mois
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64 }}>
            {barData.map((h, i) => {
              const isMax = h === maxBar;
              const pct   = h / maxBar;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{
                    width: "100%",
                    height: Math.max(pct * 52, 4),
                    borderRadius: "4px 4px 2px 2px",
                    background: isMax ? "#16A34A" : "#D1FAE5",
                    transition: "height 0.3s ease",
                  }} />
                  <span style={{ fontSize: 9, color: "#CBD5E1", fontWeight: 500 }}>{mois[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Devis récents ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Devis récents
          </p>
          <button
            onClick={() => setActiveTab("devis")}
            style={{ fontSize: 12, fontWeight: 600, color: "#16A34A", display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
          >
            Voir tout <ArrowRight size={12} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {devis.slice(0, 3).map((d) => {
            const s = STATUT_STYLE[d.statut] ?? STATUT_STYLE.envoye;
            return (
              <button
                key={d.id}
                onClick={() => setActiveTab("devis")}
                style={{
                  background: "#fff", borderRadius: 16, padding: "14px 16px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
                  border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                  display: "block",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.client}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                    background: s.bg, color: s.color, flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    {s.label}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>
                  {formatDate(d.dateCreation)} · {d.typeMetier}
                </p>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {formatMontant(totalDevis(d.lignes))}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── CTA ── */}
        <button
          onClick={() => setActiveTab("devis")}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 14,
            border: "1.5px dashed #D1FAE5", background: "#F0FDF4",
            color: "#16A34A", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 4,
          }}
        >
          <Plus size={16} /> Créer un nouveau devis
        </button>

      </div>
    </div>
  );
}
