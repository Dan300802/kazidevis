"use client";
import type { Devis } from "@/types";
import { formatMontant, formatDate, totalDevis } from "./utils";

export async function exportDevisPDF(
  devis: Devis,
  artisan: { nom: string; metier: string; telephone: string; ville: string }
) {
  // Import dynamique jsPDF
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default?.jsPDF || jsPDFModule.default;
  
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; const H = 297; const M = 14; const CW = W - M * 2;
  let y = 0;

  const rgb = (hex: string): [number,number,number] => [
    parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)
  ];
  const fc = (h: string) => doc.setFillColor(...rgb(h));
  const tc = (h: string) => doc.setTextColor(...rgb(h));
  const dc = (h: string) => doc.setDrawColor(...rgb(h));
  const b  = (s: number) => { doc.setFont("helvetica","bold");   doc.setFontSize(s); };
  const n  = (s: number) => { doc.setFont("helvetica","normal"); doc.setFontSize(s); };

  // ── HEADER ──
  fc("#14532D"); doc.rect(0, 0, W, 40, "F");
  fc("#16A34A"); doc.rect(0, 28, W, 12, "F");

  // Nom app
  b(16); tc("#fff"); doc.text("Kazi", M, 16);
  const kaziW = doc.getTextWidth("Kazi");
  tc("#FBBF24"); doc.text("Devis", M + kaziW + 0.5, 16);
  n(8); tc("rgba(255,255,255,0.6)"); doc.text("GESTION ARTISANS · TOGO", M, 21);
  n(8); tc("rgba(255,255,255,0.8)");
  doc.text(`${artisan.nom} · ${artisan.metier}`, M, 26);
  doc.text(`${artisan.telephone} · ${artisan.ville}`, M, 31);

  // Numéro devis
  b(18); tc("#fff"); doc.text(devis.numero, W - M, 16, { align: "right" });
  n(7); tc("rgba(255,255,255,0.55)"); doc.text("DEVIS", W - M, 9, { align: "right" });
  doc.text(`Émis le ${formatDate(devis.dateCreation)}`, W - M, 22, { align: "right" });
  if (devis.dateValidite) doc.text(`Validité : ${formatDate(devis.dateValidite)}`, W - M, 27, { align: "right" });

  y = 48;

  // ── TITRE DEVIS ──
  if (devis.titre) {
    b(13); tc("#0F172A");
    doc.text(devis.titre, M, y);
    y += 8;
  }

  // ── INFOS CLIENT ──
  fc("#F8FAFC"); dc("#E2E8F0"); doc.setLineWidth(0.3);
  doc.roundedRect(M, y, (CW/2)-3, 28, 2, 2, "FD");
  doc.roundedRect(M+(CW/2)+3, y, (CW/2)-3, 28, 2, 2, "FD");

  b(7); tc("#94A3B8");
  doc.text("DE (ARTISAN)", M+3, y+6);
  doc.text("POUR (CLIENT)", M+(CW/2)+6, y+6);
  b(10); tc("#0F172A");
  doc.text(artisan.nom, M+3, y+13);
  doc.text(devis.client, M+(CW/2)+6, y+13);
  n(8); tc("#64748B");
  doc.text(artisan.metier, M+3, y+18);
  doc.text(devis.typeMetier, M+(CW/2)+6, y+18);
  doc.text(artisan.telephone, M+3, y+23);
  if (devis.telephone) doc.text(devis.telephone, M+(CW/2)+6, y+23);
  y += 35;

  // ── TABLE HEADER ──
  fc("#14532D"); doc.rect(M, y, CW, 8, "F");
  b(7); tc("#fff");
  doc.text("PRESTATION", M+3, y+5.5);
  doc.text("QTÉ", M+95, y+5.5, { align:"center" });
  doc.text("PRIX UNIT.", M+130, y+5.5, { align:"center" });
  doc.text("TOTAL", M+CW-3, y+5.5, { align:"right" });
  y += 8;

  // ── LIGNES ──
  devis.lignes.forEach((l, i) => {
    const rh = 10;
    fc(i%2===0?"#fff":"#F8FAFC"); dc("#F1F5F9"); doc.setLineWidth(0.1);
    doc.rect(M, y, CW, rh, "F");
    b(9); tc("#0F172A"); doc.text(l.description, M+3, y+6.5);
    n(8); tc("#94A3B8");
    doc.text(`${l.quantite}${l.unite?` ${l.unite}`:""}`, M+95, y+6.5, { align:"center" });
    doc.text(formatMontant(l.prixUnitaire), M+130, y+6.5, { align:"center" });
    b(9); tc("#0F172A");
    doc.text(formatMontant(l.quantite * l.prixUnitaire), M+CW-3, y+6.5, { align:"right" });
    y += rh;
  });

  // ── TOTAL ──
  y += 3;
  fc("#16A34A"); doc.roundedRect(M+CW-70, y, 70, 13, 2, 2, "F");
  n(8); tc("#BBF7D0"); doc.text("TOTAL TTC", M+CW-67, y+5);
  b(11); tc("#fff"); doc.text(formatMontant(totalDevis(devis.lignes)), M+CW-3, y+10, { align:"right" });
  fc("#F8FAFC"); doc.rect(M, y, CW-70, 13, "F");
  n(8); tc("#94A3B8"); doc.text(`${devis.lignes.length} prestation(s)`, M+3, y+7);
  y += 19;

  // ── ACOMPTES ──
  if (devis.acomptes && devis.acomptes.length > 0) {
    const totalAc = devis.acomptes.reduce((a:number, ac:any) => a+ac.montant, 0);
    const reste   = totalDevis(devis.lignes) - totalAc;
    fc("#FFFBEB"); dc("#FDE68A"); doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 8 + devis.acomptes.length*7 + 8, 2, 2, "FD");
    b(7); tc("#92400E"); doc.text("SUIVI DES PAIEMENTS", M+3, y+5);
    devis.acomptes.forEach((ac:any, i:number) => {
      n(8); tc("#374151");
      doc.text(`• ${formatDate(ac.date)}${ac.note?` — ${ac.note}`:""}`, M+3, y+11+i*7);
      b(8); tc("#16A34A");
      doc.text(`+${formatMontant(ac.montant)}`, M+CW-3, y+11+i*7, { align:"right" });
    });
    y += 12 + devis.acomptes.length*7;
    fc(reste<=0?"#F0FDF4":"#FFFBEB"); dc(reste<=0?"#BBF7D0":"#FDE68A"); doc.setLineWidth(0.4);
    doc.roundedRect(M+CW-78, y, 78, 11, 2, 2, "FD");
    b(8); tc(reste<=0?"#16A34A":"#854D0E");
    doc.text(reste<=0?"✓ SOLDÉ":"RESTE À PAYER", M+CW-74, y+4.5);
    b(10); doc.text(formatMontant(Math.max(reste,0)), M+CW-3, y+9, { align:"right" });
    y += 16;
  }

  // ── NOTES ──
  if (devis.notes) {
    dc("#FBBF24"); doc.setLineWidth(0.8); doc.line(M, y, M, y+18);
    fc("#F8FAFC"); dc("#E2E8F0"); doc.setLineWidth(0.2);
    doc.roundedRect(M+2, y, CW-2, 18, 1, 1, "FD");
    b(7); tc("#94A3B8"); doc.text("CONDITIONS & NOTES", M+5, y+5);
    n(8); tc("#475569");
    const lines = doc.splitTextToSize(devis.notes, CW-12);
    doc.text(lines, M+5, y+10);
    y += 22;
  }

  // ── FOOTER ──
  fc("#F8FAFC"); doc.rect(0, H-14, W, 14, "F");
  dc("#E2E8F0"); doc.setLineWidth(0.2); doc.line(0, H-14, W, H-14);
  b(8); tc("#16A34A"); doc.text("Kazi", M, H-7);
  tc("#D97706"); doc.text("Devis", M+doc.getTextWidth("Kazi")+0.5, H-7);
  n(7); tc("#94A3B8");
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} · ${devis.numero}`, M+25, H-7);
  doc.text("kazidevis.vercel.app", W-M, H-7, { align:"right" });

  // ── TÉLÉCHARGER ──
  const filename = `KaziDevis_${devis.numero}_${devis.client.replace(/\s+/g,"-")}.pdf`;
  doc.save(filename);
}
