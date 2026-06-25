"use client";
import type { Devis } from "@/types";
import { formatMontant, formatDate, totalDevis } from "./utils";

export async function exportDevisPDF(devis: Devis, artisan: { nom: string; metier: string; telephone: string; ville: string }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; const H = 297; const M = 14; const CW = W - M * 2;
  let y = 0;

  const rgb = (hex: string): [number,number,number] => [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  const fc  = (h: string) => doc.setFillColor(...rgb(h));
  const tc  = (h: string) => doc.setTextColor(...rgb(h));
  const dc  = (h: string) => doc.setDrawColor(...rgb(h));
  const b   = (s: number) => { doc.setFont("helvetica","bold");   doc.setFontSize(s); };
  const n   = (s: number) => { doc.setFont("helvetica","normal"); doc.setFontSize(s); };

  // ── HEADER VERT ──
  fc("#14532D"); doc.rect(0, 0, W, 42, "F");
  fc("#16A34A"); doc.rect(0, 28, W, 14, "F");

  // Logo box
  fc("rgba(255,255,255,0.12)"); doc.roundedRect(M, 6, 28, 28, 3, 3, "F");

  // Document icon (simplifié)
  fc("#fff"); doc.roundedRect(M+4, 9, 14, 18, 1, 1, "F");
  fc("#86EFAC"); doc.triangle(M+14, 9, M+18, 13, M+14, 13, "F");
  fc("#FBBF24"); doc.circle(M+11, 23, 3.5, "F");
  fc("#F59E0B"); doc.circle(M+11, 23, 2.8, "F");
  // check
  tc("#fff"); b(5); doc.text("✓", M+9.5, 24.5);
  // K
  dc("#FBBF24"); doc.setLineWidth(1.5);
  doc.line(M+20, 10, M+20, 30);
  dc("#F59E0B");
  doc.line(M+20, 20, M+27, 10);
  doc.line(M+20, 20, M+27, 30);

  // Nom artisan
  b(15); tc("#fff");
  doc.text("Kazi", M+32, 16);
  tc("#FBBF24"); doc.text("Devis", M+32+doc.getTextWidth("Kazi")+1, 16);
  n(8); tc("rgba(255,255,255,0.6)");
  doc.text("GESTION ARTISANS · TOGO", M+32, 21);
  n(8); tc("rgba(255,255,255,0.8)");
  doc.text(`${artisan.nom} · ${artisan.metier}`, M+32, 26);
  doc.text(`${artisan.telephone} · ${artisan.ville}`, M+32, 31);

  // Numéro devis
  b(20); tc("#fff");
  doc.text(devis.numero, W-M, 18, { align: "right" });
  n(7); tc("rgba(255,255,255,0.55)");
  doc.text("DEVIS", W-M, 10, { align: "right" });
  doc.text(`Émis le ${formatDate(devis.dateCreation)}`, W-M, 23, { align: "right" });
  if (devis.dateValidite) doc.text(`Validité : ${formatDate(devis.dateValidite)}`, W-M, 28, { align: "right" });

  y = 50;

  // ── INFOS CLIENT & ARTISAN ──
  fc("#F8FAFC"); dc("#E2E8F0"); doc.setLineWidth(0.3);
  doc.roundedRect(M, y, (CW/2)-4, 30, 2, 2, "FD");
  doc.roundedRect(M+(CW/2)+4, y, (CW/2)-4, 30, 2, 2, "FD");

  b(7); tc("#94A3B8");
  doc.text("DE (ARTISAN)", M+4, y+6);
  doc.text("POUR (CLIENT)", M+(CW/2)+8, y+6);

  b(10); tc("#0F172A");
  doc.text(artisan.nom, M+4, y+12);
  doc.text(devis.client, M+(CW/2)+8, y+12);

  n(8); tc("#64748B");
  doc.text(artisan.metier, M+4, y+17);
  doc.text(devis.typeMetier, M+(CW/2)+8, y+17);
  doc.text(artisan.telephone, M+4, y+22);
  if (devis.telephone) doc.text(devis.telephone, M+(CW/2)+8, y+22);

  y += 38;

  // ── TABLE HEADER ──
  fc("#14532D"); doc.rect(M, y, CW, 9, "F");
  b(7); tc("#fff");
  doc.text("PRESTATION",       M+3,         y+6);
  doc.text("QTÉ",              M+95,        y+6, {align:"center"});
  doc.text("PRIX UNIT.",       M+125,       y+6, {align:"center"});
  doc.text("TOTAL",            M+CW-3,      y+6, {align:"right"});
  y += 9;

  // ── LIGNES ──
  devis.lignes.forEach((l, i) => {
    const rh = 12;
    fc(i%2===0 ? "#fff" : "#F8FAFC"); dc("#F1F5F9"); doc.setLineWidth(0.1);
    doc.rect(M, y, CW, rh, "F");
    b(9); tc("#0F172A"); doc.text(l.description, M+3, y+5);
    n(8); tc("#94A3B8"); doc.text(l.quantite + (l.unite ? ` ${l.unite}` : ""), M+95, y+5, {align:"center"});
    doc.text(formatMontant(l.prixUnitaire), M+125, y+5, {align:"center"});
    b(9); tc("#0F172A"); doc.text(formatMontant(l.quantite*l.prixUnitaire), M+CW-3, y+5, {align:"right"});
    y += rh;
  });

  // ── TOTAL ──
  y += 4;
  fc("#16A34A"); doc.roundedRect(M+CW-72, y, 72, 14, 2, 2, "F");
  n(8); tc("#BBF7D0"); doc.text("TOTAL TTC", M+CW-68, y+5);
  b(11); tc("#fff"); doc.text(formatMontant(totalDevis(devis.lignes)), M+CW-3, y+10, {align:"right"});
  fc("#F8FAFC"); doc.rect(M, y, CW-72, 14, "F");
  n(8); tc("#94A3B8"); doc.text(`${devis.lignes.length} prestation(s)`, M+3, y+8);
  y += 20;

  // ── ACOMPTES ──
  if (devis.acomptes && devis.acomptes.length > 0) {
    const totalAc  = devis.acomptes.reduce((a,ac) => a+ac.montant, 0);
    const reste    = totalDevis(devis.lignes) - totalAc;
    fc("#FFFBEB"); dc("#FDE68A"); doc.setLineWidth(0.4);
    doc.roundedRect(M, y, CW, 6 + devis.acomptes.length*8 + 8, 2, 2, "FD");
    b(7); tc("#92400E"); doc.text("SUIVI DES PAIEMENTS", M+4, y+5);
    devis.acomptes.forEach((ac, i) => {
      n(8); tc("#374151"); doc.text(`• Acompte du ${formatDate(ac.date)}${ac.note?` — ${ac.note}`:""}`, M+4, y+11+i*8);
      b(8); tc("#16A34A"); doc.text(`+${formatMontant(ac.montant)}`, M+CW-4, y+11+i*8, {align:"right"});
    });
    y += 10 + devis.acomptes.length*8;
    fc(reste<=0?"#F0FDF4":"#FFFBEB"); dc(reste<=0?"#BBF7D0":"#FDE68A"); doc.setLineWidth(0.5);
    doc.roundedRect(M+CW-80, y, 80, 12, 2, 2, "FD");
    b(8); tc(reste<=0?"#16A34A":"#854D0E");
    doc.text(reste<=0?"✓ SOLDÉ":"RESTE À PAYER", M+CW-76, y+5);
    b(10); doc.text(formatMontant(Math.max(reste,0)), M+CW-4, y+9, {align:"right"});
    y += 18;
  }

  // ── NOTES ──
  if (devis.notes) {
    dc("#FBBF24"); doc.setLineWidth(1);
    doc.line(M, y, M, y+20);
    fc("#F8FAFC"); dc("#E2E8F0"); doc.setLineWidth(0.3);
    doc.roundedRect(M+2, y, CW-2, 20, 1, 1, "FD");
    b(7); tc("#94A3B8"); doc.text("CONDITIONS & NOTES", M+6, y+5);
    n(8); tc("#475569");
    const lines = doc.splitTextToSize(devis.notes, CW-14);
    doc.text(lines, M+6, y+10);
    y += 26;
  }

  // ── FOOTER ──
  fc("#F8FAFC"); doc.rect(0, H-16, W, 16, "F");
  dc("#E2E8F0"); doc.setLineWidth(0.3); doc.line(0, H-16, W, H-16);
  b(8); tc("#16A34A"); doc.text("Kazi", M, H-8);
  tc("#D97706"); doc.text("Devis", M+doc.getTextWidth("Kazi")+0.5, H-8);
  n(7); tc("#94A3B8");
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} · Réf: ${devis.numero}-KD`, M+28, H-8);
  doc.text("kazidevis.vercel.app", W-M, H-8, {align:"right"});

  doc.save(`KaziDevis_${devis.numero}_${devis.client.replace(/\s+/g,"-")}.pdf`);
}
