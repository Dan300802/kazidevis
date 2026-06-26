"use client";
import { useState } from "react";
import { Plus, Search, Users, Phone, MapPin, Trash2, ChevronRight, FileText, TrendingUp, Edit2, Check, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, formatDate, totalDevis } from "@/lib/utils";
import { genId } from "@/lib/utils";
import { genInitiales, genCouleur } from "@/lib/clients";
import type { Client } from "@/types";

type View = "list" | "detail" | "nouveau" | "edit";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  border: "1.5px solid #E2E8F0", background: "#fff",
  fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block",
};

function Avatar({ client, size = 44 }: { client: Client; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: client.couleur + "22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.32, color: client.couleur, fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0, border: `2px solid ${client.couleur}33` }}>
      {client.initiales}
    </div>
  );
}

export function ClientsScreen({ uid }: { uid?: string }) {
  const [view, setView]         = useState<View>("list");
  const [selected, setSelected] = useState<Client | null>(null);
  const [search, setSearch]     = useState("");
  const { clients, addClient, updateClient, deleteClient, devis } = useAppStore();

  const filtered = clients.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search) ||
    c.ville?.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "detail" && selected)
    return <FicheClient client={selected} onBack={() => { setView("list"); setSelected(null); }}
      onEdit={() => setView("edit")} onDelete={(id) => { deleteClient(id); setView("list"); setSelected(null); }} />;
  if (view === "nouveau")
    return <FormClient onBack={() => setView("list")} onSave={(c) => { addClient(c); setView("list"); }} />;
  if (view === "edit" && selected)
    return <FormClient client={selected} onBack={() => setView("detail")} onSave={(c) => { updateClient(c); setSelected(c); setView("detail"); }} />;

  // Stats globales
  const totalClients = clients.length;
  const clientsActifs = [...new Set(devis.filter((d) => d.statut === "accepte").map((d) => d.client))].length;

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      {/* TopBar */}
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mes clients</h1>
        <button onClick={() => setView("nouveau")} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Total clients", value: String(totalClients), icon: Users,      color: "#2563EB", bg: "#EFF6FF" },
            { label: "Clients actifs", value: String(clientsActifs), icon: TrendingUp, color: "#16A34A", bg: "#F0FDF4" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 16, padding: "14px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input type="search" placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Liste */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((client) => {
            const devisClient = devis.filter((d) => d.client === client.nom);
            const caTotal     = devisClient.filter((d) => d.statut === "accepte").reduce((a, d) => a + totalDevis(d.lignes), 0);
            const nbDevis     = devisClient.length;
            return (
              <button key={client.id} onClick={() => { setSelected(client); setView("detail"); }}
                style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", border: "none", cursor: "pointer", textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar client={client} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                    {client.nom}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {client.telephone && <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 3 }}><Phone size={10} />{client.telephone}</span>}
                    {client.ville     && <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} />{client.ville}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", background: "#F1F5F9", padding: "2px 8px", borderRadius: 20 }}>
                      {nbDevis} devis
                    </span>
                    {caTotal > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", padding: "2px 8px", borderRadius: 20 }}>
                        {formatMontant(caTotal)}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: "#CBD5E1", flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        {!filtered.length && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <Users size={40} style={{ color: "#E2E8F0", margin: "0 auto 12px" }} />
            <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 16 }}>
              {search ? "Aucun client trouvé" : "Votre carnet est vide"}
            </p>
            {!search && (
              <button onClick={() => setView("nouveau")} style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Ajouter un client
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FicheClient({ client, onBack, onEdit, onDelete }: { client: Client; onBack: () => void; onEdit: () => void; onDelete: (id: string) => void }) {
  const { devis, setActiveTab } = useAppStore();

  const devisClient  = devis.filter((d) => d.client === client.nom);
  const caTotal      = devisClient.filter((d) => d.statut === "accepte").reduce((a, d) => a + totalDevis(d.lignes), 0);
  const nbAcceptes   = devisClient.filter((d) => d.statut === "accepte").length;
  const nbEnAttente  = devisClient.filter((d) => d.statut === "envoye").length;

  const S: Record<string, { bg: string; color: string; label: string }> = {
    accepte:   { bg: "#F0FDF4", color: "#15803D", label: "Accepté"   },
    envoye:    { bg: "#F1F5F9", color: "#475569", label: "Envoyé"    },
    brouillon: { bg: "#F8FAFC", color: "#94A3B8", label: "Brouillon" },
    refuse:    { bg: "#FEF2F2", color: "#DC2626", label: "Refusé"    },
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 80 }}>
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F1F5F9" }}>
        <button onClick={onBack} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1 }}>Fiche client</h1>
        <button onClick={onEdit} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Edit2 size={15} style={{ color: "#64748B" }} />
        </button>
      </div>

      <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Header client */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "20px 16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Avatar client={client} size={64} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>{client.nom}</p>
            {client.metier && <p style={{ fontSize: 13, color: "#64748B" }}>{client.metier}</p>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {client.telephone && (
              <a href={`tel:${client.telephone}`} style={{ display: "flex", alignItems: "center", gap: 6, background: "#F0FDF4", color: "#16A34A", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                <Phone size={14} /> {client.telephone}
              </a>
            )}
            {client.telephone && (
              <a href={`https://wa.me/${client.telephone.replace(/\s+/g,"").replace(/^\+/,"")}`} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#ECFDF5", color: "#059669", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                📱 WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Infos */}
        {(client.adresse || client.ville || client.notes) && (
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
            {client.ville && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: client.notes ? "1px solid #F8FAFC" : "none" }}>
                <MapPin size={16} style={{ color: "#94A3B8", flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "#374151" }}>{client.adresse ? `${client.adresse}, ` : ""}{client.ville}</p>
              </div>
            )}
            {client.notes && (
              <div style={{ padding: "12px 16px" }}>
                <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, fontWeight: 600 }}>NOTES</p>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{client.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Stats CA */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { label: "Devis",      value: String(devisClient.length), color: "#2563EB", bg: "#EFF6FF" },
            { label: "Acceptés",   value: String(nbAcceptes),         color: "#16A34A", bg: "#F0FDF4" },
            { label: "En attente", value: String(nbEnAttente),        color: "#D97706", bg: "#FFFBEB" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "12px 8px", textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</p>
              <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {caTotal > 0 && (
          <div style={{ background: "linear-gradient(135deg, #16A34A, #15803D)", borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 16px rgba(22,163,74,0.25)" }}>
            <div>
              <p style={{ fontSize: 11, color: "#86EFAC", fontWeight: 600, marginBottom: 4 }}>CHIFFRE D'AFFAIRES TOTAL</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(caTotal)}</p>
            </div>
            <TrendingUp size={32} style={{ color: "#86EFAC", opacity: 0.6 }} />
          </div>
        )}

        {/* Historique devis */}
        {devisClient.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Historique des devis
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {devisClient.map((d) => {
                const st = S[d.statut] ?? S.envoye;
                return (
                  <div key={d.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText size={16} style={{ color: "#64748B" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.typeMetier}</p>
                      <p style={{ fontSize: 11, color: "#94A3B8" }}>{d.numero} · {formatDate(d.dateCreation)}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatMontant(totalDevis(d.lignes))}</p>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <button onClick={() => setActiveTab("devis")} style={{ width: "100%", padding: 13, borderRadius: 14, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <Plus size={16} /> Créer un devis pour ce client
        </button>

        <button onClick={() => { if (confirm(`Supprimer ${client.nom} ?`)) onDelete(client.id); }}
          style={{ width: "100%", padding: 12, borderRadius: 14, background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Trash2 size={15} /> Supprimer ce client
        </button>
      </div>
    </div>
  );
}

function FormClient({ client, onBack, onSave }: { client?: Client; onBack: () => void; onSave: (c: Client) => void }) {
  const isEdit = !!client;
  const [form, setForm] = useState({
    nom:      client?.nom      || "",
    telephone:client?.telephone|| "",
    adresse:  client?.adresse  || "",
    ville:    client?.ville    || "",
    metier:   client?.metier   || "",
    notes:    client?.notes    || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.nom.trim()) { setErrors({ nom: "Le nom est requis" }); return; }
    const nom = form.nom.trim();
    onSave({
      id:           client?.id || genId(),
      nom,
      telephone:    form.telephone || undefined,
      adresse:      form.adresse   || undefined,
      ville:        form.ville     || undefined,
      metier:       form.metier    || undefined,
      notes:        form.notes     || undefined,
      dateCreation: client?.dateCreation || new Date().toISOString().slice(0, 10),
      initiales:    genInitiales(nom),
      couleur:      client?.couleur || genCouleur(nom),
    });
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", paddingBottom: 100 }}>
      <div style={{ background: "#fff", padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F1F5F9" }}>
        <button onClick={onBack} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>←</button>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {isEdit ? "Modifier le client" : "Nouveau client"}
        </h1>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Informations</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Nom / Raison sociale <span style={{ color: "#EF4444" }}>*</span></label>
              <input style={{ ...inputStyle, borderColor: errors.nom ? "#FCA5A5" : "#E2E8F0" }} placeholder="Ex: Kofi Mensah" value={form.nom} onChange={f("nom")} />
              {errors.nom && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.nom}</p>}
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} type="tel" placeholder="+228 90 00 00 00" value={form.telephone} onChange={f("telephone")} />
            </div>
            <div>
              <label style={labelStyle}>Type de travaux fréquent</label>
              <input style={inputStyle} placeholder="Ex: Maçonnerie, Couture..." value={form.metier} onChange={f("metier")} />
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Localisation</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Adresse</label>
              <input style={inputStyle} placeholder="Rue, quartier..." value={form.adresse} onChange={f("adresse")} />
            </div>
            <div>
              <label style={labelStyle}>Ville</label>
              <input style={inputStyle} placeholder="Ex: Lomé, Kpalimé..." value={form.ville} onChange={f("ville")} />
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" }}>
          <label style={labelStyle}>Notes</label>
          <textarea placeholder="Préférences, remarques, historique..." value={form.notes} onChange={f("notes")} rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} />
        </div>

        <button onClick={handleSave} style={{ width: "100%", padding: 15, borderRadius: 14, background: "#16A34A", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 4px 16px rgba(22,163,74,0.35)" }}>
          <Check size={16} /> {isEdit ? "Enregistrer les modifications" : "Ajouter le client"}
        </button>
      </div>
    </div>
  );
}
