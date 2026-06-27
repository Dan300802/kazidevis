"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMontant, formatDate, CATEGORIES_DEPENSE, CATEGORIES_REVENU, genId } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";
import type { Transaction } from "@/types";

const inp: React.CSSProperties = { width:"100%", padding:"11px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:15, color:"#0F172A", outline:"none", boxSizing:"border-box" };
const lbl: React.CSSProperties = { fontSize:11, fontWeight:600, color:"#374151", marginBottom:5, display:"block" };
const card: React.CSSProperties = { background:"#fff", borderRadius:12, boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 3px 8px rgba(0,0,0,0.05)" };

export function FinancesScreen({ uid }: { uid?:string }) {
  const [showForm, setShowForm] = useState(false);
  const { transactions, addTransaction, deleteTransaction } = useAppStore();

  const revenus  = transactions.filter(t=>t.type==="revenu").reduce((a,t)=>a+t.montant,0);
  const depenses = transactions.filter(t=>t.type==="depense").reduce((a,t)=>a+t.montant,0);
  const benefice = revenus - depenses;

  const catDep = CATEGORIES_DEPENSE.map(cat=>({
    cat, total:transactions.filter(t=>t.type==="depense"&&t.categorie===cat).reduce((a,t)=>a+t.montant,0)
  })).filter(c=>c.total>0);

  if (showForm) return <AjouterTx onBack={()=>setShowForm(false)} onSave={t=>{addTransaction(t);setShowForm(false);}}/>;

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:72 }}>
      <TopBar title="Finances" right={
        <button onClick={()=>setShowForm(true)} style={{ background:"#16A34A", color:"#fff", border:"none", borderRadius:10, padding:"7px 12px", fontWeight:600, fontSize:12, display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
          <Plus size={13}/> Ajouter
        </button>
      }/>
      <div style={{ padding:"12px 12px 0", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ background:"linear-gradient(135deg,#16A34A,#15803D)", borderRadius:14, padding:"14px 16px", boxShadow:"0 4px 16px rgba(22,163,74,0.25)" }}>
          <p style={{ fontSize:10, color:"#86EFAC", fontWeight:600, letterSpacing:"0.06em", marginBottom:4 }}>BÉNÉFICE NET</p>
          <p style={{ fontSize:28, fontWeight:800, color:"#fff", marginBottom:10 }}>{formatMontant(benefice)}</p>
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

        {catDep.length>0 && (
          <div style={{ ...card, padding:"12px" }}>
            <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Répartition dépenses</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {catDep.map(({ cat, total })=>(
                <div key={cat}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:12, color:"#374151" }}>{cat}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>{formatMontant(total)}</span>
                  </div>
                  <div style={{ height:4, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:99, background:"#16A34A", width:`${Math.round((total/depenses)*100)}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Transactions récentes</p>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {transactions.map(t=>(
              <div key={t.id} style={{ ...card, padding:"10px 12px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:t.type==="revenu"?"#F0FDF4":"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {t.type==="revenu" ? <TrendingUp size={16} style={{ color:"#16A34A" }}/> : <TrendingDown size={16} style={{ color:"#DC2626" }}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.description}</p>
                  <p style={{ fontSize:10, color:"#94A3B8" }}>{formatDate(t.date)} · {t.categorie}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:14, fontWeight:800, color:t.type==="revenu"?"#16A34A":"#DC2626" }}>
                    {t.type==="revenu"?"+":"−"}{formatMontant(t.montant)}
                  </span>
                  <button onClick={()=>{ if(confirm("Supprimer ?")) deleteTransaction(t.id); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#CBD5E1", padding:4 }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            ))}
            {!transactions.length && (
              <div style={{ textAlign:"center", padding:"32px 0", color:"#94A3B8", fontSize:13 }}>
                Aucune transaction<br/>
                <button onClick={()=>setShowForm(true)} style={{ marginTop:10, background:"#16A34A", color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontWeight:600, fontSize:13, cursor:"pointer" }}>Ajouter</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AjouterTx({ onBack, onSave }: { onBack:()=>void; onSave:(t:Transaction)=>void }) {
  const [type, setType]       = useState<"revenu"|"depense">("revenu");
  const [desc, setDesc]       = useState("");
  const [montant, setMontant] = useState("");
  const [cat, setCat]         = useState("");
  const [date, setDate]       = useState(new Date().toISOString().slice(0,10));
  const [errors, setErrors]   = useState<Record<string,string>>({});

  const cats = type==="revenu" ? CATEGORIES_REVENU : CATEGORIES_DEPENSE;

  const handle = () => {
    const errs: Record<string,string> = {};
    if (!desc.trim()) errs.desc = "Requis";
    if (!montant||Number(montant)<=0) errs.montant = "Invalide";
    if (!cat) errs.cat = "Requis";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ id:genId(), type, description:desc.trim(), montant:Number(montant), categorie:cat, date });
  };

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100%", paddingBottom:80 }}>
      <TopBar title="Ajouter une transaction" onBack={onBack}/>
      <div style={{ padding:"12px 12px 0", display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ ...card, padding:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            {(["revenu","depense"] as const).map(t=>(
              <button key={t} onClick={()=>{ setType(t); setCat(""); }}
                style={{ padding:"10px", borderRadius:10, border:`2px solid ${type===t?(t==="revenu"?"#86EFAC":"#FCA5A5"):"#E2E8F0"}`, background:type===t?(t==="revenu"?"#F0FDF4":"#FEF2F2"):"#F8FAFC", color:type===t?(t==="revenu"?"#15803D":"#DC2626"):"#94A3B8", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {t==="revenu"?"💰 Revenu":"💸 Dépense"}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <label style={lbl}>Description *</label>
              <input style={{ ...inp, borderColor:errors.desc?"#FCA5A5":"#E2E8F0" }} placeholder="Ex: Paiement client" value={desc} onChange={e=>setDesc(e.target.value)}/>
              {errors.desc && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{errors.desc}</p>}
            </div>
            <div>
              <label style={lbl}>Montant (FCFA) *</label>
              <input style={{ ...inp, borderColor:errors.montant?"#FCA5A5":"#E2E8F0" }} type="number" min="0" placeholder="0" value={montant} onChange={e=>setMontant(e.target.value)}/>
              {errors.montant && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{errors.montant}</p>}
            </div>
            <div>
              <label style={lbl}>Catégorie *</label>
              <select style={{ ...inp, borderColor:errors.cat?"#FCA5A5":"#E2E8F0" }} value={cat} onChange={e=>setCat(e.target.value)}>
                <option value="">Choisir...</option>
                {cats.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              {errors.cat && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{errors.cat}</p>}
            </div>
            <div>
              <label style={lbl}>Date</label>
              <input style={inp} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            </div>
          </div>
        </div>
        <button onClick={handle} style={{ width:"100%", padding:"13px", borderRadius:12, background:"#16A34A", color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 4px 14px rgba(22,163,74,0.3)" }}>
          <Plus size={15} style={{ marginRight:6, verticalAlign:"middle" }}/>Enregistrer
        </button>
      </div>
    </div>
  );
}
