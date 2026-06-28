"use client";
import { useState } from "react";
import { TrendingUp, Plus, ArrowRight, Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, formatDate, totalDevis } from "@/lib/utils";

const STATUT_STYLE: Record<string, { bg:string; color:string; label:string }> = {
  accepte:   { bg:"#F0FDF4", color:"#15803D", label:"Accepté"   },
  envoye:    { bg:"#F1F5F9", color:"#475569", label:"Envoyé"    },
  brouillon: { bg:"#F8FAFC", color:"#94A3B8", label:"Brouillon" },
  refuse:    { bg:"#FEF2F2", color:"#DC2626", label:"Refusé"    },
};

interface Notif { id:string; type:"success"|"warn"|"info"; title:string; msg:string; time:string; read:boolean; }

function genNotifications(devis: any[], transactions: any[]): Notif[] {
  const notifs: Notif[] = [];
  const envoyes = devis.filter(d=>d.statut==="envoye");
  if (envoyes.length>0)
    notifs.push({ id:"n1", type:"warn", title:"Devis en attente", msg:`${envoyes.length} devis attendent une réponse`, time:"Maintenant", read:false });
  const revenus = transactions.filter(t=>t.type==="revenu").reduce((a:number,t:any)=>a+t.montant,0);
  if (revenus>0)
    notifs.push({ id:"n2", type:"success", title:"Paiements reçus", msg:`Total reçu ce mois : ${formatMontant(revenus)}`, time:"Aujourd'hui", read:false });
  const refuses = devis.filter(d=>d.statut==="refuse");
  if (refuses.length>0)
    notifs.push({ id:"n3", type:"info", title:"Devis refusés", msg:`${refuses.length} devis ont été refusés`, time:"Cette semaine", read:true });
  notifs.push({ id:"n4", type:"info", title:"Bienvenue sur KaziDevis !", msg:"Créez votre premier devis professionnel.", time:"Il y a 2 jours", read:true });
  return notifs;
}

