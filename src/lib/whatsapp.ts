import type { Devis } from "@/types";
import { formatMontant, formatDate, totalDevis, STATUT_LABEL } from "./utils";

export function partagerDevisWhatsApp(devis: Devis, artisan: { nom: string; telephone: string }) {
  const total = totalDevis(devis.lignes);
  const lignesText = devis.lignes
    .map((l) => `  • ${l.description} — ${formatMontant(l.quantite * l.prixUnitaire)}`)
    .join("\n");

  const message = `
*DEVIS ${devis.numero}*
_${artisan.nom}_

📋 *Client :* ${devis.client}
🔨 *Travaux :* ${devis.typeMetier}
📅 *Date :* ${formatDate(devis.dateCreation)}

*Détail des prestations :*
${lignesText}

💰 *TOTAL : ${formatMontant(total)}*

${devis.notes ? `📝 _${devis.notes}_\n` : ""}
Pour accepter ce devis, répondez OUI.
Contactez-moi au ${artisan.telephone}.
`.trim();

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

export function partagerDevisClient(devis: Devis, telephone: string, artisan: { nom: string }) {
  const total = totalDevis(devis.lignes);
  const message = `Bonjour, voici votre devis ${devis.numero} de ${formatMontant(total)} pour vos travaux de ${devis.typeMetier}. Cordialement, ${artisan.nom}`;
  const tel = telephone.replace(/\s+/g, "").replace(/^\+/, "");
  const url = `https://wa.me/${tel}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}
