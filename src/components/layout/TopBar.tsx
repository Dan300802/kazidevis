"use client";
import { ArrowLeft } from "lucide-react";

interface TopBarProps { title:string; onBack?:()=>void; right?:React.ReactNode; }

export function TopBar({ title, onBack, right }: TopBarProps) {
  return (
    <header style={{ position:"sticky", top:0, zIndex:30, background:"#fff", borderBottom:"1px solid #F1F5F9" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 12px", height:50 }}>
        {onBack && (
          <button onClick={onBack} style={{ width:34, height:34, borderRadius:10, background:"#F1F5F9", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <ArrowLeft size={17} style={{ color:"#64748B" }}/>
          </button>
        )}
        <h1 style={{ flex:1, fontSize:15, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{title}</h1>
        {right && <div style={{ flexShrink:0 }}>{right}</div>}
      </div>
    </header>
  );
}
