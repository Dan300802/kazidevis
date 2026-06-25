"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { KaziLogo } from "./SplashScreen";
import { METIERS, getInitiales, genId } from "@/lib/auth";
import type { UserAuth } from "@/lib/auth";

type AuthView = "login" | "register" | "success";

interface AuthScreenProps { onAuth: (user: UserAuth) => void; }

const input: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: 12,
  border: "1.5px solid #E2E8F0", background: "#fff",
  fontSize: 14, color: "#0F172A", outline: "none",
  fontFamily: "Inter,sans-serif", boxSizing: "border-box",
};
const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#64748B",
  textTransform: "uppercase", letterSpacing: "0.05em",
  display: "block", marginBottom: 6,
};
const btnGreen: React.CSSProperties = {
  width: "100%", padding: 15, borderRadius: 14,
  background: "linear-gradient(135deg,#16A34A,#15803D)",
  color: "#fff", border: "none", fontWeight: 700, fontSize: 15,
  cursor: "pointer", fontFamily: "inherit",
};
const btnOutline: React.CSSProperties = {
  width: "100%", padding: 14, borderRadius: 14,
  background: "#fff", color: "#16A34A",
  border: "2px solid #16A34A", fontWeight: 700, fontSize: 15,
  cursor: "pointer", fontFamily: "inherit", marginTop: 10,
};

function PwInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={show ? "text" : "password"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...input, paddingRight: 44 }} />
      <button onClick={() => setShow(!show)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [view, setView]     = useState<AuthView>("login");
  const [newUser, setNewUser] = useState<UserAuth | null>(null);

  return (
    <div style={{ minHeight: "100dvh", background: "#F8FAFC" }}>
      {view === "login"    && <LoginView    onRegister={() => setView("register")} onAuth={onAuth} />}
      {view === "register" && <RegisterView onLogin={() => setView("login")} onSuccess={(u) => { setNewUser(u); setView("success"); }} />}
      {view === "success"  && newUser && <SuccessView user={newUser} onStart={() => onAuth(newUser)} />}
    </div>
  );
}

function LoginView({ onRegister, onAuth }: { onRegister: () => void; onAuth: (u: UserAuth) => void }) {
  const [tel, setTel]   = useState("");
  const [pw,  setPw]    = useState("");
  const [err, setErr]   = useState("");

  const handleLogin = () => {
    if (!tel.trim() || !pw) { setErr("Remplissez tous les champs"); return; }
    setErr("");
    // En production : appel API auth. Ici on crée une session locale demo.
    const stored = localStorage.getItem(`kazidevis_user_${tel.replace(/\s/g,"")}`);
    if (stored) {
      const user = JSON.parse(stored) as UserAuth;
      onAuth(user);
    } else {
      setErr("Compte introuvable. Créez un compte d'abord.");
    }
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg,#14532D,#16A34A)", padding: "40px 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KaziLogo size={44} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2, justifyContent: "center" }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: -1 }}>Kazi</span>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#FBBF24", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: -1 }}>Devis</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 3 }}>Connectez-vous à votre espace</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 20px" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)", marginBottom: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={label}>Téléphone</label>
            <input style={input} type="tel" placeholder="+228 90 00 00 00" value={tel} onChange={(e) => setTel(e.target.value)} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={label}>Mot de passe</label>
            <PwInput placeholder="••••••••" value={pw} onChange={setPw} />
          </div>
          {err && <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 10 }}>{err}</p>}
          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <button style={{ background: "none", border: "none", color: "#16A34A", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Mot de passe oublié ?</button>
          </div>
          <button style={btnGreen} onClick={handleLogin}>Se connecter</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", color: "#94A3B8", fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} /><span>ou</span><div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          </div>
          <button style={btnOutline} onClick={onRegister}>Créer un compte</button>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 20 }}>
          Vos données restent sur votre appareil
        </p>
      </div>
    </div>
  );
}

