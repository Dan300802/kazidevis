"use client";
import type { Devis } from "@/types";
import { formatMontant, formatDate, totalDevis } from "./utils";

export async function exportDevisPDF(
  devis: Devis,
  artisan: { nom: string; metier: string; telephone: string; ville: string }
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; const H = 297; const M = 14; const CW = W - M * 2;
  let y = 0;

  // Helpers — uniquement des couleurs hex valides
  const fc = (r:number,g:number,b:number) => doc.setFillColor(r,g,b);
  const tc = (r:number,g:number,b:number) => doc.setTextColor(r,g,b);
  const dc = (r:number,g:number,b:number) => doc.setDrawColor(r,g,b);
  const b_ = (s:number) => { doc.setFont("helvetica","bold");   doc.setFontSize(s); };
  const n_ = (s:number) => { doc.setFont("helvetica","normal"); doc.setFontSize(s); };

  // Couleurs définies en RGB
  const GREEN_DARK  = [20,83,45]   as [number,number,number];
  const GREEN       = [22,163,74]  as [number,number,number];
  const GOLD        = [251,191,36] as [number,number,number];
  const GOLD_DARK   = [217,119,6]  as [number,number,number];
  const WHITE       = [255,255,255]as [number,number,number];
  const GRAY_LIGHT  = [248,250,252]as [number,number,number];
  const GRAY        = [148,163,184]as [number,number,number];
  const GRAY_DARK   = [15,23,42]   as [number,number,number];
  const GREEN_LIGHT = [187,247,208]as [number,number,number];
  const BORDER      = [226,232,240]as [number,number,number];
  const AMBER_DARK  = [146,64,14]  as [number,number,number];
  const AMBER_LIGHT = [255,251,235]as [number,number,number];
  const AMBER_BORDER= [253,230,138]as [number,number,number];
  const SLATE       = [71,85,105]  as [number,number,number];
  const GREEN_TEXT  = [21,128,61]  as [number,number,number];

  // ── HEADER ──
  fc(...GREEN_DARK); doc.rect(0, 0, W, 40, "F");
  fc(...GREEN);      doc.rect(0, 30, W, 10, "F");

  b_(16); tc(...WHITE); doc.text("Kazi", M, 16);
  const kw = doc.getTextWidth("Kazi");
  tc(...GOLD); doc.text("Devis", M+kw+0.5, 16);
  n_(8); tc(...GREEN_LIGHT); doc.text("GESTION ARTISANS · TOGO", M, 21);
  n_(8); tc(...WHITE);
  doc.text(`${artisan.nom} · ${artisan.metier}`, M, 26);
  doc.text(`${artisan.telephone} · ${artisan.ville}`, M, 31);

  b_(18); tc(...WHITE); doc.text(devis.numero, W-M, 16, { align:"right" });
  n_(7);  tc(...GRAY);  doc.text("DEVIS", W-M, 9, { align:"right" });
  doc.text(`Émis le ${formatDate(devis.dateCreation)}`, W-M, 22, { align:"right" });
  if (devis.dateValidite) doc.text(`Validité : ${formatDate(devis.dateValidite)}`, W-M, 27, { align:"right" });

  y = 48;

  // ── TITRE ──
  if (devis.titre) {
    b_(13); tc(...GRAY_DARK); doc.text(devis.titre, M, y); y += 8;
  }

  // ── INFOS CLIENT ──
  fc(...GRAY_LIGHT); dc(...BORDER); doc.setLineWidth(0.3);
  doc.roundedRect(M, y, (CW/2)-3, 28, 2, 2, "FD");
  doc.roundedRect(M+(CW/2)+3, y, (CW/2)-3, 28, 2, 2, "FD");
  b_(7); tc(...GRAY);
  doc.text("DE (ARTISAN)", M+3, y+6);
  doc.text("POUR (CLIENT)", M+(CW/2)+6, y+6);
  b_(10); tc(...GRAY_DARK);
  doc.text(artisan.nom,  M+3, y+13);
  doc.text(devis.client, M+(CW/2)+6, y+13);
  n_(8); tc(...SLATE);
  doc.text(artisan.metier,    M+3, y+18);
  doc.text(devis.typeMetier,  M+(CW/2)+6, y+18);
  doc.text(artisan.telephone, M+3, y+23);
  if (devis.telephone) doc.text(devis.telephone, M+(CW/2)+6, y+23);
  y += 35;

  // ── TABLE HEADER ──
  fc(...GREEN_DARK); doc.rect(M, y, CW, 8, "F");
  b_(7); tc(...WHITE);
  doc.text("PRESTATION",  M+3,    y+5.5);
  doc.text("QTÉ",         M+95,   y+5.5, { align:"center" });
  doc.text("PRIX UNIT.",  M+130,  y+5.5, { align:"center" });
  doc.text("TOTAL",       M+CW-3, y+5.5, { align:"right"  });
  y += 8;

  // ── LIGNES ──
  devis.lignes.forEach((l, i) => {
    const rh = 10;
    fc(...(i%2===0 ? WHITE : GRAY_LIGHT));
    dc(...BORDER); doc.setLineWidth(0.1);
    doc.rect(M, y, CW, rh, "F");
    b_(9); tc(...GRAY_DARK); doc.text(l.description, M+3, y+6.5);
    n_(8); tc(...GRAY);
    doc.text(`${l.quantite}${l.unite?` ${l.unite}`:""}`, M+95,   y+6.5, { align:"center" });
    doc.text(formatMontant(l.prixUnitaire),                M+130,  y+6.5, { align:"center" });
    b_(9); tc(...GRAY_DARK);
    doc.text(formatMontant(l.quantite*l.prixUnitaire),     M+CW-3, y+6.5, { align:"right"  });
    y += rh;
  });

  // ── TOTAL ──
  y += 3;
  fc(...GREEN); doc.roundedRect(M+CW-70, y, 70, 13, 2, 2, "F");
  n_(8); tc(...GREEN_LIGHT); doc.text("TOTAL TTC", M+CW-67, y+5);
  b_(11); tc(...WHITE); doc.text(formatMontant(totalDevis(devis.lignes)), M+CW-3, y+10, { align:"right" });
  fc(...GRAY_LIGHT); doc.rect(M, y, CW-70, 13, "F");
  n_(8); tc(...GRAY); doc.text(`${devis.lignes.length} prestation(s)`, M+3, y+7);
  y += 19;

  // ── ACOMPTES ──
  if (devis.acomptes && devis.acomptes.length > 0) {
    const totalAc = devis.acomptes.reduce((a:number,ac:any)=>a+ac.montant, 0);
    const reste   = totalDevis(devis.lignes) - totalAc;
    fc(...AMBER_LIGHT); dc(...AMBER_BORDER); doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 8+devis.acomptes.length*7+8, 2, 2, "FD");
    b_(7); tc(...AMBER_DARK); doc.text("SUIVI DES PAIEMENTS", M+3, y+5);
    devis.acomptes.forEach((ac:any, i:number)=>{
      n_(8); tc(...SLATE);
      doc.text(`• ${formatDate(ac.date)}${ac.note?` — ${ac.note}`:""}`, M+3, y+11+i*7);
      b_(8); tc(...GREEN); doc.text(`+${formatMontant(ac.montant)}`, M+CW-3, y+11+i*7, { align:"right" });
    });
    y += 12 + devis.acomptes.length*7;
    const isOk = reste <= 0;
    fc(...(isOk ? [240,253,244] as [number,number,number] : AMBER_LIGHT));
    dc(...(isOk ? GREEN_LIGHT : AMBER_BORDER));
    doc.roundedRect(M+CW-78, y, 78, 11, 2, 2, "FD");
    b_(8); tc(...(isOk ? GREEN_TEXT : AMBER_DARK));
    doc.text(isOk?"SOLDÉ ✓":"RESTE À PAYER", M+CW-74, y+4.5);
    b_(10); doc.text(formatMontant(Math.max(reste,0)), M+CW-3, y+9, { align:"right" });
    y += 16;
  }

  // ── NOTES ──
  if (devis.notes) {
    dc(...GOLD_DARK); doc.setLineWidth(0.8); doc.line(M, y, M, y+18);
    fc(...GRAY_LIGHT); dc(...BORDER); doc.setLineWidth(0.2);
    doc.roundedRect(M+2, y, CW-2, 18, 1, 1, "FD");
    b_(7); tc(...GRAY); doc.text("CONDITIONS & NOTES", M+5, y+5);
    n_(8); tc(...SLATE);
    const lines = doc.splitTextToSize(devis.notes, CW-12);
    doc.text(lines, M+5, y+10);
    y += 22;
  }

  // ── FOOTER ──
  fc(...GRAY_LIGHT); doc.rect(0, H-14, W, 14, "F");
  dc(...BORDER); doc.setLineWidth(0.2); doc.line(0, H-14, W, H-14);
  b_(8); tc(...GREEN); doc.text("Kazi", M, H-7);
  tc(...GOLD_DARK); doc.text("Devis", M+doc.getTextWidth("Kazi")+0.5, H-7);
  n_(7); tc(...GRAY);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} · ${devis.numero}`, M+25, H-7);
  doc.text("kazidevis.vercel.app", W-M, H-7, { align:"right" });

  doc.save(`KaziDevis_${devis.numero}_${devis.client.replace(/\s+/g,"-")}.pdf`);
}
