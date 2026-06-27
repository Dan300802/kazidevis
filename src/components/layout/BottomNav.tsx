"use client";
import { Home, FileText, PieChart, Users, User, BarChart2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const tabs = [
  { id:"home"    as const, label:"Accueil",  icon:Home     },
  { id:"devis"   as const, label:"Devis",    icon:FileText },
  { id:"clients" as const, label:"Clients",  icon:Users    },
  { id:"rapport" as const, label:"Rapport",  icon:BarChart2},
  { id:"profil"  as const, label:"Profil",   icon:User     },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #F1F5F9", zIndex:40, paddingBottom:"env(safe-area-inset-bottom,4px)" }}>
      <div style={{ display:"flex", maxWidth:430, margin:"0 auto" }}>
        {tabs.map(({ id, label, icon:Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={()=>setActiveTab(id as any)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, padding:"7px 0", minHeight:50, border:"none", background:"none", cursor:"pointer", color:active?"#16A34A":"#9CA3AF" }}>
              <Icon size={20} strokeWidth={active?2.5:1.8}/>
              <span style={{ fontSize:9, fontWeight:500, color:active?"#16A34A":"#9CA3AF" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