function RegisterView({ onLogin, onSuccess }: { onLogin: () => void; onSuccess: (u: UserAuth) => void }) {
  const [nom,    setNom]    = useState("");
  const [tel,    setTel]    = useState("");
  const [metier, setMetier] = useState("");
  const [ville,  setVille]  = useState("");
  const [pw,     setPw]     = useState("");
  const [pw2,    setPw2]    = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = () => {
    const errs: Record<string, string> = {};
    if (!nom.trim())     errs.nom    = "Le nom est requis";
    if (!tel.trim())     errs.tel    = "Le téléphone est requis";
    if (!metier)         errs.metier = "Choisissez votre métier";
    if (pw.length < 6)   errs.pw     = "Minimum 6 caractères";
    if (pw !== pw2)      errs.pw2    = "Les mots de passe ne correspondent pas";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const user: UserAuth = {
      id:        genId(),
      nom:       nom.trim(),
      telephone: tel.trim(),
      metier,
      ville:     ville.trim(),
      initiales: getInitiales(nom.trim()),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem(`kazidevis_user_${tel.replace(/\s/g,"")}`, JSON.stringify(user));
    onSuccess(user);
  };

  const fi = (err?: string): React.CSSProperties => ({ ...input, borderColor: err ? "#FCA5A5" : "#E2E8F0", marginBottom: err ? 4 : 0 });

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg,#14532D,#16A34A)", padding: "0 16px", height: 60, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onLogin} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ArrowLeft size={18} color="#fff" />
        </button>
        <div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Créer un compte</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Rejoignez KaziDevis gratuitement</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: "16px 16px 100px", background: "#F8FAFC", overflowY: "auto" }}>
        {/* Infos perso */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Informations personnelles</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={label}>Nom complet *</label>
              <input style={fi(errors.nom)} placeholder="Ex: Kofi Mensah" value={nom} onChange={(e) => setNom(e.target.value)} />
              {errors.nom && <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 4 }}>{errors.nom}</p>}
            </div>
            <div>
              <label style={label}>Téléphone *</label>
              <input style={fi(errors.tel)} type="tel" placeholder="+228 90 00 00 00" value={tel} onChange={(e) => setTel(e.target.value)} />
              {errors.tel && <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 4 }}>{errors.tel}</p>}
            </div>
            <div>
              <label style={label}>Métier principal *</label>
              <select style={{ ...fi(errors.metier), appearance: "none" as const }} value={metier} onChange={(e) => setMetier(e.target.value)}>
                <option value="">Choisir votre métier...</option>
                {METIERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.metier && <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 4 }}>{errors.metier}</p>}
            </div>
            <div>
              <label style={label}>Ville</label>
              <input style={fi()} placeholder="Ex: Lomé, Kpalimé..." value={ville} onChange={(e) => setVille(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Mot de passe */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Sécurité</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={label}>Mot de passe *</label>
              <PwInput placeholder="Minimum 6 caractères" value={pw} onChange={setPw} />
              {errors.pw && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.pw}</p>}
            </div>
            <div>
              <label style={label}>Confirmer *</label>
              <PwInput placeholder="Répétez le mot de passe" value={pw2} onChange={setPw2} />
              {errors.pw2 && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{errors.pw2}</p>}
            </div>
          </div>
        </div>

        {/* Avantages */}
        <div style={{ background: "linear-gradient(135deg,#F0FDF4,#ECFDF5)", border: "1px solid #BBF7D0", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#15803D", marginBottom: 8 }}>✨ Compte gratuit inclut :</p>
          {["Création de devis illimitée","Suivi des finances","Carnet clients","Rapports mensuels"].map((f) => (
            <p key={f} style={{ fontSize: 12, color: "#16A34A", display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <Check size={12} /> {f}
            </p>
          ))}
        </div>

        <button style={btnGreen} onClick={handleRegister}>Créer mon compte gratuitement</button>
        <p style={{ textAlign: "center", fontSize: 13, color: "#94A3B8", marginTop: 12 }}>
          Déjà un compte ?{" "}
          <button onClick={onLogin} style={{ background: "none", border: "none", color: "#16A34A", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Se connecter</button>
        </p>
      </div>
    </div>
  );
}

function SuccessView({ user, onStart }: { user: UserAuth; onStart: () => void }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, background: "#F8FAFC", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#DCFCE7", border: "3px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Check size={36} color="#16A34A" strokeWidth={2.5} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8 }}>
        Bienvenue sur KaziDevis !
      </h2>
      <p style={{ fontSize: 14, color: "#64748B", marginBottom: 28, lineHeight: 1.6 }}>
        Bonjour <strong style={{ color: "#0F172A" }}>{user.nom}</strong> !<br />
        Votre compte est prêt. Commencez à gérer vos devis.
      </p>
      <div style={{ background: "#fff", borderRadius: 20, padding: "16px 20px", width: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.05)", marginBottom: 28, textAlign: "left" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Prochaines étapes</p>
        {["Créez votre premier devis","Ajoutez vos clients","Suivez vos finances","Consultez vos rapports"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#16A34A", flexShrink: 0 }}>{i + 1}</div>
            <p style={{ fontSize: 13, color: "#374151" }}>{s}</p>
          </div>
        ))}
      </div>
      <button style={{ ...btnGreen, boxShadow: "0 6px 20px rgba(22,163,74,0.35)" }} onClick={onStart}>
        Commencer →
      </button>
    </div>
  );
}
