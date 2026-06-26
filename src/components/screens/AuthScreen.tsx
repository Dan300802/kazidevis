"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";

import { inscrire, connecter } from "@/lib/firebaseAuth";
import { getInitiales } from "@/lib/auth";
import { genCouleur } from "@/lib/clients";
import { METIERS } from "@/lib/auth";

type AuthView = "login" | "register" | "success";

const inputStyle: React.CSSProperties = {
  width:"100%", padding:"13px 16px", borderRadius:12,
  border:"1.5px solid #E2E8F0", background:"#fff",
  fontSize:16, color:"#0F172A", outline:"none",
  fontFamily:"Inter,sans-serif", boxSizing:"border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize:12, fontWeight:600, color:"#64748B",
  textTransform:"uppercase", letterSpacing:"0.05em",
  display:"block", marginBottom:6,
};
const btnGreen: React.CSSProperties = {
  width:"100%", padding:15, borderRadius:14,
  background:"linear-gradient(135deg,#16A34A,#15803D)",
  color:"#fff", border:"none", fontWeight:700, fontSize:15,
  cursor:"pointer", fontFamily:"inherit",
};

function PwInput({ placeholder, value, onChange }: { placeholder:string; value:string; onChange:(v:string)=>void }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <input type={show?"text":"password"} placeholder={placeholder} value={value} onChange={(e)=>onChange(e.target.value)} style={{ ...inputStyle, paddingRight:44 }} />
      <button onClick={()=>setShow(!show)} type="button" style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94A3B8", display:"flex" }}>
        {show ? <EyeOff size={18}/> : <Eye size={18}/>}
      </button>
    </div>
  );
}

export function AuthScreen({ onAuth }: { onAuth: (user: any) => void }) {
  const [view, setView] = useState<AuthView>("login");
  const [regUser, setRegUser] = useState<any>(null);
  return (
    <div style={{ minHeight:"100dvh", background:"#F8FAFC" }}>
      {view==="login"    && <LoginView    onRegister={()=>setView("register")} onAuth={onAuth} />}
      {view==="register" && <RegisterView onLogin={()=>setView("login")} onSuccess={(u)=>{setRegUser(u);setView("success");onAuth(u);}} />}
      {view==="success"  && regUser && <SuccessView onStart={()=>onAuth(regUser)} />}
    </div>
  );
}

