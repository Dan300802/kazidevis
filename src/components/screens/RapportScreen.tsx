"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Download, BarChart2, Users, Award, Target } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, getMoisNom } from "@/lib/utils";
import { calcRapport, delta } from "@/lib/rapport";
import { BarChart }   from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart }  from "@/components/charts/LineChart";
import { PremiumButton } from "@/components/ui/PremiumGate";

const DONUT_COLORS = ["#16A34A","#2563EB","#D97706","#9333EA","#DC2626","#0891B2"];

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const { pct, positif } = delta(current, previous);
  if (pct === 0) return null;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: positif ? "#16A34A" : "#DC2626", background: positif ? "#F0FDF4" : "#FEF2F2", padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 3 }}>
      {positif ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
      {positif ? "+" : ""}{pct}%
    </span>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} style={{ color: "#16A34A" }} />
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</p>
    </div>
  );
}

export function RapportScreen() {
  const { devis, transactions } = useAppStore();
  const rapport = calcRapport(devis, transactions);
  const { moisActuel, moisPrecedent, last6Months, topClients, topMetiers, repartDepenses, tauxAcceptation, revenuMoyen } = rapport;

  const barDataRevDep = last6Months.map((m) => ({
    label:  getMoisNom(m.key),
    value:  m.revenus,
    value2: m.depenses,
  }));

  const lineDataBenef = last6Months.map((m) => ({
    label: getMoisNom(m.key),
    value: m.benefice,
  }));

  const donutSegments = repartDepenses.slice(0, 5).map((r, i) => ({
    label: r.categorie,
    value: r.total,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const handleExportPDF = () => alert("Export PDF du rapport — en cours d'intégration !");

  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 16, padding: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
    marginBottom: 12,
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      {/* TopBar */}
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Rapport</h1>
        <PremiumButton
          feature="Export PDF rapport"
          description="Téléchargez votre rapport mensuel"
          onClick={handleExportPDF}
          style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: "8px 14px", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", position: "relative" }}
        >
          <Download size={15} /> Exporter
        </PremiumButton>
      </div>

      <div style={{ padding: "14px 16px 0" }}>

        {/* ── KPI mois actuel ── */}
        <div style={{ background: "linear-gradient(135deg, #16A34A, #15803D)", borderRadius: 20, padding: "18px 20px", marginBottom: 12, boxShadow: "0 6px 20px rgba(22,163,74,0.28)" }}>
          <p style={{ fontSize: 11, color: "#86EFAC", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 12 }}>
            {getMoisNom(moisActuel.key).toUpperCase()} — RÉSUMÉ
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Bénéfice net",   value: formatMontant(moisActuel.benefice),  prev: moisPrecedent.benefice,  curr: moisActuel.benefice },
              { label: "Revenus",        value: formatMontant(moisActuel.revenus),   prev: moisPrecedent.revenus,   curr: moisActuel.revenus  },
              { label: "Dépenses",       value: formatMontant(moisActuel.depenses),  prev: moisPrecedent.depenses,  curr: moisActuel.depenses },
              { label: "Devis créés",    value: `${moisActuel.nbDevis} devis`,       prev: moisPrecedent.nbDevis,   curr: moisActuel.nbDevis  },
            ].map(({ label, value, prev, curr }) => (
              <div key={label} style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: "10px 12px" }}>
                <p style={{ fontSize: 10, color: "#86EFAC", fontWeight: 600, marginBottom: 4 }}>{label.toUpperCase()}</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.1 }}>{value}</p>
                <div style={{ marginTop: 4 }}><DeltaBadge current={curr} previous={prev} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Métriques clés ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { label: "Taux d'acceptation", value: `${tauxAcceptation}%`,         icon: Target, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Revenu moy./devis",  value: formatMontant(revenuMoyen),     icon: Award,  color: "#D97706", bg: "#FFFBEB" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 16, padding: "14px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenus vs Dépenses 6 mois ── */}
        <div style={card}>
          <SectionTitle icon={BarChart2} title="Revenus vs Dépenses — 6 mois" />
          <BarChart data={barDataRevDep} height={110} color="#16A34A" color2="#FBBF24" formatValue={(v) => `${Math.round(v/1000)}k`} />
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#16A34A", display: "inline-block" }} /> Revenus
            </span>
            <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#FBBF24cc", display: "inline-block" }} /> Dépenses
            </span>
          </div>
        </div>

        {/* ── Évolution bénéfice ── */}
        <div style={card}>
          <SectionTitle icon={TrendingUp} title="Évolution du bénéfice" />
          <LineChart data={lineDataBenef} height={90} color="#16A34A" />
        </div>

        {/* ── Répartition dépenses ── */}
        {donutSegments.length > 0 && (
          <div style={card}>
            <SectionTitle icon={BarChart2} title="Répartition des dépenses" />
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <DonutChart segments={donutSegments} size={110} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {repartDepenses.slice(0, 5).map(({ categorie, total, pct }, i) => (
                  <div key={categorie}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: DONUT_COLORS[i], display: "inline-block", flexShrink: 0 }} />
                        {categorie}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, background: DONUT_COLORS[i], width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Top clients ── */}
        {topClients.length > 0 && (
          <div style={card}>
            <SectionTitle icon={Users} title="Top clients — CA généré" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topClients.map(({ nom, ca, nbDevis }, i) => {
                const maxCA = topClients[0].ca;
                return (
                  <div key={nom}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: DONUT_COLORS[i % DONUT_COLORS.length] + "22", color: DONUT_COLORS[i % DONUT_COLORS.length], fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                        {nom}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(ca)}</span>
                    </div>
                    <div style={{ height: 5, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, background: DONUT_COLORS[i % DONUT_COLORS.length], width: `${Math.round((ca / maxCA) * 100)}%` }} />
                    </div>
                    <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>{nbDevis} devis accepté(s)</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Top métiers ── */}
        {topMetiers.length > 0 && (
          <div style={card}>
            <SectionTitle icon={Award} title="Revenus par type de travaux" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topMetiers.map(({ metier, ca, nb }, i) => {
                const maxCA = topMetiers[0].ca;
                return (
                  <div key={metier} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: DONUT_COLORS[i % DONUT_COLORS.length] + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 13 }}>
                        {["🧱","🪡","⚡","🔧","🪵","🎨","🪟","🔩","🔧","📦"][i] || "🔧"}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{metier}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(ca)}</span>
                      </div>
                      <div style={{ height: 5, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 99, background: DONUT_COLORS[i % DONUT_COLORS.length], width: `${Math.round((ca / maxCA) * 100)}%` }} />
                      </div>
                      <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{nb} chantier(s)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Historique mensuel ── */}
        <div style={card}>
          <SectionTitle icon={BarChart2} title="Historique mensuel détaillé" />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[...last6Months].reverse().map((m, i) => {
              const { pct: benefPct, positif } = delta(m.benefice, last6Months[Math.max(0, last6Months.length - 2 - i)]?.benefice ?? 0);
              return (
                <div key={m.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 5 ? "1px solid #F8FAFC" : "none" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", textTransform: "capitalize" }}>{getMoisNom(m.key)}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>{m.nbDevis} devis · {m.nbAcceptes} acceptés</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: m.benefice >= 0 ? "#16A34A" : "#DC2626", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(m.benefice)}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>Rev: {formatMontant(m.revenus)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
