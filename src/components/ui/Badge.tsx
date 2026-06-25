import { STATUT_COLOR, STATUT_LABEL } from "@/lib/utils";
import type { DevisStatut } from "@/types";

export function StatutBadge({ statut }: { statut: DevisStatut }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLOR[statut]}`}>
      {STATUT_LABEL[statut]}
    </span>
  );
}

export function Badge({ label, color = "gray" }: { label: string; color?: "green" | "yellow" | "red" | "blue" | "gray" }) {
  const map = {
    green:  "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red:    "bg-red-50 text-red-600",
    blue:   "bg-blue-50 text-blue-700",
    gray:   "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>
      {label}
    </span>
  );
}
