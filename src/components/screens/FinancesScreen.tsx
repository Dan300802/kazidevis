"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, formatDate, CATEGORIES_DEPENSE, CATEGORIES_REVENU, genId } from "@/lib/utils";
import type { Transaction } from "@/types";

export function FinancesScreen() {
  const [showForm, setShowForm] = useState(false);
  const { transactions, addTransaction, deleteTransaction } = useAppStore();

  const revenus  = transactions.filter((t) => t.type === "revenu").reduce((a, t) => a + t.montant, 0);
  const depenses = transactions.filter((t) => t.type === "depense").reduce((a, t) => a + t.montant, 0);
  const benefice = revenus - depenses;

  const catDepenses = CATEGORIES_DEPENSE.map((cat) => ({
    cat, total: transactions.filter((t) => t.type === "depense" && t.categorie === cat).reduce((a, t) => a + t.montant, 0),
  })).filter((c) => c.total > 0);

  if (showForm) return <AjouterTransaction onBack={() => setShowForm(false)} onSave={(t) => { addTransaction(t); setShowForm(false); }} />;

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      {/* TopBar */}
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Finances</h1>
        <button onClick={() => setShowForm(true)} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Hero bénéfice */}
        <div style={{ background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)", borderRadius: 20, padding: "20px 20px 18px", boxShadow: "0 8px 24px rgba(22,163,74,0.28)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#86EFAC", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Bénéfice net</p>
          <p style={{ fontSize: 34, fontWeight: 800, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.1, marginBottom: 16 }}>{formatMontant(benefice)}</p>
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

        {/* Répartition dépenses */}
        {catDepenses.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Répartition des dépenses</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {catDepenses.map(({ cat, total }) => (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(total)}</span>
                  </div>
                  <div style={{ height: 5, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: "#16A34A", width: `${Math.round((total / depenses) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Transactions récentes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {transactions.map((t) => (
              <div key={t.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: t.type === "revenu" ? "#F0FDF4" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {t.type === "revenu"
                    ? <TrendingUp size={18} style={{ color: "#16A34A" }} />
                    : <TrendingDown size={18} style={{ color: "#DC2626" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>{formatDate(t.date)} · {t.categorie}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: t.type === "revenu" ? "#16A34A" : "#DC2626", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {t.type === "revenu" ? "+" : "−"}{formatMontant(t.montant)}
                  </span>
                  <button onClick={() => { if (confirm("Supprimer ?")) deleteTransaction(t.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", padding: 4, display: "flex" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {!transactions.length && (
              <div style={{ textAlign: "center", paddingTop: 40 }}>
                <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 16 }}>Aucune transaction enregistrée</p>
                <button onClick={() => setShowForm(true)} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 600, cursor: "pointer" }}>Ajouter</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AjouterTransaction({ onBack, onSave }: { onBack: () => void; onSave: (t: Transaction) => void }) {
  const [type, setType]           = useState<"revenu" | "depense">("revenu");
  const [description, setDesc]    = useState("");
  const [montant, setMontant]     = useState("");
  const [categorie, setCategorie] = useState("");
  const [date, setDate]           = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const categories = type === "revenu" ? CATEGORIES_REVENU : CATEGORIES_DEPENSE;
  const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 13, fontWeight: 600 as const, color: "#374151", marginBottom: 6, display: "block" as const };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = "La description est requise";
    if (!montant || Number(montant) <= 0) errs.montant = "Montant invalide";
    if (!categorie) errs.categorie = "Choisissez une catégorie";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ id: genId(), type, description: description.trim(), montant: Number(montant), categorie, date });
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F1F5F9" }}>
        <button onClick={onBack} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ajouter une transaction</h1>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          {/* Type toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {(["revenu", "depense"] as const).map((t) => (
              <button key={t} onClick={() => { setType(t); setCategorie(""); }}
                style={{ padding: "12px", borderRadius: 12, border: `2px solid ${type === t ? (t === "revenu" ? "#86EFAC" : "#FCA5A5") : "#E2E8F0"}`, background: type === t ? (t === "revenu" ? "#F0FDF4" : "#FEF2F2") : "#F8FAFC", color: type === t ? (t === "revenu" ? "#15803D" : "#DC2626") : "#94A3B8", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>
                {t === "revenu" ? "💰 Revenu" : "💸 Dépense"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Description <span style={{ color: "#EF4444" }}>*</span></label>
              <input style={{ ...inputStyle, borderColor: errors.description ? "#FCA5A5" : "#E2E8F0" }} placeholder="Ex: Paiement client Kofi" value={description} onChange={(e) => setDesc(e.target.value)} />
              {errors.description && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.description}</p>}
            </div>
            <div>
              <label style={labelStyle}>Montant (FCFA) <span style={{ color: "#EF4444" }}>*</span></label>
              <input style={{ ...inputStyle, borderColor: errors.montant ? "#FCA5A5" : "#E2E8F0" }} type="number" min="0" placeholder="0" value={montant} onChange={(e) => setMontant(e.target.value)} />
              {errors.montant && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.montant}</p>}
            </div>
            <div>
              <label style={labelStyle}>Catégorie <span style={{ color: "#EF4444" }}>*</span></label>
              <select style={{ ...inputStyle, borderColor: errors.categorie ? "#FCA5A5" : "#E2E8F0" }} value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                <option value="">Choisir une catégorie...</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.categorie && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.categorie}</p>}
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} style={{ width: "100%", padding: "15px", borderRadius: 14, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 16px rgba(22,163,74,0.35)" }}>
          <Plus size={16} /> Enregistrer la transaction
        </button>
      </div>
    </div>
  );
}
