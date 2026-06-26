"use client";

export function KaziLogo({ size = 60 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="KaziDevis"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

export function SplashScreen() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg,#14532D 0%,#15803D 45%,#16A34A 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.07)", top:-80, right:-80 }} />
      <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)", bottom:-40, left:-60 }} />

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        {/* Logo SANS carré — juste l'image directe */}
        <img
          src="/logo.png"
          alt="KaziDevis"
          style={{ width:130, height:130, objectFit:"contain", marginBottom:20 }}
        />
        <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
          <span style={{ fontSize:42, fontWeight:800, color:"#fff", fontFamily:"sans-serif", letterSpacing:-1.5 }}>Kazi</span>
          <span style={{ fontSize:42, fontWeight:800, color:"#FBBF24", fontFamily:"sans-serif", letterSpacing:-1.5 }}>Devis</span>
        </div>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginTop:6, letterSpacing:"0.1em" }}>
          GESTION ARTISANS · TOGO
        </p>
      </div>

      <div style={{ position:"absolute", bottom:60, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <div style={{
          width:36, height:36, borderRadius:"50%",
          border:"3px solid rgba(255,255,255,0.2)",
          borderTopColor:"#FBBF24",
          animation:"spin 0.9s linear infinite",
        }} />
        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>Chargement...</p>
      </div>

      <p style={{ position:"absolute", bottom:20, color:"rgba(255,255,255,0.25)", fontSize:11, letterSpacing:"0.06em" }}>
        Kazi = Travail · Swahili
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
