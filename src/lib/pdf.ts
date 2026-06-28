"use client";
import type { Devis } from "@/types";
import { totalDevis, formatDate } from "./utils";

// Formate montant SANS espaces insécables ni caractères spéciaux
function M(n: number): string {
  // Formatage manuel pour éviter Intl qui produit des espaces insécables
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return s + " FCFA";
}

export async function exportDevisPDF(
  devis: Devis,
  artisan: { nom: string; metier: string; telephone: string; ville: string }
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; const H = 297; const L = 14; const CW = W - L * 2;
  let y = 0;

  const fc = (r:number,g:number,b:number) => doc.setFillColor(r,g,b);
  const tc = (r:number,g:number,b:number) => doc.setTextColor(r,g,b);
  const dc = (r:number,g:number,b:number) => doc.setDrawColor(r,g,b);
  const B  = (s:number) => { doc.setFont("helvetica","bold");   doc.setFontSize(s); };
  const N  = (s:number) => { doc.setFont("helvetica","normal"); doc.setFontSize(s); };
  const txt = (t:string, x:number, yy:number, opts?:any) =>
    doc.text(t.replace(/\u202f/g," ").replace(/\u00a0/g," "), x, yy, opts);

  // ── HEADER ──
  fc(20,83,45);  doc.rect(0, 0, W, 40, "F");
  fc(22,163,74); doc.rect(0, 30, W, 10, "F");

  B(16); tc(255,255,255); txt("Kazi", L, 16);
  const kw = doc.getTextWidth("Kazi");
  tc(251,191,36); txt("Devis", L+kw+0.5, 16);
  N(8);  tc(187,247,208); txt("GESTION ARTISANS - TOGO", L, 21);
  N(8);  tc(255,255,255);
  txt(`${artisan.nom} - ${artisan.metier}`, L, 26);
  txt(`${artisan.telephone} - ${artisan.ville}`, L, 31);

  B(18); tc(255,255,255); txt(devis.numero, W-L, 16, { align:"right" });
  N(7);  tc(148,163,184); txt("DEVIS", W-L, 9, { align:"right" });
  N(8);  tc(255,255,255);
  txt(`Emis le ${formatDate(devis.dateCreation)}`, W-L, 22, { align:"right" });
  if (devis.dateValidite) txt(`Validite : ${formatDate(devis.dateValidite)}`, W-L, 27, { align:"right" });

  y = 48;

  // ── TITRE ──
  if (devis.titre) {
    B(13); tc(15,23,42); txt(devis.titre, L, y); y += 8;
  }

  // ── INFOS CLIENT ──
  fc(248,250,252); dc(226,232,240); doc.setLineWidth(0.3);
  doc.roundedRect(L,         y, (CW/2)-3, 30, 2, 2, "FD");
  doc.roundedRect(L+(CW/2)+3, y, (CW/2)-3, 30, 2, 2, "FD");

  B(7); tc(148,163,184);
  txt("DE (ARTISAN)",  L+3,        y+6);
  txt("POUR (CLIENT)", L+(CW/2)+6, y+6);
  B(10); tc(15,23,42);
  txt(artisan.nom,  L+3,        y+13);
  txt(devis.client, L+(CW/2)+6, y+13);
  N(8); tc(71,85,105);
  txt(artisan.metier,    L+3,        y+19);
  txt(devis.typeMetier,  L+(CW/2)+6, y+19);
  txt(artisan.telephone, L+3,        y+25);
  if (devis.telephone) txt(devis.telephone, L+(CW/2)+6, y+25);
  y += 37;

  // ── TABLE HEADER ──
  fc(20,83,45); doc.rect(L, y, CW, 9, "F");
  B(7); tc(255,255,255);
  txt("DESCRIPTION", L+3,    y+6);
  txt("QTE",         L+92,   y+6, { align:"center" });
  txt("PRIX UNIT.",  L+133,  y+6, { align:"center" });
  txt("TOTAL",       L+CW-3, y+6, { align:"right"  });
  y += 9;

  // ── LIGNES ──
  devis.lignes.forEach((l, i) => {
    const rh = 11;
    fc(...(i%2===0 ? [255,255,255] : [248,250,252]) as [number,number,number]);
    dc(241,245,249); doc.setLineWidth(0.1);
    doc.rect(L, y, CW, rh, "F");

    B(9); tc(15,23,42);  txt(l.description, L+3, y+7);
    N(8); tc(100,116,139);
    txt(`${l.quantite}${l.unite ? " "+l.unite : ""}`, L+92,   y+7, { align:"center" });
    txt(M(l.prixUnitaire),                            L+133,  y+7, { align:"center" });
    B(9); tc(15,23,42);
    txt(M(l.quantite * l.prixUnitaire),               L+CW-3, y+7, { align:"right"  });
    y += rh;
  });

  // ── TOTAL ──
  y += 3;
  const totalVal = totalDevis(devis.lignes);
  fc(22,163,74); doc.roundedRect(L+CW-75, y, 75, 14, 2, 2, "F");
  N(8);  tc(187,247,208); txt("TOTAL TTC", L+CW-72, y+5.5);
  B(11); tc(255,255,255); txt(M(totalVal), L+CW-3, y+11, { align:"right" });
  fc(248,250,252); doc.rect(L, y, CW-75, 14, "F");
  N(8);  tc(148,163,184); txt(`${devis.lignes.length} prestation(s)`, L+3, y+8);
  y += 20;

  // ── ACOMPTES ──
  if (devis.acomptes && devis.acomptes.length > 0) {
    const totalAc = devis.acomptes.reduce((a:number,ac:any) => a+ac.montant, 0);
    const reste   = totalVal - totalAc;
    const nbAc    = devis.acomptes.length;
    fc(255,251,235); dc(253,230,138); doc.setLineWidth(0.3);
    doc.roundedRect(L, y, CW, 10 + nbAc*8 + 6, 2, 2, "FD");
    B(7); tc(146,64,14); txt("SUIVI DES PAIEMENTS", L+4, y+6);
    devis.acomptes.forEach((ac:any, i:number) => {
      N(8); tc(71,85,105);
      txt(`- ${formatDate(ac.date)}${ac.note ? " - "+ac.note : ""}`, L+4, y+13+i*8);
      B(8); tc(22,163,74);
      txt(`+${M(ac.montant)}`, L+CW-4, y+13+i*8, { align:"right" });
    });
    y += 14 + nbAc*8;

    const isOk = reste <= 0;
    fc(...(isOk ? [240,253,244] : [255,251,235]) as [number,number,number]);
    dc(...(isOk ? [187,247,208] : [253,230,138]) as [number,number,number]);
    doc.roundedRect(L+CW-82, y, 82, 12, 2, 2, "FD");
    B(8); tc(...(isOk ? [21,128,61] : [146,64,14]) as [number,number,number]);
    txt(isOk ? "SOLDE" : "RESTE A PAYER", L+CW-78, y+5);
    B(10); txt(M(Math.max(reste,0)), L+CW-4, y+10, { align:"right" });
    y += 18;
  }

  // ── NOTES ──
  if (devis.notes) {
    dc(217,119,6); doc.setLineWidth(0.8);
    doc.line(L, y, L, y+20);
    fc(248,250,252); dc(226,232,240); doc.setLineWidth(0.2);
    doc.roundedRect(L+2, y, CW-2, 20, 1, 1, "FD");
    B(7); tc(148,163,184); txt("CONDITIONS ET NOTES", L+5, y+5.5);
    N(8); tc(71,85,105);
    const lines = doc.splitTextToSize(devis.notes.replace(/\n/g," "), CW-14);
    doc.text(lines, L+5, y+11);
    y += 26;
  }

  // ── SIGNATURE ──
  const sigY = Math.max(y + 8, H - 75);
  const needNewPage = sigY + 55 > H - 16;
  if (needNewPage) { doc.addPage(); y = 20; } else { y = sigY; }

  B(8); tc(148,163,184); txt("SIGNATURES", L, y);
  y += 7;
  dc(226,232,240); doc.setLineWidth(0.3);

  // Bloc artisan
  fc(248,250,252);
  doc.roundedRect(L, y, (CW/2)-6, 44, 2, 2, "FD");
  N(8);  tc(148,163,184); txt("Signature de l'artisan", L+4, y+6);
  N(7);  tc(100,116,139); txt(artisan.nom, L+4, y+12);
  dc(148,163,184); doc.setLineWidth(0.5);
  doc.line(L+4, y+33, L+(CW/2)-10, y+33);
  N(7); tc(148,163,184); txt("Signature + cachet", L+4, y+39);

  // Bloc client
  fc(248,250,252);
  doc.roundedRect(L+(CW/2)+6, y, (CW/2)-6, 44, 2, 2, "FD");
  N(8);  tc(148,163,184); txt("Signature du client", L+(CW/2)+10, y+6);
  N(7);  tc(100,116,139); txt(devis.client, L+(CW/2)+10, y+12);
  doc.line(L+(CW/2)+10, y+33, L+CW-4, y+33);
  N(7); tc(148,163,184); txt("Lu et approuve", L+(CW/2)+10, y+39);

  // ── FOOTER ──
  fc(248,250,252); doc.rect(0, H-14, W, 14, "F");
  dc(226,232,240); doc.setLineWidth(0.2); doc.line(0, H-14, W, H-14);
  B(8); tc(22,163,74);  txt("Kazi",  L, H-7);
  tc(217,119,6);         txt("Devis", L+doc.getTextWidth("Kazi")+0.5, H-7);
  N(7); tc(148,163,184);
  txt(`Genere le ${new Date().toLocaleDateString("fr-FR")} - ${devis.numero}`, L+25, H-7);
  txt("kazidevis.vercel.app", W-L, H-7, { align:"right" });

  doc.save(`KaziDevis_${devis.numero}_${devis.client.replace(/\s+/g,"-")}.pdf`);
}
