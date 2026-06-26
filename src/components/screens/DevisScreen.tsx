"use client";
import { useState } from "react";
import { Plus, Search, FileText, Trash2, Send, ChevronRight, Download, Share2, CreditCard, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, formatDate, totalDevis, METIERS, genId, genNumeroDevis } from "@/lib/utils";
import { exportDevisPDF } from "@/lib/pdf";
import { PremiumButton } from "@/components/ui/PremiumGate";
import { partagerDevisWhatsApp, partagerDevisClient } from "@/lib/whatsapp";
import type { Devis, LigneDevis, DevisStatut, Acompte } from "@/types";

const S: Record<string, { bg: string; color: string; label: string }> = {
  accepte:   { bg: "#F0FDF4", color: "#15803D", label: "Accepté"   },
  envoye:    { bg: "#F1F5F9", color: "#475569", label: "Envoyé"    },
  brouillon: { bg: "#F8FAFC", color: "#94A3B8", label: "Brouillon" },
  refuse:    { bg: "#FEF2F2", color: "#DC2626", label: "Refusé"    },
};

const card: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: "14px 16px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
  border: "none", cursor: "pointer", textAlign: "left", width: "100%", display: "block",
};

type View = "list" | "detail" | "nouveau" | "acomptes";

export function DevisScreen({ uid }: { uid?: string }) {
  const [view, setView]         = useState<View>("list");
  const [selected, setSelected] = useState<Devis | null>(null);
  const [search, setSearch]     = useState("");
  const { devis, addDevis, updateDevis, deleteDevis } = useAppStore();

  const filtered = devis.filter(
    (d) => d.client.toLowerCase().includes(search.toLowerCase()) || d.typeMetier.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "detail" && selected)
    return <DevisDetail devis={selected} onBack={() => { setView("list"); setSelected(null); }}
      onUpdate={(d) => { updateDevis(d); setSelected(d); }}
      onAcomptes={() => setView("acomptes")} />;
  if (view === "nouveau")
    return <NouveauDevis onBack={() => setView("list")} onSave={(d) => { addDevis(d); setView("list"); }} totalDevis={devis.length} />;
  if (view === "acomptes" && selected)
    return <GestionAcomptes devis={selected} onBack={() => { setView("detail"); }}
      onUpdate={(d) => { updateDevis(d); setSelected(d); }} />;

  const groups: { label: string; statuts: DevisStatut[] }[] = [
    { label: "En attente", statuts: ["envoye", "brouillon"] },
    { label: "Acceptés",   statuts: ["accepte"] },
    { label: "Refusés",    statuts: ["refuse"]  },
  ];

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mes devis</h1>
        <button onClick={() => setView("nouveau")} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <Plus size={16} /> Nouveau
        </button>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input type="search" placeholder="Rechercher un devis..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box" }} />
        </div>

        {groups.map(({ label, statuts }) => {
          const items = filtered.filter((d) => statuts.includes(d.statut));
          if (!items.length) return null;
          return (
            <div key={label} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((d) => {
                  const st = S[d.statut] ?? S.envoye;
                  const totalAc = (d.acomptes || []).reduce((a, ac) => a + ac.montant, 0);
                  const total   = totalDevis(d.lignes);
                  const reste   = total - totalAc;
                  return (
                    <button key={d.id} style={card} onClick={() => { setSelected(d); setView("detail"); }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.client}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>
                          {st.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8 }}>{d.numero} · {formatDate(d.dateCreation)} · {d.typeMetier}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: 17, fontWeight: 800, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(total)}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {totalAc > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: reste <= 0 ? "#15803D" : "#854D0E", background: reste <= 0 ? "#F0FDF4" : "#FEF9C3", padding: "2px 8px", borderRadius: 20 }}>
                              {reste <= 0 ? "✓ Soldé" : `Reste ${formatMontant(reste)}`}
                            </span>
                          )}
                          <ChevronRight size={16} style={{ color: "#CBD5E1" }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <FileText size={40} style={{ color: "#E2E8F0", margin: "0 auto 12px" }} />
            <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 16 }}>Aucun devis trouvé</p>
            <button onClick={() => setView("nouveau")} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Créer un devis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DevisDetail({ devis, onBack, onUpdate, onAcomptes }: { devis: Devis; onBack: () => void; onUpdate: (d: Devis) => void; onAcomptes: () => void }) {
  const { deleteDevis, artisan } = useAppStore();
  const [pdfLoading, setPdfLoading] = useState(false);
  const total      = totalDevis(devis.lignes);
  const totalAc    = (devis.acomptes || []).reduce((a, ac) => a + ac.montant, 0);
  const reste      = total - totalAc;
  const st         = S[devis.statut] ?? S.envoye;

  const handlePDF = async () => {
    setPdfLoading(true);
    try { await exportDevisPDF(devis, artisan); }
    finally { setPdfLoading(false); }
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F1F5F9" }}>
        <button onClick={onBack} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1 }}>{devis.numero}</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Client */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Client</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 2 }}>{devis.client}</p>
          {devis.telephone && <p style={{ fontSize: 13, color: "#64748B" }}>{devis.telephone}</p>}
          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{formatDate(devis.dateCreation)} · {devis.typeMetier}</p>
        </div>

        {/* Lignes */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Prestations</p>
          {devis.lignes.map((l, i) => (
            <div key={l.id} style={{ paddingTop: i > 0 ? 10 : 0, marginTop: i > 0 ? 10 : 0, borderTop: i > 0 ? "1px solid #F8FAFC" : "none", display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{l.description}</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>{l.quantite}{l.unite ? ` ${l.unite}` : ""} × {formatMontant(l.prixUnitaire)}</p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#334155", fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 }}>{formatMontant(l.quantite * l.prixUnitaire)}</p>
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "2px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(total)}</span>
          </div>
        </div>

        {/* Acomptes summary */}
        <button onClick={onAcomptes} style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: totalAc > 0 ? 10 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CreditCard size={16} style={{ color: "#16A34A" }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Acomptes & paiements</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>{(devis.acomptes||[]).length} paiement(s) enregistré(s)</p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: "#CBD5E1" }} />
          </div>
          {totalAc > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "8px 10px" }}>
                <p style={{ fontSize: 10, color: "#15803D", fontWeight: 600 }}>PAYÉ</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(totalAc)}</p>
              </div>
              <div style={{ background: reste <= 0 ? "#F0FDF4" : "#FEF9C3", borderRadius: 10, padding: "8px 10px" }}>
                <p style={{ fontSize: 10, color: reste <= 0 ? "#15803D" : "#854D0E", fontWeight: 600 }}>{reste <= 0 ? "SOLDÉ ✓" : "RESTE"}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: reste <= 0 ? "#16A34A" : "#854D0E", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(Math.max(reste, 0))}</p>
              </div>
            </div>
          )}
        </button>

        {/* Statut actions */}
        {devis.statut === "envoye" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => onUpdate({ ...devis, statut: "accepte" })} style={{ padding: 12, borderRadius: 12, border: "1.5px solid #BBF7D0", background: "#F0FDF4", color: "#15803D", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>✓ Accepté</button>
            <button onClick={() => onUpdate({ ...devis, statut: "refuse"  })} style={{ padding: 12, borderRadius: 12, border: "1.5px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>✗ Refusé</button>
          </div>
        )}

        {/* Actions */}
        <PremiumButton
          feature="Export PDF"
          description="Générez des devis professionnels"
          onClick={handlePDF}
          disabled={pdfLoading}
          style={{ width: "100%", padding: 14, borderRadius: 14, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 16px rgba(22,163,74,0.3)", opacity: pdfLoading ? 0.7 : 1 }}
        >
          <Download size={16} /> {pdfLoading ? "Génération PDF..." : "Télécharger en PDF"}
        </PremiumButton>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <PremiumButton
            feature="Partage WhatsApp"
            description="Partagez vos devis facilement"
            onClick={() => partagerDevisWhatsApp(devis, artisan)}
            style={{ padding: 12, borderRadius: 12, border: "1.5px solid #BBF7D0", background: "#F0FDF4", color: "#15803D", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%" }}
          >
            <Share2 size={14} /> Partager
          </PremiumButton>
          {devis.telephone && (
            <PremiumButton
              feature="WhatsApp client"
              description="Envoyez directement au client"
              onClick={() => partagerDevisClient(devis, devis.telephone!, artisan)}
              style={{ padding: 12, borderRadius: 12, border: "1.5px solid #D1FAE5", background: "#ECFDF5", color: "#15803D", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%" }}
            >
              📱 WhatsApp client
            </PremiumButton>
          )}
        </div>

        <button onClick={() => { if (confirm("Supprimer ce devis ?")) { deleteDevis(devis.id); onBack(); } }} style={{ width: "100%", padding: 13, borderRadius: 14, background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Trash2 size={15} /> Supprimer le devis
        </button>
      </div>
    </div>
  );
}

function GestionAcomptes({ devis, onBack, onUpdate }: { devis: Devis; onBack: () => void; onUpdate: (d: Devis) => void }) {
  const [montant, setMontant] = useState("");
  const [note, setNote]       = useState("");
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [error, setError]     = useState("");

  const total    = totalDevis(devis.lignes);
  const acomptes = devis.acomptes || [];
  const totalAc  = acomptes.reduce((a, ac) => a + ac.montant, 0);
  const reste    = total - totalAc;
  const pct      = Math.min((totalAc / total) * 100, 100);

  const ajouterAcompte = () => {
    if (!montant || Number(montant) <= 0) { setError("Montant invalide"); return; }
    if (Number(montant) > reste) { setError(`Maximum : ${formatMontant(reste)}`); return; }
    setError("");
    const updated: Devis = { ...devis, acomptes: [...acomptes, { id: genId(), montant: Number(montant), date, note: note.trim() || undefined }] };
    onUpdate(updated);
    setMontant(""); setNote("");
  };

  const supprimerAcompte = (id: string) => {
    onUpdate({ ...devis, acomptes: acomptes.filter((a) => a.id !== id) });
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F1F5F9" }}>
        <button onClick={onBack} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1 }}>Acomptes</h1>
        <span style={{ fontSize: 12, color: "#64748B" }}>{devis.numero}</span>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Progression */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>TOTAL DEVIS</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(total)}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: reste <= 0 ? "#15803D" : "#854D0E", fontWeight: 600, marginBottom: 2 }}>{reste <= 0 ? "SOLDÉ ✓" : "RESTE À PAYER"}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: reste <= 0 ? "#16A34A" : "#854D0E", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(Math.max(reste, 0))}</p>
            </div>
          </div>
          <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: reste <= 0 ? "#16A34A" : "#FBBF24", width: `${pct}%`, transition: "width 0.4s ease" }} />
          </div>
          <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 6, textAlign: "right" }}>{Math.round(pct)}% payé · {formatMontant(totalAc)} reçu</p>
        </div>

        {/* Ajouter acompte */}
        {reste > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Enregistrer un paiement</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Montant reçu (FCFA) *</label>
                <input type="number" min="0" max={reste} placeholder={`Max: ${formatMontant(reste)}`} value={montant} onChange={(e) => setMontant(e.target.value)}
                  style={{ ...inputStyle, borderColor: error ? "#FCA5A5" : "#E2E8F0" }} />
                {error && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{error}</p>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Note (optionnel)</label>
                <input placeholder="Ex: Virement, espèces, Mobile Money..." value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
              </div>
              <button onClick={ajouterAcompte} style={{ width: "100%", padding: 13, borderRadius: 12, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>
                <Check size={16} /> Enregistrer le paiement
              </button>
            </div>
          </div>
        )}

        {/* Historique */}
        {acomptes.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Historique</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {acomptes.map((ac) => (
                <div key={ac.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CreditCard size={16} style={{ color: "#16A34A" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+{formatMontant(ac.montant)}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>{formatDate(ac.date)}{ac.note ? ` · ${ac.note}` : ""}</p>
                  </div>
                  <button onClick={() => supprimerAcompte(ac.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", padding: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {acomptes.length === 0 && reste > 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#94A3B8", fontSize: 13 }}>
            Aucun paiement enregistré pour ce devis.
          </div>
        )}

        {reste <= 0 && (
          <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "16px", border: "1.5px solid #BBF7D0", textAlign: "center" }}>
            <p style={{ fontSize: 22 }}>🎉</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#15803D", marginTop: 6 }}>Devis entièrement soldé !</p>
            <p style={{ fontSize: 12, color: "#16A34A", marginTop: 4 }}>Tous les paiements ont été reçus.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NouveauDevis({ onBack, onSave, totalDevis: count }: { onBack: () => void; onSave: (d: Devis) => void; totalDevis: number }) {
  const [client, setClient] = useState("");
  const [tel, setTel]       = useState("");
  const [metier, setMetier] = useState(METIERS[0]);
  const [notes, setNotes]   = useState("");
  const [lignes, setLignes] = useState<LigneDevis[]>([{ id: genId(), description: "", quantite: 1, prixUnitaire: 0 }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = lignes.reduce((a, l) => a + l.quantite * l.prixUnitaire, 0);
  const addLigne    = () => setLignes([...lignes, { id: genId(), description: "", quantite: 1, prixUnitaire: 0 }]);
  const removeLigne = (id: string) => setLignes(lignes.filter((l) => l.id !== id));
  const updateLigne = (id: string, field: keyof LigneDevis, value: string | number) =>
    setLignes(lignes.map((l) => l.id === id ? { ...l, [field]: value } : l));

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!client.trim()) errs.client = "Le nom du client est requis";
    if (lignes.some((l) => !l.description.trim())) errs.lignes = "Toutes les lignes doivent avoir une description";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ id: genId(), numero: genNumeroDevis(count), client: client.trim(), telephone: tel, typeMetier: metier, statut: "envoye", lignes, dateCreation: new Date().toISOString().slice(0, 10), notes });
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 100 }}>
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F1F5F9" }}>
        <button onClick={onBack} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nouveau devis</h1>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Informations client</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Nom du client <span style={{ color: "#EF4444" }}>*</span></label>
              <input style={{ ...inputStyle, borderColor: errors.client ? "#FCA5A5" : "#E2E8F0" }} placeholder="Ex: Kofi Mensah" value={client} onChange={(e) => setClient(e.target.value)} />
              {errors.client && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.client}</p>}
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} type="tel" placeholder="+228 90 00 00 00" value={tel} onChange={(e) => setTel(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Type de travail</label>
              <select style={inputStyle} value={metier} onChange={(e) => setMetier(e.target.value)}>
                {METIERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Prestations</p>
            <button onClick={addLigne} style={{ fontSize: 13, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={13} /> Ajouter
            </button>
          </div>
          {errors.lignes && <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 10 }}>{errors.lignes}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lignes.map((l, i) => (
              <div key={l.id} style={{ background: "#F8FAFC", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Ligne {i + 1}</span>
                  {lignes.length > 1 && <button onClick={() => removeLigne(l.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#DC2626" }}><Trash2 size={13} /></button>}
                </div>
                <input placeholder="Description de la prestation" value={l.description} onChange={(e) => updateLigne(l.id, "description", e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 4 }}>Quantité</label>
                    <input type="number" min="1" value={l.quantite} onChange={(e) => updateLigne(l.id, "quantite", Number(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 4 }}>Prix unitaire</label>
                    <input type="number" min="0" value={l.prixUnitaire} onChange={(e) => updateLigne(l.id, "prixUnitaire", Number(e.target.value))} style={inputStyle} />
                  </div>
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", textAlign: "right", marginTop: 8 }}>{formatMontant(l.quantite * l.prixUnitaire)}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "12px 14px", background: "#F0FDF4", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#15803D" }}>Total devis</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(total)}</span>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <label style={labelStyle}>Notes & conditions (optionnel)</label>
          <textarea placeholder="Délais, conditions de paiement, remarques..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} />
        </div>

        <button onClick={handleSave} style={{ width: "100%", padding: 15, borderRadius: 14, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 16px rgba(22,163,74,0.35)" }}>
          <Send size={16} /> Créer et envoyer le devis
        </button>
      </div>
    </div>
  );
}
