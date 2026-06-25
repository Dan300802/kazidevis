"use client";
import { useEffect, useState } from "react";

export function KaziLogo({ size = 60, variant = "dark" }: { size?: number; variant?: "dark" | "light" | "color" }) {
  const s = size / 100;
  const docFill   = variant === "light" ? "#14532D" : "white";
  const docOpacity= variant === "light" ? 1 : 0.95;
  const foldFill  = variant === "light" ? "#F0FDF4" : "#86EFAC";
  const lineFill  = variant === "light" ? "rgba(255,255,255,0.5)" : "#CBD5E1";
  const lineFill2 = variant === "light" ? "rgba(255,255,255,0.3)" : "#E2E8F0";
  const kStroke1  = variant === "light" ? "#16A34A" : "#FBBF24";
  const kStroke2  = variant === "light" ? "#14532D" : "#F59E0B";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Document */}
      <rect x={8*s*100/size} y={6*s*100/size} width={48*s*100/size} height={62*s*100/size} rx={5*s*100/size} fill={docFill} opacity={docOpacity}/>
      {/* Coin plié */}
      <path d={`M${45*s*100/size} ${6*s*100/size} L${56*s*100/size} ${17*s*100/size} L${45*s*100/size} ${17*s*100/size} Z`} fill={foldFill}/>
      {/* Lignes */}
      <rect x={15*s*100/size} y={22*s*100/size} width={28*s*100/size} height={3*s*100/size} rx={1.5*s*100/size} fill={lineFill}/>
      <rect x={15*s*100/size} y={29*s*100/size} width={22*s*100/size} height={3*s*100/size} rx={1.5*s*100/size} fill={lineFill}/>
      <rect x={15*s*100/size} y={36*s*100/size} width={25*s*100/size} height={3*s*100/size} rx={1.5*s*100/size} fill={lineFill2}/>
      {/* Check circle or */}
      <circle cx={28*s*100/size} cy={72*s*100/size} r={14*s*100/size} fill="#FBBF24"/>
      <circle cx={28*s*100/size} cy={72*s*100/size} r={11*s*100/size} fill="#F59E0B"/>
      <path d={`M${20*s*100/size} ${72*s*100/size} l${5.5*s*100/size} ${5.5*s*100/size} L${40*s*100/size} ${60*s*100/size}`} stroke="white" strokeWidth={3*s*100/size} strokeLinecap="round" strokeLinejoin="round"/>
      {/* K */}
      <path d={`M${68*s*100/size} ${15*s*100/size} L${68*s*100/size} ${88*s*100/size}`} stroke={kStroke1} strokeWidth={9*s*100/size} strokeLinecap="round"/>
      <path d={`M${68*s*100/size} ${52*s*100/size} L${92*s*100/size} ${15*s*100/size}`} stroke={kStroke2} strokeWidth={8*s*100/size} strokeLinecap="round"/>
      <path d={`M${68*s*100/size} ${52*s*100/size} L${92*s*100/size} ${88*s*100/size}`} stroke={kStroke2} strokeWidth={8*s*100/size} strokeLinecap="round"/>
    </svg>
  );
}

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 5 + 2;
      if (pct >= 100) { pct = 100; clearInterval(iv); setTimeout(onDone, 400); }
      setProgress(Math.min(pct, 100));
    }, 60);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(160deg,#14532D 0%,#15803D 45%,#16A34A 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {/* Cercles déco */}
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.07)", top:-80, right:-80 }} />
      <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)", bottom:-40, left:-60 }} />
      <div style={{ position:"absolute", width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.04)", bottom:80, right:20 }} />

      {/* Logo */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
        {/* Icône avec fond arrondi */}
        <div style={{ width:110, height:110, borderRadius:32, background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>
          <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
            <rect x="8" y="6" width="48" height="62" rx="5" fill="white" opacity="0.95"/>
            <path d="M45 6 L56 17 L45 17 Z" fill="#86EFAC"/>
            <rect x="15" y="22" width="28" height="3" rx="1.5" fill="#CBD5E1"/>
            <rect x="15" y="29" width="22" height="3" rx="1.5" fill="#CBD5E1"/>
            <rect x="15" y="36" width="25" height="3" rx="1.5" fill="#E2E8F0"/>
            <circle cx="28" cy="72" r="14" fill="#FBBF24"/>
            <circle cx="28" cy="72" r="11" fill="#F59E0B"/>
            <path d="M20 72 l5.5 5.5 L40 60" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M68 15 L68 88" stroke="#FBBF24" strokeWidth="9" strokeLinecap="round"/>
            <path d="M68 52 L92 15" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round"/>
            <path d="M68 52 L92 88" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Nom */}
        <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
          <span style={{ fontSize:42, fontWeight:800, color:"#fff", fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:-1.5 }}>Kazi</span>
          <span style={{ fontSize:42, fontWeight:800, color:"#FBBF24", fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:-1.5 }}>Devis</span>
        </div>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginTop:6, letterSpacing:"0.1em", fontWeight:500 }}>GESTION ARTISANS · TOGO</p>
      </div>

      {/* Barre */}
      <div style={{ position:"absolute", bottom:60, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <div style={{ width:180, height:3, background:"rgba(255,255,255,0.15)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#FBBF24,#F59E0B)", borderRadius:99, transition:"width 0.06s linear" }} />
        </div>
        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>Chargement...</p>
      </div>
      <p style={{ position:"absolute", bottom:20, color:"rgba(255,255,255,0.25)", fontSize:11, letterSpacing:"0.06em" }}>Kazi = Travail · Swahili</p>
    </div>
  );
}
