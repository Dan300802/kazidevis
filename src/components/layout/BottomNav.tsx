"use client";
import { Home, FileText, PieChart, Users, User, BarChart2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const tabs = [
  { id: "home"     as const, label: "Accueil",  icon: Home     },
  { id: "devis"    as const, label: "Devis",    icon: FileText },
  { id: "clients"  as const, label: "Clients",  icon: Users    },
  { id: "rapport"  as const, label: "Rapport",  icon: BarChart2},
  { id: "profil"   as const, label: "Profil",   icon: User     },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();
  return (
    <nav className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
      <div className="flex">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id as any)} aria-label={label}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors"
              style={{ color: active ? "#16A34A" : "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 9, fontWeight: 500, color: active ? "#16A34A" : "#9CA3AF" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