function LoginView({ onRegister, onAuth }: { onRegister:()=>void; onAuth:(u:any)=>void }) {
  const [email, setEmail] = useState("");
  const [pw,    setPw]    = useState("");
  const [err,   setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()||!pw) { setErr("Remplissez tous les champs"); return; }
    setLoading(true); setErr("");
    try {
      const user = await connecter(email.trim(), pw);
      onAuth(user);
    } catch(e:any) {
      setErr(e.code==="auth/invalid-credential" ? "Email ou mot de passe incorrect" : "Erreur de connexion. Réessayez.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100dvh", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(135deg,#14532D,#16A34A)", padding:"40px 24px 32px", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <div style={{ width:72, height:72, borderRadius:20, background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img src="/logo.png" alt="KaziDevis" style={{ width:44, height:44, objectFit:"contain" }} />
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:2, justifyContent:"center" }}>
            <span style={{ fontSize:28, fontWeight:800, color:"#fff", fontFamily:"sans-serif" }}>Kazi</span>
            <span style={{ fontSize:28, fontWeight:800, color:"#FBBF24", fontFamily:"sans-serif" }}>Devis</span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginTop:3 }}>Connectez-vous à votre espace</p>
        </div>
      </div>

      <div style={{ flex:1, padding:"24px 20px" }}>
        <div style={{ background:"#fff", borderRadius:20, padding:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom:14 }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="votre@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom:8 }}>
            <label style={labelStyle}>Mot de passe</label>
            <PwInput placeholder="••••••••" value={pw} onChange={setPw} />
          </div>
          {err && <p style={{ fontSize:12, color:"#DC2626", marginBottom:10 }}>{err}</p>}
          <button style={{ ...btnGreen, marginTop:16, opacity:loading?0.7:1 }} onClick={handleLogin} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0", color:"#94A3B8", fontSize:13 }}>
            <div style={{ flex:1, height:1, background:"#E2E8F0" }}/><span>ou</span><div style={{ flex:1, height:1, background:"#E2E8F0" }}/>
          </div>
          <button style={{ width:"100%", padding:14, borderRadius:14, background:"#fff", color:"#16A34A", border:"2px solid #16A34A", fontWeight:700, fontSize:15, cursor:"pointer" }} onClick={onRegister}>
            Créer un compte
          </button>
        </div>
        <p style={{ textAlign:"center", fontSize:12, color:"#94A3B8", marginTop:20 }}>Vos données sont sécurisées sur Firebase</p>
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
  const [loading,setLoading]= useState(false);

  const handleRegister = async () => {
    const errs: Record<string,string> = {};
    if (!nom.trim())   errs.nom    = "Le nom est requis";
    if (!email.trim()) errs.email  = "L'email est requis";
    if (!metier)       errs.metier = "Choisissez votre métier";
    if (pw.length<6)   errs.pw     = "Minimum 6 caractères";
    if (pw!==pw2)      errs.pw2    = "Les mots de passe ne correspondent pas";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const initiales = getInitiales(nom.trim());
      const user = await inscrire(email.trim(), pw, {
        nom: nom.trim(), telephone: tel.trim(), metier,
        ville: ville.trim() || "Togo", initiales,
        couleur: genCouleur(nom.trim()),
      } as any);
      onSuccess(user);
    } catch(e:any) {
      if (e.code==="auth/email-already-in-use") setErrors({ email:"Cet email est déjà utilisé" });
      else setErrors({ email:"Erreur d'inscription. Réessayez." });
    } finally { setLoading(false); }
  };

  const fi = (err?:string): React.CSSProperties => ({ ...inputStyle, borderColor:err?"#FCA5A5":"#E2E8F0" });

  return (
    <div style={{ minHeight:"100dvh", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(135deg,#14532D,#16A34A)", padding:"0 16px", height:60, display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={onLogin} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArrowLeft size={18} color="#fff"/>
        </button>
        <div>
          <p style={{ fontSize:17, fontWeight:800, color:"#fff", fontFamily:"sans-serif" }}>Créer un compte</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>Rejoignez KaziDevis gratuitement</p>
        </div>
      </div>

      <div style={{ flex:1, padding:"16px 16px 100px", background:"#F8FAFC", overflowY:"auto" }}>
        <div style={{ background:"#fff", borderRadius:20, padding:18, boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)", marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Informations</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={labelStyle}>Nom complet *</label>
              <input style={fi(errors.nom)} placeholder="Ex: Kofi Mensah" value={nom} onChange={(e)=>setNom(e.target.value)}/>
              {errors.nom && <p style={{ fontSize:12, color:"#DC2626", marginTop:4 }}>{errors.nom}</p>}
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input style={fi(errors.email)} type="email" placeholder="votre@email.com" value={email} onChange={(e)=>setEmail(e.target.value)}/>
              {errors.email && <p style={{ fontSize:12, color:"#DC2626", marginTop:4 }}>{errors.email}</p>}
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={fi()} type="tel" placeholder="+228 90 00 00 00" value={tel} onChange={(e)=>setTel(e.target.value)}/>
            </div>
            <div>
              <label style={labelStyle}>Métier *</label>
              <select style={fi(errors.metier)} value={metier} onChange={(e)=>setMetier(e.target.value)}>
                <option value="">Choisir votre métier...</option>
                {METIERS.map((m)=><option key={m} value={m}>{m}</option>)}
              </select>
              {errors.metier && <p style={{ fontSize:12, color:"#DC2626", marginTop:4 }}>{errors.metier}</p>}
            </div>
            <div>
              <label style={labelStyle}>Ville</label>
              <input style={fi()} placeholder="Ex: Lomé, Kpalimé..." value={ville} onChange={(e)=>setVille(e.target.value)}/>
            </div>
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:18, boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)", marginBottom:12 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Sécurité</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={labelStyle}>Mot de passe *</label>
              <PwInput placeholder="Minimum 6 caractères" value={pw} onChange={setPw}/>
              {errors.pw && <p style={{ fontSize:12, color:"#DC2626", marginTop:4 }}>{errors.pw}</p>}
            </div>
            <div>
              <label style={labelStyle}>Confirmer *</label>
              <PwInput placeholder="Répétez le mot de passe" value={pw2} onChange={setPw2}/>
              {errors.pw2 && <p style={{ fontSize:12, color:"#DC2626", marginTop:4 }}>{errors.pw2}</p>}
            </div>
          </div>
        </div>

        <button style={{ ...btnGreen, opacity:loading?0.7:1 }} onClick={handleRegister} disabled={loading}>
          {loading ? "Création du compte..." : "Créer mon compte gratuitement"}
        </button>
        <p style={{ textAlign:"center", fontSize:13, color:"#94A3B8", marginTop:12 }}>
          Déjà un compte ?{" "}
          <button onClick={onLogin} style={{ background:"none", border:"none", color:"#16A34A", fontWeight:700, fontSize:13, cursor:"pointer" }}>Se connecter</button>
        </p>
      </div>
    </div>
  );
}

function SuccessView({ onStart }: { onStart:()=>void }) {
  return (
    <div style={{ minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, background:"#F8FAFC", textAlign:"center" }}>
      <div style={{ width:80, height:80, borderRadius:"50%", background:"#DCFCE7", border:"3px solid #BBF7D0", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        <Check size={36} color="#16A34A" strokeWidth={2.5}/>
      </div>
      <h2 style={{ fontSize:24, fontWeight:800, color:"#0F172A", fontFamily:"sans-serif", marginBottom:8 }}>Bienvenue sur KaziDevis !</h2>
      <p style={{ fontSize:14, color:"#64748B", marginBottom:28, lineHeight:1.6 }}>Votre compte a été créé avec succès.</p>
      <button style={btnGreen} onClick={onStart}>Commencer →</button>
    </div>
  );
}