export function HomeScreen() {
  const { artisan, devis, transactions, setActiveTab } = useAppStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(() => genNotifications(devis, transactions));

  const unread = notifs.filter(n=>!n.read).length;
  const revenus  = transactions.filter(t=>t.type==="revenu").reduce((a,t)=>a+t.montant,0);
  const depenses = transactions.filter(t=>t.type==="depense").reduce((a,t)=>a+t.montant,0);
  const benefice = revenus - depenses;
  const nbAcceptes = devis.filter(d=>d.statut==="accepte").length;
  const nbEnvoyes  = devis.filter(d=>d.statut==="envoye").length;
  const taux = Math.round((nbAcceptes/Math.max(devis.length,1))*100);

  const mois    = ["Jan","Fév","Mar","Avr","Mai","Jun"];
  const barData = [38,52,44,68,60,100];

  const markAllRead = () => setNotifs(n=>n.map(x=>({...x,read:true})));
  const removeNotif = (id:string) => setNotifs(n=>n.filter(x=>x.id!==id));

  const card: React.CSSProperties = { background:"#fff", borderRadius:12, boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)" };

  const notifIcon = (type: string) => {
    if (type==="success") return <CheckCircle size={16} style={{ color:"#16A34A" }}/>;
    if (type==="warn")    return <AlertCircle size={16} style={{ color:"#D97706" }}/>;
    return <Info size={16} style={{ color:"#2563EB" }}/>;
  };
  const notifBg = (type: string) => type==="success"?"#F0FDF4":type==="warn"?"#FFFBEB":"#EFF6FF";

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:72 }}>
      {/* Header */}
      <div style={{ background:"#fff", padding:"12px 14px", borderBottom:"1px solid #F1F5F9" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", overflow:"hidden", flexShrink:0, border:"2px solid #BBF7D0" }}>
              {artisan.photoUrl ? (
                <img src={artisan.photoUrl} alt="Photo" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              ) : (
                <div style={{ width:"100%", height:"100%", background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"#15803D" }}>
                  {artisan.initiales}
                </div>
              )}
            </div>
            <div>
              <p style={{ fontSize:11, color:"#94A3B8" }}>Bonjour 👋</p>
              <p style={{ fontSize:14, fontWeight:700, color:"#0F172A" }}>{artisan.nom}</p>
            </div>
          </div>

          {/* Cloche notification */}
          <button onClick={()=>setShowNotifs(true)}
            style={{ position:"relative", background:"none", border:"none", cursor:"pointer", padding:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Bell size={22} style={{ color:"#64748B" }}/>
            {unread>0 && (
              <span style={{ position:"absolute", top:2, right:2, width:16, height:16, borderRadius:"50%", background:"#DC2626", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff", border:"1.5px solid #fff" }}>
                {unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Panel notifications */}
      {showNotifs && (
        <div style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.4)" }} onClick={()=>setShowNotifs(false)}>
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"85%", maxWidth:340, background:"#fff", boxShadow:"-4px 0 20px rgba(0,0,0,0.15)", display:"flex", flexDirection:"column" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:"#0F172A" }}>Notifications</p>
                {unread>0 && <p style={{ fontSize:11, color:"#94A3B8" }}>{unread} non lues</p>}
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {unread>0 && <button onClick={markAllRead} style={{ fontSize:11, fontWeight:600, color:"#16A34A", background:"none", border:"none", cursor:"pointer" }}>Tout lire</button>}
                <button onClick={()=>setShowNotifs(false)} style={{ background:"#F1F5F9", border:"none", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <X size={14} style={{ color:"#64748B" }}/>
                </button>
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"10px 12px" }}>
              {notifs.length===0 && (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#94A3B8" }}>
                  <Bell size={32} style={{ margin:"0 auto 10px", opacity:0.3 }}/>
                  <p style={{ fontSize:13 }}>Aucune notification</p>
                </div>
              )}
              {notifs.map(n=>(
                <div key={n.id} style={{ background:n.read?"#fff":notifBg(n.type), borderRadius:12, padding:"11px 12px", marginBottom:8, border:`1px solid ${n.read?"#F1F5F9":n.type==="success"?"#BBF7D0":n.type==="warn"?"#FDE68A":"#BFDBFE"}`, position:"relative" }}>
                  <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                    <div style={{ flexShrink:0, marginTop:1 }}>{notifIcon(n.type)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:"#0F172A", marginBottom:2 }}>{n.title}</p>
                      <p style={{ fontSize:11, color:"#64748B", lineHeight:1.4 }}>{n.msg}</p>
                      <p style={{ fontSize:10, color:"#94A3B8", marginTop:4 }}>{n.time}</p>
                    </div>
                    <button onClick={()=>removeNotif(n.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#CBD5E1", padding:2, flexShrink:0 }}>
                      <X size={12}/>
                    </button>
                  </div>
                  {!n.read && <div style={{ position:"absolute", top:10, left:-4, width:7, height:7, borderRadius:"50%", background:"#16A34A" }}/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:"12px 12px 0" }}>
        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,#16A34A,#15803D)", borderRadius:14, padding:"14px 16px", marginBottom:10, boxShadow:"0 4px 16px rgba(22,163,74,0.25)" }}>
          <p style={{ fontSize:10, color:"#86EFAC", fontWeight:600, letterSpacing:"0.06em", marginBottom:4 }}>BÉNÉFICE NET CE MOIS</p>
          <p style={{ fontSize:28, fontWeight:800, color:"#fff", letterSpacing:-0.5, marginBottom:10 }}>{formatMontant(benefice)}</p>
          <div style={{ display:"flex", background:"rgba(0,0,0,0.15)", borderRadius:8, overflow:"hidden" }}>
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
            { label:"Devis envoyés",    value:String(devis.length), sub:`${nbEnvoyes} en attente`, up:false },
            { label:"Taux acceptation", value:`${taux}%`,           sub:`${nbAcceptes} acceptés`,  up:true  },
          ].map(({ label, value, sub, up })=>(
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
            {barData.map((h,i)=>(
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
          {devis.slice(0,3).map(d=>{
            const s = STATUT_STYLE[d.statut]??STATUT_STYLE.envoye;
            return (
              <button key={d.id} onClick={()=>setActiveTab("devis")}
                style={{ ...card, padding:"11px 12px", border:"none", cursor:"pointer", textAlign:"left", width:"100%", display:"block" }}>
                {d.titre && <p style={{ fontSize:10, color:"#94A3B8", marginBottom:2 }}>{d.titre}</p>}
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
