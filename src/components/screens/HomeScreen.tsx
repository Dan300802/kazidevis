"use client";
import { TrendingUp, TrendingDown, Plus, ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, formatDate, totalDevis, STATUT_COLOR, STATUT_LABEL } from "@/lib/utils";

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  accepte:   { bg: "#F0FDF4", color: "#15803D", label: "Accepté"   },
  envoye:    { bg: "#F1F5F9", color: "#475569", label: "Envoyé"    },
  brouillon: { bg: "#F8FAFC", color: "#94A3B8", label: "Brouillon" },
  refuse:    { bg: "#FEF2F2", color: "#DC2626", label: "Refusé"    },
};

export function HomeScreen() {
  const { artisan, devis, transactions, setActiveTab } = useAppStore();

  const revenus  = transactions.filter(t => t.type === "revenu").reduce((a,t) => a+t.montant, 0);
  const depenses = transactions.filter(t => t.type === "depense").reduce((a,t) => a+t.montant, 0);
  const benefice = revenus - depenses;
  const nbAcceptes = devis.filter(d => d.statut === "accepte").length;
  const nbEnvoyes  = devis.filter(d => d.statut === "envoye").length;
  const taux = Math.round((nbAcceptes / Math.max(devis.length,1)) * 100);

  const mois    = ["Jan","Fév","Mar","Avr","Mai","Jun"];
  const barData = [38,52,44,68,60,100];

  const card: React.CSSProperties = { background:"#fff", borderRadius:12, boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)" };

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:72 }}>
      {/* Header */}
      <div style={{ background:"#fff", padding:"14px 14px 12px", borderBottom:"1px solid #F1F5F9" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"#15803D", flexShrink:0 }}>
            {artisan.initiales}
          </div>
          <div>
            <p style={{ fontSize:11, color:"#94A3B8" }}>Bonjour 👋</p>
            <p style={{ fontSize:14, fontWeight:700, color:"#0F172A" }}>{artisan.nom}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:"12px 12px 0" }}>
        {/* Hero bénéfice */}
        <div style={{ background:"linear-gradient(135deg,#16A34A,#15803D)", borderRadius:14, padding:"14px 16px", marginBottom:10, boxShadow:"0 4px 16px rgba(22,163,74,0.25)" }}>
          <p style={{ fontSize:10, color:"#86EFAC", fontWeight:600, letterSpacing:"0.06em", marginBottom:4 }}>BÉNÉFICE NET CE MOIS</p>
          <p style={{ fontSize:28, fontWeight:800, color:"#fff", letterSpacing:-0.5, marginBottom:10 }}>{formatMontant(benefice)}</p>
          <div style={{ display:"flex", gap:0, background:"rgba(0,0,0,0.15)", borderRadius:8, overflow:"hidden" }}>
            <div style={{ flex:1, padding:"8px 10px" }}>
              <p style={{ fontSize:9, color:"#86EFAC", fontWeight:600, marginBottom:2 }}>REVENUS</p>
              <p style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{formatMontant(revenus)}</p>
            </div>
            <div style={{ width:1, background:"rgba(255,255,255,0.15)" }}/>
            <div style={{ flex:1, padding:"8px 10px" }}>
              <p style={{ fontSize:9, color:"#86EFAC", fontWeight:600, marginBottom:2 }}>DÉPENSES</p>
              <p style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{formatMontant(depenses)}</p>
            </div>
          </div>
        </div>

        {/* Métriques */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
          {[
            { label:"Devis envoyés",      value:String(devis.length), sub:`${nbEnvoyes} en attente` },
            { label:"Taux acceptation",   value:`${taux}%`,           sub:`${nbAcceptes} acceptés`, up:true },
          ].map(({ label, value, sub, up }) => (
            <div key={label} style={{ ...card, padding:"12px" }}>
              <p style={{ fontSize:10, color:"#94A3B8", marginBottom:4 }}>{label}</p>
              <p style={{ fontSize:20, fontWeight:800, color:"#0F172A", lineHeight:1 }}>{value}</p>
              <p style={{ fontSize:10, color:up?"#16A34A":"#64748B", marginTop:3, display:"flex", alignItems:"center", gap:3 }}>
                {up && <TrendingUp size={9}/>}{sub}
              </p>
            </div>
          ))}
        </div>

        {/* Graphique */}
        <div style={{ ...card, padding:"12px", marginBottom:10 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>Revenus — 6 mois</p>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:56 }}>
            {barData.map((h,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%", justifyContent:"flex-end" }}>
                <div style={{ width:"100%", height:`${h}%`, borderRadius:"3px 3px 0 0", background:h===100?"#16A34A":"#BBF7D0", minHeight:3 }}/>
                <span style={{ fontSize:8, color:"#CBD5E1" }}>{mois[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Devis récents */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Devis récents</p>
          <button onClick={()=>setActiveTab("devis")} style={{ fontSize:11, fontWeight:600, color:"#16A34A", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
            Voir tout <ArrowRight size={11}/>
          </button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {devis.slice(0,3).map(d => {
            const s = STATUT_STYLE[d.statut] ?? STATUT_STYLE.envoye;
            return (
              <button key={d.id} onClick={()=>setActiveTab("devis")}
                style={{ ...card, padding:"11px 12px", border:"none", cursor:"pointer", textAlign:"left", width:"100%", display:"block" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:3 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{d.client}</p>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:s.bg, color:s.color, flexShrink:0 }}>{s.label}</span>
                </div>
                <p style={{ fontSize:10, color:"#94A3B8", marginBottom:5 }}>{formatDate(d.dateCreation)} · {d.typeMetier}</p>
                <p style={{ fontSize:15, fontWeight:800, color:"#16A34A" }}>{formatMontant(totalDevis(d.lignes))}</p>
              </button>
            );
          })}
        </div>

        <button onClick={()=>setActiveTab("devis")}
          style={{ width:"100%", padding:"11px", borderRadius:12, border:"1.5px dashed #BBF7D0", background:"#F0FDF4", color:"#16A34A", fontWeight:600, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6, cursor:"pointer", marginTop:8 }}>
          <Plus size={14}/> Créer un nouveau devis
        </button>
      </div>
    </div>
  );
}
