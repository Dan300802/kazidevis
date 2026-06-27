"use client";
import { useState } from "react";
import { Phone, MapPin, Wrench, Edit2, Check, X, Crown, Star } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { METIERS, formatDate } from "@/lib/utils";
import { PremiumScreen } from "@/components/screens/PremiumScreen";
import { TopBar } from "@/components/layout/TopBar";
import { updateProfil } from "@/lib/firebaseAuth";

const inp: React.CSSProperties = { width:"100%", padding:"11px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:15, color:"#0F172A", outline:"none", boxSizing:"border-box" };
const lbl: React.CSSProperties = { fontSize:10, fontWeight:600, color:"#94A3B8", textTransform:"uppercase" as const, letterSpacing:"0.05em", display:"block" as const, marginBottom:4 };
const card: React.CSSProperties = { background:"#fff", borderRadius:12, boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)" };

function AbonnementCard() {
  const [showModal, setShowModal] = useState(false);
  const { abonnement, estPremium } = useAppStore();
  const premium = estPremium();
  return (
    <>
      <div style={{ borderRadius:12, overflow:"hidden", boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ background:premium?"linear-gradient(135deg,#D97706,#F59E0B)":"linear-gradient(135deg,#475569,#334155)", padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <Crown size={16} style={{ color:"#fff" }}/>
            <p style={{ fontSize:13, fontWeight:800, color:"#fff" }}>{premium?"Premium actif":"Plan Gratuit"}</p>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>
            {premium ? `Expire le ${abonnement.dateExpiration ? formatDate(abonnement.dateExpiration) : "—"}` : "Export PDF et WhatsApp non disponibles"}
          </p>
        </div>
        <div style={{ background:"#fff", padding:"10px 14px" }}>
          {premium ? (
            <p style={{ fontSize:11, color:"#64748B", display:"flex", alignItems:"center", gap:6 }}>
              <Star size={12} style={{ color:"#D97706" }}/> Réf : {abonnement.referenceTransaction}
            </p>
          ) : (
            <button onClick={()=>setShowModal(true)} style={{ width:"100%", padding:"10px", borderRadius:10, background:"#16A34A", color:"#fff", border:"none", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Crown size={13}/> Passer Premium — 1 000 FCFA/mois
            </button>
          )}
        </div>
      </div>
      {showModal && <PremiumScreen onClose={()=>setShowModal(false)}/>}
    </>
  );
}

export function ProfilScreen({ onLogout, uid }: { onLogout?:()=>void; uid?:string }) {
  const { artisan, updateArtisan, devis, transactions } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...artisan });

  const save = async () => {
    const initiales = form.nom.trim().split(" ").map((w:string)=>w[0]).slice(0,2).join("").toUpperCase();
    updateArtisan({ ...form, initiales });
    if (uid) { try { await updateProfil(uid, { ...form, initiales }); } catch {} }
    setEditing(false);
  };

  const revenus = transactions.filter(t=>t.type==="revenu").reduce((a,t)=>a+t.montant,0);
  const nbDevis = devis.length;
  const nbAccept = devis.filter(d=>d.statut==="accepte").length;

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:72 }}>
      <TopBar title="Mon profil" right={
        editing ? (
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>{setForm({...artisan});setEditing(false);}} style={{ background:"#F1F5F9", border:"none", borderRadius:8, padding:"6px 10px", color:"#64748B", cursor:"pointer", display:"flex", alignItems:"center" }}><X size={14}/></button>
            <button onClick={save} style={{ background:"#16A34A", color:"#fff", border:"none", borderRadius:8, padding:"6px 12px", fontWeight:600, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><Check size={13}/>Sauver</button>
          </div>
        ) : (
          <button onClick={()=>setEditing(true)} style={{ background:"#F1F5F9", border:"none", borderRadius:8, padding:"6px 12px", fontWeight:600, fontSize:12, color:"#475569", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><Edit2 size={13}/>Modifier</button>
        )
      }/>

      <div style={{ padding:"14px 12px 0", display:"flex", flexDirection:"column", gap:10 }}>
        {/* Avatar */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingBottom:4 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,#DCFCE7,#BBF7D0)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:22, color:"#15803D", marginBottom:10, boxShadow:"0 3px 12px rgba(22,163,74,0.2)" }}>
            {artisan.initiales}
          </div>
          {!editing && (
            <>
              <p style={{ fontSize:16, fontWeight:800, color:"#0F172A", marginBottom:2 }}>{artisan.nom}</p>
              <p style={{ fontSize:12, color:"#64748B" }}>{artisan.metier} · {artisan.ville}</p>
            </>
          )}
        </div>

        {/* Stats */}
        {!editing && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7 }}>
            {[
              { label:"Devis",    value:String(nbDevis)  },
              { label:"Acceptés", value:String(nbAccept) },
              { label:"Revenus",  value:`${Math.round(revenus/1000)}k` },
            ].map(({ label, value })=>(
              <div key={label} style={{ ...card, padding:"10px 8px", textAlign:"center" }}>
                <p style={{ fontSize:18, fontWeight:800, color:"#0F172A" }}>{value}</p>
                <p style={{ fontSize:10, color:"#94A3B8" }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire ou infos */}
        {editing ? (
          <div style={{ ...card, padding:14, display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { label:"Nom complet",    val:form.nom,       set:(v:string)=>setForm({...form,nom:v}),       type:"text" },
              { label:"Téléphone",      val:form.telephone, set:(v:string)=>setForm({...form,telephone:v}), type:"tel"  },
              { label:"Ville / Zone",   val:form.ville,     set:(v:string)=>setForm({...form,ville:v}),     type:"text" },
            ].map(({ label, val, set, type })=>(
              <div key={label}>
                <label style={lbl}>{label}</label>
                <input style={inp} type={type} value={val} onChange={e=>set(e.target.value)}/>
              </div>
            ))}
            <div>
              <label style={lbl}>Métier</label>
              <select style={inp} value={form.metier} onChange={e=>setForm({...form,metier:e.target.value})}>
                {METIERS.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div style={{ ...card, overflow:"hidden" }}>
            {[
              { Icon:Phone,  label:"Téléphone", value:artisan.telephone },
              { Icon:Wrench, label:"Métier",    value:artisan.metier    },
              { Icon:MapPin, label:"Zone",       value:artisan.ville     },
            ].map(({ Icon, label, value }, i)=>(
              <div key={label} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderTop:i>0?"1px solid #F8FAFC":"none" }}>
                <div style={{ width:34, height:34, borderRadius:9, background:"#F0FDF4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={15} style={{ color:"#16A34A" }}/>
                </div>
                <div>
                  <p style={{ fontSize:10, color:"#94A3B8", marginBottom:1 }}>{label}</p>
                  <p style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <AbonnementCard/>

        {onLogout && (
          <button onClick={()=>{ if(confirm("Se déconnecter ?")) onLogout(); }} style={{ width:"100%", padding:"11px", borderRadius:12, background:"#FEF2F2", color:"#DC2626", border:"1.5px solid #FECACA", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            🚪 Se déconnecter
          </button>
        )}

        <div style={{ background:"#F0FDF4", borderRadius:12, padding:"12px 14px", border:"1px solid #D1FAE5" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#15803D", marginBottom:3 }}>KaziDevis · Version 1.0</p>
          <p style={{ fontSize:11, color:"#16A34A", lineHeight:1.5 }}>Application de gestion de devis pour artisans au Togo.</p>
        </div>
      </div>
    </div>
  );
}
