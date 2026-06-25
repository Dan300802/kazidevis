"use client";
import { useEffect, useState } from "react";

export function KaziLogo({ size = 60, variant = "dark" }: { size?: number; variant?: "dark" | "light" | "color" }) {
  const docFill  = variant === "light" ? "#14532D" : "white";
  const foldFill = variant === "light" ? "#F0FDF4" : "#86EFAC";
  const lineFill = variant === "light" ? "rgba(255,255,255,0.5)" : "#CBD5E1";
  const line2    = variant === "light" ? "rgba(255,255,255,0.3)" : "#E2E8F0";
  const kS1      = variant === "light" ? "#16A34A" : "#FBBF24";
  const kS2      = variant === "light" ? "#14532D" : "#F59E0B";
  const u        = size / 100;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x={8*u} y={6*u} width={48*u} height={62*u} rx={5*u} fill={docFill} opacity={variant==="light"?1:0.95}/>
      <path d={`M${45*u} ${6*u} L${56*u} ${17*u} L${45*u} ${17*u} Z`} fill={foldFill}/>
      <rect x={15*u} y={22*u} width={28*u} height={3*u} rx={1.5*u} fill={lineFill}/>
      <rect x={15*u} y={29*u} width={22*u} height={3*u} rx={1.5*u} fill={lineFill}/>
      <rect x={15*u} y={36*u} width={25*u} height={3*u} rx={1.5*u} fill={line2}/>
      <circle cx={28*u} cy={72*u} r={14*u} fill="#FBBF24"/>
      <circle cx={28*u} cy={72*u} r={11*u} fill="#F59E0B"/>
      <path d={`M${20*u} ${72*u} l${5.5*u} ${5.5*u} L${40*u} ${60*u}`} stroke="white" strokeWidth={3*u} strokeLinecap="round" strokeLinejoin="round"/>
      <path d={`M${68*u} ${15*u} L${68*u} ${88*u}`} stroke={kS1} strokeWidth={9*u} strokeLinecap="round"/>
      <path d={`M${68*u} ${52*u} L${92*u} ${15*u}`} stroke={kS2} strokeWidth={8*u} strokeLinecap="round"/>
      <path d={`M${68*u} ${52*u} L${92*u} ${88*u}`} stroke={kS2} strokeWidth={8*u} strokeLinecap="round"/>
    </svg>
  );
}

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 6 + 3;
      if (pct >= 100) {
        pct = 100;
        clearInterval(iv);
        // On appelle onDone mais la vraie transition est gérée par page.tsx
        setTimeout(() => onDone(), 300);
      }
      setProgress(Math.min(pct, 100));
    }, 60);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg,#14532D 0%,#15803D 45%,#16A34A 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Cercles déco */}
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.07)", top:-80, right:-80 }} />
      <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)", bottom:-40, left:-60 }} />

      {/* Logo */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ width:110, height:110, borderRadius:32, background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>
          <KaziLogo size={72} />
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
          <span style={{ fontSize:42, fontWeight:800, color:"#fff", fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:-1.5 }}>Kazi</span>
          <span style={{ fontSize:42, fontWeight:800, color:"#FBBF24", fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:-1.5 }}>Devis</span>
        </div>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginTop:6, letterSpacing:"0.1em", fontWeight:500 }}>
          GESTION ARTISANS · TOGO
        </p>
      </div>

      {/* Barre de chargement */}
      <div style={{ position:"absolute", bottom:60, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <div style={{ width:180, height:3, background:"rgba(255,255,255,0.15)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#FBBF24,#F59E0B)", borderRadius:99, transition:"width 0.06s linear" }} />
        </div>
        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>Chargement...</p>
      </div>

      <p style={{ position:"absolute", bottom:20, color:"rgba(255,255,255,0.25)", fontSize:11, letterSpacing:"0.06em" }}>
        Kazi = Travail · Swahili
      </p>
    </div>
  );
}
