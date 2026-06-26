"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { inscrire, connecter } from "@/lib/firebaseAuth";
import { getInitiales } from "@/lib/auth";
import { genCouleur } from "@/lib/clients";
import { METIERS } from "@/lib/auth";

const inp: React.CSSProperties = {
  width:"100%", padding:"12px 14px", borderRadius:10,
  border:"1.5px solid #E2E8F0", background:"#fff",
  fontSize:15, color:"#0F172A", outline:"none",
  fontFamily:"sans-serif", boxSizing:"border-box",
};
const lbl: React.CSSProperties = {
  fontSize:11, fontWeight:600, color:"#64748B",
  textTransform:"uppercase", letterSpacing:"0.05em",
  display:"block", marginBottom:5,
};
const btnG: React.CSSProperties = {
  width:"100%", padding:"13px", borderRadius:12,
  background:"linear-gradient(135deg,#16A34A,#15803D)",
  color:"#fff", border:"none", fontWeight:700, fontSize:15,
  cursor:"pointer", fontFamily:"sans-serif",
};

function PwInput({ placeholder, value, onChange }: { placeholder:string; value:string; onChange:(v:string)=>void }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <input type={show?"text":"password"} placeholder={placeholder} value={value}
        onChange={(e)=>onChange(e.target.value)}
        style={{ ...inp, paddingRight:44 }} />
      <button onClick={()=>setShow(!show)} type="button"
        style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94A3B8", display:"flex", padding:4 }}>
        {show ? <EyeOff size={16}/> : <Eye size={16}/>}
      </button>
    </div>
  );
}

export function AuthScreen({ onAuth }: { onAuth:(user:any)=>void }) {
  const [view, setView] = useState<"login"|"register"|"success">("login");
  const [regUser, setRegUser] = useState<any>(null);
  return (
    <div style={{ minHeight:"100dvh", background:"#F8FAFC" }}>
      {view==="login"    && <LoginView    onRegister={()=>setView("register")} onAuth={onAuth} />}
      {view==="register" && <RegisterView onLogin={()=>setView("login")} onSuccess={(u)=>{ setRegUser(u); setView("success"); onAuth(u); }} />}
      {view==="success"  && regUser && <SuccessView onStart={()=>onAuth(regUser)} />}
    </div>
  );
}

function LoginView({ onRegister, onAuth }: { onRegister:()=>void; onAuth:(u:any)=>void }) {
  const [email, setEmail]   = useState("");
  const [pw,    setPw]      = useState("");
  const [err,   setErr]     = useState("");
  const [loading, setLoad]  = useState(false);

  const handle = async () => {
    if (!email.trim()||!pw) { setErr("Remplissez tous les champs"); return; }
    setLoad(true); setErr("");
    try { const u = await connecter(email.trim(), pw); onAuth(u); }
    catch(e:any) { setErr(e.code==="auth/invalid-credential"?"Email ou mot de passe incorrect":"Erreur de connexion"); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight:"100dvh", display:"flex", flexDirection:"column" }}>
      {/* Header compact */}
      <div style={{ background:"linear-gradient(135deg,#14532D,#16A34A)", padding:"32px 24px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
        {/* Logo SANS cadre */}
        <img src="/logo.png" alt="KaziDevis" style={{ width:72, height:72, objectFit:"contain" }} />
        <div style={{ textAlign:"center" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:1, justifyContent:"center" }}>
            <span style={{ fontSize:26, fontWeight:800, color:"#fff", fontFamily:"sans-serif" }}>Kazi</span>
            <span style={{ fontSize:26, fontWeight:800, color:"#FBBF24", fontFamily:"sans-serif" }}>Devis</span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:2 }}>Connectez-vous à votre espace</p>
        </div>
      </div>

      <div style={{ flex:1, padding:"20px 16px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:18, boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" placeholder="votre@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom:8 }}>
            <label style={lbl}>Mot de passe</label>
            <PwInput placeholder="••••••••" value={pw} onChange={setPw} />
          </div>
          {err && <p style={{ fontSize:12, color:"#DC2626", margin:"8px 0" }}>{err}</p>}
          <button style={{ ...btnG, marginTop:14, opacity:loading?0.7:1 }} onClick={handle} disabled={loading}>
            {loading?"Connexion...":"Se connecter"}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"14px 0", color:"#94A3B8", fontSize:12 }}>
            <div style={{ flex:1, height:1, background:"#E2E8F0" }}/><span>ou</span><div style={{ flex:1, height:1, background:"#E2E8F0" }}/>
          </div>
          <button style={{ width:"100%", padding:"12px", borderRadius:12, background:"#fff", color:"#16A34A", border:"2px solid #16A34A", fontWeight:700, fontSize:14, cursor:"pointer" }} onClick={onRegister}>
            Créer un compte
          </button>
        </div>
        <p style={{ textAlign:"center", fontSize:11, color:"#94A3B8", marginTop:16 }}>Vos données sont sécurisées sur Firebase</p>
      </div>
    </div>
  );
}

