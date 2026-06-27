"use client";
import type { Devis } from "@/types";
import { totalDevis, formatDate } from "./utils";

// Formate montant SANS caractères spéciaux pour PDF
function fmt(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
}

export async function exportDevisPDF(
  devis: Devis,
  artisan: { nom: string; metier: string; telephone: string; ville: string }
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; const H = 297; const M = 14; const CW = W - M * 2;
  let y = 0;

  const fc = (r:number,g:number,b:number) => doc.setFillColor(r,g,b);
  const tc = (r:number,g:number,b:number) => doc.setTextColor(r,g,b);
  const dc = (r:number,g:number,b:number) => doc.setDrawColor(r,g,b);
  const B  = (s:number) => { doc.setFont("helvetica","bold");   doc.setFontSize(s); };
  const N  = (s:number) => { doc.setFont("helvetica","normal"); doc.setFontSize(s); };

  // ── HEADER ──
  fc(20,83,45);  doc.rect(0, 0, W, 40, "F");
  fc(22,163,74); doc.rect(0, 30, W, 10, "F");

  B(16); tc(255,255,255); doc.text("Kazi", M, 16);
  const kw = doc.getTextWidth("Kazi");
  tc(251,191,36); doc.text("Devis", M+kw+0.5, 16);
  N(8);  tc(187,247,208); doc.text("GESTION ARTISANS - TOGO", M, 21);
  N(8);  tc(255,255,255);
  doc.text(`${artisan.nom} - ${artisan.metier}`, M, 26);
  doc.text(`${artisan.telephone} - ${artisan.ville}`, M, 31);

  B(18); tc(255,255,255); doc.text(devis.numero, W-M, 16, { align:"right" });
  N(7);  tc(148,163,184); doc.text("DEVIS", W-M, 9, { align:"right" });
  N(8);  tc(255,255,255);
  doc.text(`Emis le ${formatDate(devis.dateCreation)}`, W-M, 22, { align:"right" });
  if (devis.dateValidite) doc.text(`Validite : ${formatDate(devis.dateValidite)}`, W-M, 27, { align:"right" });

  y = 48;

  // ── TITRE ──
  if (devis.titre) {
    B(13); tc(15,23,42); doc.text(devis.titre, M, y); y += 8;
  }

  // ── INFOS CLIENT ──
  fc(248,250,252); dc(226,232,240); doc.setLineWidth(0.3);
  doc.roundedRect(M,       y, (CW/2)-3, 30, 2, 2, "FD");
  doc.roundedRect(M+(CW/2)+3, y, (CW/2)-3, 30, 2, 2, "FD");

  B(7); tc(148,163,184);
  doc.text("DE (ARTISAN)",  M+3,         y+6);
  doc.text("POUR (CLIENT)", M+(CW/2)+6,  y+6);
  B(10); tc(15,23,42);
  doc.text(artisan.nom,  M+3,        y+13);
  doc.text(devis.client, M+(CW/2)+6, y+13);
  N(8); tc(71,85,105);
  doc.text(artisan.metier,    M+3,        y+19);
  doc.text(devis.typeMetier,  M+(CW/2)+6, y+19);
  doc.text(artisan.telephone, M+3,        y+25);
  if (devis.telephone) doc.text(devis.telephone, M+(CW/2)+6, y+25);
  y += 37;

  // ── TABLE HEADER ──
  fc(20,83,45); doc.rect(M, y, CW, 9, "F");
  B(7); tc(255,255,255);
  doc.text("DESCRIPTION",  M+3,     y+6);
  doc.text("QTE",          M+95,    y+6, { align:"center" });
  doc.text("PRIX UNIT.",   M+135,   y+6, { align:"center" });
  doc.text("TOTAL",        M+CW-3,  y+6, { align:"right"  });
  y += 9;

  // ── LIGNES ──
  devis.lignes.forEach((l, i) => {
    const rh   = 11;
    const even = i%2===0;
    fc(...(even ? [255,255,255] : [248,250,252]) as [number,number,number]);
    dc(241,245,249); doc.setLineWidth(0.1);
    doc.rect(M, y, CW, rh, "F");

    B(9);  tc(15,23,42);  doc.text(l.description, M+3, y+7);
    N(8);  tc(100,116,139);
    const qteStr = `${l.quantite}${l.unite ? " "+l.unite : ""}`;
    doc.text(qteStr,                     M+95,   y+7, { align:"center" });
    doc.text(fmt(l.prixUnitaire),        M+135,  y+7, { align:"center" });
    B(9);  tc(15,23,42);
    doc.text(fmt(l.quantite*l.prixUnitaire), M+CW-3, y+7, { align:"right" });
    y += rh;
  });

  // ── TOTAL ──
  y += 3;
  fc(22,163,74); doc.roundedRect(M+CW-72, y, 72, 14, 2, 2, "F");
  N(8);  tc(187,247,208); doc.text("TOTAL TTC",            M+CW-69, y+5.5);
  B(11); tc(255,255,255); doc.text(fmt(totalDevis(devis.lignes)), M+CW-3, y+11, { align:"right" });
  fc(248,250,252); doc.rect(M, y, CW-72, 14, "F");
  N(8);  tc(148,163,184); doc.text(`${devis.lignes.length} prestation(s)`, M+3, y+8);
  y += 20;

  // ── ACOMPTES ──
  if (devis.acomptes && devis.acomptes.length > 0) {
    const totalAc = devis.acomptes.reduce((a:number,ac:any)=>a+ac.montant, 0);
    const reste   = totalDevis(devis.lignes) - totalAc;
    fc(255,251,235); dc(253,230,138); doc.setLineWidth(0.3);
    const ah = 10 + devis.acomptes.length * 8 + 6;
    doc.roundedRect(M, y, CW, ah, 2, 2, "FD");
    B(7); tc(146,64,14); doc.text("SUIVI DES PAIEMENTS", M+4, y+6);
    devis.acomptes.forEach((ac:any, i:number) => {
      N(8); tc(71,85,105);
      const note = ac.note ? ` - ${ac.note}` : "";
      doc.text(`- ${formatDate(ac.date)}${note}`, M+4, y+13+i*8);
      B(8); tc(22,163,74);
      doc.text(`+${fmt(ac.montant)}`, M+CW-4, y+13+i*8, { align:"right" });
    });
    y += ah + 4;
    const isOk = reste <= 0;
    fc(...(isOk ? [240,253,244] : [255,251,235]) as [number,number,number]);
    dc(...(isOk ? [187,247,208] : [253,230,138]) as [number,number,number]);
    doc.roundedRect(M+CW-80, y, 80, 12, 2, 2, "FD");
    B(8); tc(...(isOk ? [21,128,61] : [146,64,14]) as [number,number,number]);
    doc.text(isOk ? "SOLDE" : "RESTE A PAYER", M+CW-76, y+5);
    B(10); doc.text(fmt(Math.max(reste,0)), M+CW-4, y+10, { align:"right" });
    y += 18;
  }

  // ── NOTES ──
  if (devis.notes) {
    dc(217,119,6); doc.setLineWidth(0.8);
    doc.line(M, y, M, y+20);
    fc(248,250,252); dc(226,232,240); doc.setLineWidth(0.2);
    doc.roundedRect(M+2, y, CW-2, 20, 1, 1, "FD");
    B(7); tc(148,163,184); doc.text("CONDITIONS ET NOTES", M+5, y+5.5);
    N(8); tc(71,85,105);
    const lines = doc.splitTextToSize(devis.notes, CW-14);
    doc.text(lines, M+5, y+11);
    y += 26;
  }

  // ── SIGNATURE ──
  y = Math.max(y, H - 80);
  if (y > H - 82) { doc.addPage(); y = 20; }

  B(8); tc(148,163,184); doc.text("SIGNATURES", M, y); y += 6;
  dc(226,232,240); doc.setLineWidth(0.3);

  // Artisan
  fc(248,250,252);
  doc.roundedRect(M, y, (CW/2)-6, 40, 2, 2, "FD");
  N(8); tc(148,163,184); doc.text("Signature de l'artisan", M+4, y+6);
  N(7); tc(100,116,139); doc.text(artisan.nom, M+4, y+12);
  // Ligne de signature
  dc(148,163,184); doc.setLineWidth(0.5);
  doc.line(M+4, y+30, M+(CW/2)-10, y+30);
  N(7); tc(148,163,184); doc.text("Signature + cachet", M+4, y+35);

  // Client
  fc(248,250,252);
  doc.roundedRect(M+(CW/2)+6, y, (CW/2)-6, 40, 2, 2, "FD");
  N(8); tc(148,163,184); doc.text("Signature du client", M+(CW/2)+10, y+6);
  N(7); tc(100,116,139); doc.text(devis.client, M+(CW/2)+10, y+12);
  doc.line(M+(CW/2)+10, y+30, M+CW-4, y+30);
  N(7); tc(148,163,184); doc.text("Lu et approuve", M+(CW/2)+10, y+35);

  y += 48;

  // ── FOOTER ──
  fc(248,250,252); doc.rect(0, H-14, W, 14, "F");
  dc(226,232,240); doc.setLineWidth(0.2); doc.line(0, H-14, W, H-14);
  B(8); tc(22,163,74);   doc.text("Kazi",   M, H-7);
  tc(217,119,6);          doc.text("Devis",  M+doc.getTextWidth("Kazi")+0.5, H-7);
  N(7); tc(148,163,184);
  doc.text(`Genere le ${new Date().toLocaleDateString("fr-FR")} - ${devis.numero}`, M+25, H-7);
  doc.text("kazidevis.vercel.app", W-M, H-7, { align:"right" });

  doc.save(`KaziDevis_${devis.numero}_${devis.client.replace(/\s+/g,"-")}.pdf`);
}
