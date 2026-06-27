"use client";
import { useState } from "react";
import { Plus, Search, FileText, Trash2, Send, ChevronRight, Download, Share2, CreditCard, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, formatDate, totalDevis, METIERS, genId, genNumeroDevis } from "@/lib/utils";
import { exportDevisPDF } from "@/lib/pdf";
import { partagerDevisWhatsApp, partagerDevisClient } from "@/lib/whatsapp";
import { PremiumButton } from "@/components/ui/PremiumGate";
import { TopBar } from "@/components/layout/TopBar";
import type { Devis, LigneDevis, DevisStatut, Acompte } from "@/types";

const S: Record<string, { bg:string; color:string; label:string }> = {
  accepte:   { bg:"#F0FDF4", color:"#15803D", label:"Accepté"   },
  envoye:    { bg:"#F1F5F9", color:"#475569", label:"Envoyé"    },
  brouillon: { bg:"#F8FAFC", color:"#94A3B8", label:"Brouillon" },
  refuse:    { bg:"#FEF2F2", color:"#DC2626", label:"Refusé"    },
};

const card: React.CSSProperties = { background:"#fff", borderRadius:12, padding:"11px 13px", boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)", border:"none", cursor:"pointer", textAlign:"left", width:"100%", display:"block" };
const inp: React.CSSProperties  = { width:"100%", padding:"11px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:15, color:"#0F172A", outline:"none", boxSizing:"border-box" as const };
const lbl: React.CSSProperties  = { fontSize:11, fontWeight:600 as const, color:"#374151", marginBottom:5, display:"block" as const };

type View = "list"|"detail"|"nouveau"|"acomptes";

export function DevisScreen({ uid }: { uid?:string }) {
  const [view, setView]         = useState<View>("list");
  const [selected, setSelected] = useState<Devis|null>(null);
  const [search, setSearch]     = useState("");
  const { devis, addDevis, updateDevis, deleteDevis } = useAppStore();

  const filtered = devis.filter(d =>
    d.client.toLowerCase().includes(search.toLowerCase()) ||
    d.typeMetier.toLowerCase().includes(search.toLowerCase()) ||
    (d.titre||"").toLowerCase().includes(search.toLowerCase())
  );

  if (view==="detail" && selected)
    return <DevisDetail devis={selected} onBack={()=>{setView("list");setSelected(null);}}
      onUpdate={d=>{updateDevis(d);setSelected(d);}} onAcomptes={()=>setView("acomptes")}/>;
  if (view==="nouveau")
    return <NouveauDevis onBack={()=>setView("list")} onSave={d=>{addDevis(d);setView("list");}} totalDevis={devis.length}/>;
  if (view==="acomptes" && selected)
    return <GestionAcomptes devis={selected} onBack={()=>setView("detail")} onUpdate={d=>{updateDevis(d);setSelected(d);}}/>;

  const groups: { label:string; statuts:DevisStatut[] }[] = [
    { label:"En attente", statuts:["envoye","brouillon"] },
    { label:"Acceptés",   statuts:["accepte"]            },
    { label:"Refusés",    statuts:["refuse"]              },
  ];

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:72 }}>
      <TopBar title="Mes devis" right={
        <button onClick={()=>setView("nouveau")} style={{ background:"#16A34A", color:"#fff", border:"none", borderRadius:10, padding:"7px 12px", fontWeight:600, fontSize:12, display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
          <Plus size={13}/> Nouveau
        </button>
      }/>
      <div style={{ padding:"10px 12px 0" }}>
        <div style={{ position:"relative", marginBottom:12 }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
          <input type="search" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ ...inp, paddingLeft:32, background:"#fff" }}/>
        </div>

        {groups.map(({ label, statuts })=>{
          const items = filtered.filter(d=>statuts.includes(d.statut));
          if (!items.length) return null;
          return (
            <div key={label} style={{ marginBottom:16 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:7 }}>{label}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {items.map(d=>{
                  const st = S[d.statut]??S.envoye;
                  const totalAc = (d.acomptes||[]).reduce((a,ac)=>a+ac.montant,0);
                  const total   = totalDevis(d.lignes);
                  const reste   = total - totalAc;
                  return (
                    <button key={d.id} style={card} onClick={()=>{setSelected(d);setView("detail");}}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:3 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          {d.titre && <p style={{ fontSize:10, color:"#94A3B8", marginBottom:1 }}>{d.titre}</p>}
                          <p style={{ fontSize:13, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.client}</p>
                        </div>
                        <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:st.bg, color:st.color, flexShrink:0 }}>{st.label}</span>
                      </div>
                      <p style={{ fontSize:10, color:"#94A3B8", marginBottom:6 }}>{d.numero} · {formatDate(d.dateCreation)} · {d.typeMetier}</p>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <p style={{ fontSize:15, fontWeight:800, color:"#16A34A" }}>{formatMontant(total)}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          {totalAc>0 && <span style={{ fontSize:10, fontWeight:600, color:reste<=0?"#15803D":"#854D0E", background:reste<=0?"#F0FDF4":"#FEF9C3", padding:"2px 7px", borderRadius:20 }}>{reste<=0?"✓ Soldé":`Reste ${formatMontant(reste)}`}</span>}
                          <ChevronRight size={14} style={{ color:"#CBD5E1" }}/>
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
          <div style={{ textAlign:"center", paddingTop:48 }}>
            <FileText size={36} style={{ color:"#E2E8F0", margin:"0 auto 10px" }}/>
            <p style={{ color:"#94A3B8", fontSize:13, marginBottom:14 }}>Aucun devis trouvé</p>
            <button onClick={()=>setView("nouveau")} style={{ background:"#16A34A", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:600, fontSize:13, cursor:"pointer" }}>Créer un devis</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DevisDetail({ devis, onBack, onUpdate, onAcomptes }: { devis:Devis; onBack:()=>void; onUpdate:(d:Devis)=>void; onAcomptes:()=>void }) {
  const { deleteDevis, artisan } = useAppStore();
  const [pdfLoading, setPdfLoading] = useState(false);
  const total   = totalDevis(devis.lignes);
  const totalAc = (devis.acomptes||[]).reduce((a,ac)=>a+ac.montant,0);
  const reste   = total - totalAc;
  const st      = S[devis.statut]??S.envoye;

  const handlePDF = async () => {
    setPdfLoading(true);
    try { await exportDevisPDF(devis, artisan); }
    catch(e) { console.error(e); alert("Erreur PDF. Réessayez."); }
    finally { setPdfLoading(false); }
  };

  const c: React.CSSProperties = { background:"#fff", borderRadius:12, padding:"13px", boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)" };

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:80 }}>
      <TopBar title={devis.numero} onBack={onBack} right={<span style={{ fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20, background:st.bg, color:st.color }}>{st.label}</span>}/>
      <div style={{ padding:"10px 12px 0", display:"flex", flexDirection:"column", gap:9 }}>
        {/* Client */}
        <div style={c}>
          {devis.titre && <p style={{ fontSize:11, color:"#94A3B8", marginBottom:3 }}>{devis.titre}</p>}
          <p style={{ fontSize:15, fontWeight:700, color:"#0F172A", marginBottom:2 }}>{devis.client}</p>
          {devis.telephone && <p style={{ fontSize:12, color:"#64748B" }}>{devis.telephone}</p>}
          <p style={{ fontSize:11, color:"#94A3B8", marginTop:3 }}>{formatDate(devis.dateCreation)} · {devis.typeMetier}</p>
        </div>

        {/* Lignes */}
        <div style={c}>
          <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Prestations</p>
          {devis.lignes.map((l,i)=>(
            <div key={l.id} style={{ paddingTop:i>0?9:0, marginTop:i>0?9:0, borderTop:i>0?"1px solid #F8FAFC":"none", display:"flex", justifyContent:"space-between", gap:8 }}>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#0F172A", marginBottom:1 }}>{l.description}</p>
                <p style={{ fontSize:10, color:"#94A3B8" }}>{l.quantite}{l.unite?` ${l.unite}`:""} × {formatMontant(l.prixUnitaire)}</p>
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:"#334155", flexShrink:0 }}>{formatMontant(l.quantite*l.prixUnitaire)}</p>
            </div>
          ))}
          <div style={{ marginTop:12, paddingTop:12, borderTop:"2px solid #F1F5F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#64748B" }}>Total</span>
            <span style={{ fontSize:20, fontWeight:800, color:"#16A34A" }}>{formatMontant(total)}</span>
          </div>
        </div>

        {/* Acomptes */}
        <button onClick={onAcomptes} style={{ ...c, border:"none", cursor:"pointer", textAlign:"left", width:"100%", display:"block" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:totalAc>0?9:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:"#F0FDF4", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <CreditCard size={14} style={{ color:"#16A34A" }}/>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>Acomptes & paiements</p>
                <p style={{ fontSize:10, color:"#94A3B8" }}>{(devis.acomptes||[]).length} paiement(s)</p>
              </div>
            </div>
            <ChevronRight size={14} style={{ color:"#CBD5E1" }}/>
          </div>
          {totalAc>0 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
              <div style={{ background:"#F0FDF4", borderRadius:9, padding:"7px 10px" }}>
                <p style={{ fontSize:9, color:"#15803D", fontWeight:600 }}>PAYÉ</p>
                <p style={{ fontSize:13, fontWeight:700, color:"#16A34A" }}>{formatMontant(totalAc)}</p>
              </div>
              <div style={{ background:reste<=0?"#F0FDF4":"#FEF9C3", borderRadius:9, padding:"7px 10px" }}>
                <p style={{ fontSize:9, color:reste<=0?"#15803D":"#854D0E", fontWeight:600 }}>{reste<=0?"SOLDÉ ✓":"RESTE"}</p>
                <p style={{ fontSize:13, fontWeight:700, color:reste<=0?"#16A34A":"#854D0E" }}>{formatMontant(Math.max(reste,0))}</p>
              </div>
            </div>
          )}
        </button>

        {devis.statut==="envoye" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
            <button onClick={()=>onUpdate({...devis,statut:"accepte"})} style={{ padding:11, borderRadius:10, border:"1.5px solid #BBF7D0", background:"#F0FDF4", color:"#15803D", fontWeight:700, fontSize:13, cursor:"pointer" }}>✓ Accepté</button>
            <button onClick={()=>onUpdate({...devis,statut:"refuse"})}  style={{ padding:11, borderRadius:10, border:"1.5px solid #FECACA", background:"#FEF2F2", color:"#DC2626", fontWeight:700, fontSize:13, cursor:"pointer" }}>✗ Refusé</button>
          </div>
        )}

        <PremiumButton feature="Export PDF" description="Générez des devis professionnels" onClick={handlePDF} disabled={pdfLoading}
          style={{ width:"100%", padding:"12px", borderRadius:12, background:"#16A34A", color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(22,163,74,0.3)", opacity:pdfLoading?0.7:1, position:"relative" }}>
          <Download size={15}/> {pdfLoading?"Génération...":"Télécharger PDF"}
        </PremiumButton>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
          <PremiumButton feature="Partage WhatsApp" description="Partagez vos devis" onClick={()=>partagerDevisWhatsApp(devis,artisan)}
            style={{ padding:11, borderRadius:10, border:"1.5px solid #BBF7D0", background:"#F0FDF4", color:"#15803D", fontWeight:600, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, width:"100%", position:"relative" }}>
            <Share2 size={13}/> Partager
          </PremiumButton>
          {devis.telephone && (
            <PremiumButton feature="WhatsApp client" description="Envoyez au client" onClick={()=>partagerDevisClient(devis,devis.telephone!,artisan)}
              style={{ padding:11, borderRadius:10, border:"1.5px solid #D1FAE5", background:"#ECFDF5", color:"#15803D", fontWeight:600, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, width:"100%", position:"relative" }}>
              📱 Client
            </PremiumButton>
          )}
        </div>

        <button onClick={()=>{ if(confirm("Supprimer ce devis ?")){ deleteDevis(devis.id); onBack(); } }}
          style={{ width:"100%", padding:"11px", borderRadius:12, background:"#FEF2F2", color:"#DC2626", border:"1.5px solid #FECACA", fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          <Trash2 size={14}/> Supprimer
        </button>
      </div>
    </div>
  );
}

function GestionAcomptes({ devis, onBack, onUpdate }: { devis:Devis; onBack:()=>void; onUpdate:(d:Devis)=>void }) {
  const [montant, setMontant] = useState("");
  const [note,    setNote]    = useState("");
  const [date,    setDate]    = useState(new Date().toISOString().slice(0,10));
  const [error,   setError]   = useState("");

  const total    = totalDevis(devis.lignes);
  const acomptes = devis.acomptes||[];
  const totalAc  = acomptes.reduce((a,ac)=>a+ac.montant,0);
  const reste    = total - totalAc;
  const pct      = Math.min((totalAc/total)*100,100);

  const ajouter = () => {
    if (!montant||Number(montant)<=0) { setError("Montant invalide"); return; }
    if (Number(montant)>reste)        { setError(`Max: ${formatMontant(reste)}`); return; }
    setError("");
    onUpdate({ ...devis, acomptes:[...acomptes, { id:genId(), montant:Number(montant), date, note:note.trim()||undefined }] });
    setMontant(""); setNote("");
  };

  const c: React.CSSProperties = { background:"#fff", borderRadius:12, padding:"13px", boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)" };

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:80 }}>
      <TopBar title="Acomptes" onBack={onBack} right={<span style={{ fontSize:11, color:"#64748B" }}>{devis.numero}</span>}/>
      <div style={{ padding:"10px 12px 0", display:"flex", flexDirection:"column", gap:9 }}>
        <div style={c}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:9 }}>
            <div>
              <p style={{ fontSize:10, color:"#94A3B8", fontWeight:600, marginBottom:2 }}>TOTAL</p>
              <p style={{ fontSize:18, fontWeight:800, color:"#0F172A" }}>{formatMontant(total)}</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:10, color:reste<=0?"#15803D":"#854D0E", fontWeight:600, marginBottom:2 }}>{reste<=0?"SOLDÉ ✓":"RESTE"}</p>
              <p style={{ fontSize:18, fontWeight:800, color:reste<=0?"#16A34A":"#854D0E" }}>{formatMontant(Math.max(reste,0))}</p>
            </div>
          </div>
          <div style={{ height:7, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:99, background:reste<=0?"#16A34A":"#FBBF24", width:`${pct}%`, transition:"width 0.4s ease" }}/>
          </div>
          <p style={{ fontSize:10, color:"#94A3B8", marginTop:5, textAlign:"right" }}>{Math.round(pct)}% payé · {formatMontant(totalAc)} reçu</p>
        </div>

        {reste>0 && (
          <div style={c}>
            <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>Enregistrer un paiement</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={lbl}>Montant reçu (FCFA) *</label>
                <input type="number" min="0" value={montant} onChange={e=>setMontant(e.target.value)}
                  placeholder={`Max: ${formatMontant(reste)}`} style={{ ...inp, borderColor:error?"#FCA5A5":"#E2E8F0" }}/>
                {error && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{error}</p>}
              </div>
              <div>
                <label style={lbl}>Note (optionnel)</label>
                <input placeholder="Ex: Virement, espèces, Mobile Money..." value={note} onChange={e=>setNote(e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={lbl}>Date</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/>
              </div>
              <button onClick={ajouter} style={{ width:"100%", padding:"12px", borderRadius:12, background:"#16A34A", color:"#fff", border:"none", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(22,163,74,0.3)" }}>
                <Check size={15}/> Enregistrer le paiement
              </button>
            </div>
          </div>
        )}

        {acomptes.length>0 && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Historique</p>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {acomptes.map(ac=>(
                <div key={ac.id} style={{ background:"#fff", borderRadius:12, padding:"10px 13px", boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:"#F0FDF4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <CreditCard size={15} style={{ color:"#16A34A" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#16A34A" }}>+{formatMontant(ac.montant)}</p>
                    <p style={{ fontSize:10, color:"#94A3B8" }}>{formatDate(ac.date)}{ac.note?` · ${ac.note}`:""}</p>
                  </div>
                  <button onClick={()=>onUpdate({...devis,acomptes:acomptes.filter(a=>a.id!==ac.id)})}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"#CBD5E1", padding:4 }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {reste<=0 && (
          <div style={{ background:"#F0FDF4", borderRadius:12, padding:"14px", border:"1.5px solid #BBF7D0", textAlign:"center" }}>
            <p style={{ fontSize:22, marginBottom:6 }}>🎉</p>
            <p style={{ fontSize:14, fontWeight:700, color:"#15803D" }}>Devis entièrement soldé !</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NouveauDevis({ onBack, onSave, totalDevis: count }: { onBack:()=>void; onSave:(d:Devis)=>void; totalDevis:number }) {
  const [titre,  setTitre]  = useState("");
  const [client, setClient] = useState("");
  const [tel,    setTel]    = useState("");
  const [metier, setMetier] = useState(METIERS[0]);
  const [notes,  setNotes]  = useState("");
  const [lignes, setLignes] = useState<LigneDevis[]>([{ id:genId(), description:"", quantite:1, prixUnitaire:0 }]);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const total = lignes.reduce((a,l)=>a+l.quantite*l.prixUnitaire,0);
  const addLigne    = () => setLignes([...lignes, { id:genId(), description:"", quantite:1, prixUnitaire:0 }]);
  const removeLigne = (id:string) => setLignes(lignes.filter(l=>l.id!==id));
  const updateLigne = (id:string, field:keyof LigneDevis, value:string|number) =>
    setLignes(lignes.map(l=>l.id===id?{...l,[field]:value}:l));

  const handleSave = () => {
    const errs: Record<string,string> = {};
    if (!client.trim()) errs.client = "Le nom du client est requis";
    if (lignes.some(l=>!l.description.trim())) errs.lignes = "Toutes les lignes doivent avoir une description";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ id:genId(), numero:genNumeroDevis(count), titre:titre.trim()||undefined, client:client.trim(), telephone:tel, typeMetier:metier, statut:"envoye", lignes, dateCreation:new Date().toISOString().slice(0,10), notes });
  };

  const c: React.CSSProperties = { background:"#fff", borderRadius:12, padding:"13px", boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)" };

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:100 }}>
      <TopBar title="Nouveau devis" onBack={onBack}/>
      <div style={{ padding:"10px 12px 0", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={c}>
          <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>Informations client</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <label style={lbl}>Titre du devis (optionnel)</label>
              <input style={inp} placeholder="Ex: Travaux maison Mensah" value={titre} onChange={e=>setTitre(e.target.value)}/>
            </div>
            <div>
              <label style={lbl}>Nom du client *</label>
              <input style={{ ...inp, borderColor:errors.client?"#FCA5A5":"#E2E8F0" }} placeholder="Ex: Kofi Mensah" value={client} onChange={e=>setClient(e.target.value)}/>
              {errors.client && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{errors.client}</p>}
            </div>
            <div>
              <label style={lbl}>Téléphone</label>
              <input style={inp} type="tel" placeholder="+228 90 00 00 00" value={tel} onChange={e=>setTel(e.target.value)}/>
            </div>
            <div>
              <label style={lbl}>Type de travail</label>
              <select style={inp} value={metier} onChange={e=>setMetier(e.target.value)}>
                {METIERS.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={c}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Prestations</p>
            <button onClick={addLigne} style={{ fontSize:12, fontWeight:700, color:"#16A34A", background:"#F0FDF4", border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
              <Plus size={12}/> Ajouter
            </button>
          </div>
          {errors.lignes && <p style={{ fontSize:11, color:"#DC2626", marginBottom:8 }}>{errors.lignes}</p>}
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {lignes.map((l,i)=>(
              <div key={l.id} style={{ background:"#F8FAFC", borderRadius:10, padding:11 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:"#64748B" }}>Ligne {i+1}</span>
                  {lignes.length>1 && (
                    <button onClick={()=>removeLigne(l.id)} style={{ background:"#FEF2F2", border:"none", borderRadius:7, padding:"3px 7px", cursor:"pointer", color:"#DC2626" }}>
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
                <input placeholder="Description" value={l.description} onChange={e=>updateLigne(l.id,"description",e.target.value)} style={{ ...inp, marginBottom:7 }}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                  <div>
                    <label style={{ ...lbl, fontSize:10 }}>Quantité</label>
                    <input type="number" min="1" value={l.quantite} onChange={e=>updateLigne(l.id,"quantite",Number(e.target.value))} style={inp}/>
                  </div>
                  <div>
                    <label style={{ ...lbl, fontSize:10 }}>Prix unitaire</label>
                    <input type="number" min="0" value={l.prixUnitaire} onChange={e=>updateLigne(l.id,"prixUnitaire",Number(e.target.value))} style={inp}/>
                  </div>
                </div>
                <p style={{ fontSize:11, fontWeight:700, color:"#16A34A", textAlign:"right", marginTop:6 }}>{formatMontant(l.quantite*l.prixUnitaire)}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, padding:"11px 13px", background:"#F0FDF4", borderRadius:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#15803D" }}>Total</span>
            <span style={{ fontSize:20, fontWeight:800, color:"#16A34A" }}>{formatMontant(total)}</span>
          </div>
        </div>

        <div style={c}>
          <label style={lbl}>Notes & conditions (optionnel)</label>
          <textarea placeholder="Délais, conditions de paiement..." value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
            style={{ ...inp, resize:"none", lineHeight:1.6 }}/>
        </div>

        <button onClick={handleSave} style={{ width:"100%", padding:"13px", borderRadius:12, background:"#16A34A", color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(22,163,74,0.3)" }}>
          <Send size={15}/> Créer et envoyer le devis
        </button>
      </div>
    </div>
  );
}