function RegisterView({ onLogin, onSuccess }: { onLogin:()=>void; onSuccess:(u:any)=>void }) {
  const [nom,    setNom]    = useState("");
  const [email,  setEmail]  = useState("");
  const [tel,    setTel]    = useState("");
  const [metier, setMetier] = useState("");
  const [ville,  setVille]  = useState("");
  const [pw,     setPw]     = useState("");
  const [pw2,    setPw2]    = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading,setLoad]   = useState(false);

  const handle = async () => {
    const errs: Record<string,string> = {};
    if (!nom.trim())   errs.nom    = "Requis";
    if (!email.trim()) errs.email  = "Requis";
    if (!metier)       errs.metier = "Choisissez";
    if (pw.length<6)   errs.pw     = "Min 6 caractères";
    if (pw!==pw2)      errs.pw2    = "Ne correspondent pas";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoad(true);
    try {
      const u = await inscrire(email.trim(), pw, {
        nom:nom.trim(), telephone:tel.trim(), metier,
        ville:ville.trim()||"Togo",
        initiales:getInitiales(nom.trim()),
        couleur:genCouleur(nom.trim()),
      } as any);
      onSuccess(u);
    } catch(e:any) {
      if (e.code==="auth/email-already-in-use") setErrors({ email:"Email déjà utilisé" });
      else setErrors({ email:"Erreur. Réessayez." });
    } finally { setLoad(false); }
  };

  const fi = (err?:string): React.CSSProperties => ({ ...inp, borderColor:err?"#FCA5A5":"#E2E8F0" });

  return (
    <div style={{ minHeight:"100dvh", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(135deg,#14532D,#16A34A)", padding:"0 16px", height:56, display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onLogin} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArrowLeft size={16} color="#fff"/>
        </button>
        <div>
          <p style={{ fontSize:16, fontWeight:800, color:"#fff", fontFamily:"sans-serif" }}>Créer un compte</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>Gratuit · KaziDevis</p>
        </div>
      </div>

      <div style={{ flex:1, padding:"14px 16px 80px", background:"#F8FAFC", overflowY:"auto" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)", marginBottom:10 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>Informations</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { label:"Nom complet *",  val:nom,   set:setNom,   type:"text",  ph:"Ex: Kofi Mensah",       err:errors.nom   },
              { label:"Email *",        val:email, set:setEmail, type:"email", ph:"votre@email.com",        err:errors.email },
              { label:"Téléphone",      val:tel,   set:setTel,   type:"tel",   ph:"+228 90 00 00 00",       err:undefined    },
              { label:"Ville",          val:ville, set:setVille, type:"text",  ph:"Ex: Lomé, Kpalimé...",   err:undefined    },
            ].map(({ label, val, set, type, ph, err }) => (
              <div key={label}>
                <label style={lbl}>{label}</label>
                <input style={fi(err)} type={type} placeholder={ph} value={val} onChange={(e)=>set(e.target.value)} />
                {err && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{err}</p>}
              </div>
            ))}
            <div>
              <label style={lbl}>Métier *</label>
              <select style={fi(errors.metier)} value={metier} onChange={(e)=>setMetier(e.target.value)}>
                <option value="">Choisir...</option>
                {METIERS.map((m)=><option key={m} value={m}>{m}</option>)}
              </select>
              {errors.metier && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{errors.metier}</p>}
            </div>
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)", marginBottom:10 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 }}>Sécurité</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <label style={lbl}>Mot de passe *</label>
              <PwInput placeholder="Min 6 caractères" value={pw} onChange={setPw}/>
              {errors.pw && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{errors.pw}</p>}
            </div>
            <div>
              <label style={lbl}>Confirmer *</label>
              <PwInput placeholder="Répétez" value={pw2} onChange={setPw2}/>
              {errors.pw2 && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{errors.pw2}</p>}
            </div>
          </div>
        </div>

        <button style={{ ...btnG, opacity:loading?0.7:1 }} onClick={handle} disabled={loading}>
          {loading?"Création...":"Créer mon compte gratuitement"}
        </button>
        <p style={{ textAlign:"center", fontSize:12, color:"#94A3B8", marginTop:10 }}>
          Déjà un compte ?{" "}
          <button onClick={onLogin} style={{ background:"none", border:"none", color:"#16A34A", fontWeight:700, fontSize:12, cursor:"pointer" }}>Se connecter</button>
        </p>
      </div>
    </div>
  );
}

function SuccessView({ onStart }: { onStart:()=>void }) {
  return (
    <div style={{ minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, background:"#F8FAFC", textAlign:"center" }}>
      <div style={{ width:70, height:70, borderRadius:"50%", background:"#DCFCE7", border:"3px solid #BBF7D0", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
        <Check size={32} color="#16A34A" strokeWidth={2.5}/>
      </div>
      <h2 style={{ fontSize:22, fontWeight:800, color:"#0F172A", fontFamily:"sans-serif", marginBottom:8 }}>Bienvenue !</h2>
      <p style={{ fontSize:14, color:"#64748B", marginBottom:24 }}>Votre compte a été créé avec succès.</p>
      <button style={btnG} onClick={onStart}>Commencer →</button>
    </div>
  );
}
