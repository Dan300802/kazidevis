"use client";
import { useState } from "react";
import { Phone, MapPin, Wrench, Edit2, Check, X, Crown, Star } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { METIERS, formatDate } from "@/lib/utils";
import { PremiumScreen } from "@/components/screens/PremiumScreen";

function AbonnementCard() {
  const [showModal, setShowModal] = useState(false);
  const { abonnement, estPremium } = useAppStore();
  const premium = estPremium();

  return (
    <>
      <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ background: premium ? "linear-gradient(135deg, #D97706, #F59E0B)" : "linear-gradient(135deg, #475569, #334155)", padding: "16px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Crown size={20} style={{ color: "#fff" }} />
            <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {premium ? "Abonnement Premium actif" : "Plan Gratuit"}
            </p>
          </div>
          {premium ? (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
              Expire le {abonnement.dateExpiration ? formatDate(abonnement.dateExpiration) : "—"}
            </p>
          ) : (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Export PDF et WhatsApp non disponibles</p>
          )}
        </div>
        <div style={{ background: "#fff", padding: "12px 16px" }}>
          {premium ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Star size={14} style={{ color: "#D97706" }} />
              <p style={{ fontSize: 13, color: "#374151" }}>
                Réf : <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{abonnement.referenceTransaction}</span>
              </p>
            </div>
          ) : (
            <button onClick={() => setShowModal(true)} style={{ width: "100%", padding: "11px", borderRadius: 10, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <Crown size={15} /> Passer Premium — 1 000 FCFA/mois
            </button>
          )}
        </div>
      </div>
      {showModal && <PremiumScreen onClose={() => setShowModal(false)} />}
    </>
  );
}

export function ProfilScreen({ onLogout }: { onLogout?: () => void }) {
  const { artisan, updateArtisan, devis, transactions } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...artisan });

  const save = () => {
    const initiales = form.nom.trim().split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
    updateArtisan({ ...form, initiales });
    setEditing(false);
  };
  const cancel = () => { setForm({ ...artisan }); setEditing(false); };

  const revenus  = transactions.filter((t) => t.type === "revenu").reduce((a, t) => a + t.montant, 0);
  const nbDevis  = devis.length;
  const nbAccept = devis.filter((d) => d.statut === "accepte").length;

  const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 12, fontWeight: 600 as const, color: "#94A3B8", marginBottom: 5, display: "block" as const, textTransform: "uppercase" as const, letterSpacing: "0.04em" };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      {/* TopBar */}
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mon profil</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#F1F5F9", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 600, fontSize: 13, color: "#475569", cursor: "pointer" }}>
            <Edit2 size={14} /> Modifier
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={cancel} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, padding: "8px 12px", color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <X size={16} />
            </button>
            <button onClick={save} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={14} /> Sauvegarder
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: "24px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Avatar & nom */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 8 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #DCFCE7, #BBF7D0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, color: "#15803D", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 14, boxShadow: "0 4px 16px rgba(22,163,74,0.2)" }}>
            {artisan.initiales}
          </div>
          {!editing && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>{artisan.nom}</h2>
              <p style={{ fontSize: 13, color: "#64748B" }}>{artisan.metier} · {artisan.ville}</p>
            </>
          )}
        </div>

        {/* Stats rapides */}
        {!editing && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { label: "Devis", value: String(nbDevis) },
              { label: "Acceptés", value: String(nbAccept) },
              { label: "Revenus", value: `${Math.round(revenus / 1000)}k` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "12px 10px", textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</p>
                <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire ou infos */}
        {editing ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input style={inputStyle} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Métier principal</label>
              <select style={inputStyle} value={form.metier} onChange={(e) => setForm({ ...form, metier: e.target.value })}>
                {METIERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ville / Zone</label>
              <input style={inputStyle} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
            {[
              { Icon: Phone,  label: "Téléphone", value: artisan.telephone },
              { Icon: Wrench, label: "Métier",    value: artisan.metier    },
              { Icon: MapPin, label: "Zone",      value: artisan.ville     },
            ].map(({ Icon, label, value }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderTop: i > 0 ? "1px solid #F8FAFC" : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} style={{ color: "#16A34A" }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Abonnement */}
        <AbonnementCard />

        {/* Déconnexion */}
        {onLogout && (
          <button onClick={() => { if (confirm("Se déconnecter ?")) onLogout(); }} style={{ width: "100%", padding: 13, borderRadius: 14, background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            🚪 Se déconnecter
          </button>
        )}

        {/* Footer app */}
        <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "14px 16px", border: "1px solid #D1FAE5" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#15803D", marginBottom: 4 }}>ArtisanPro · Version 1.0</p>
          <p style={{ fontSize: 12, color: "#16A34A", lineHeight: 1.5 }}>Application de gestion de devis et finances. Vos données sont sauvegardées localement sur votre appareil.</p>
        </div>
      </div>
    </div>
  );
}
