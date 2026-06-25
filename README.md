# KaziDevis 🔨

Application de gestion de devis et finances pour artisans au Togo.

## Stack
- **Next.js 15** + TypeScript
- **Tailwind CSS v4**
- **Zustand** (état global + persistance localStorage)
- **jsPDF** (export PDF)
- **T-Money / Flooz** (paiement Mobile Money Togo)

## Lancer en local
```bash
npm install
npm run dev
# → http://localhost:3000
```

## Déployer sur Vercel

### Option 1 — Vercel CLI (recommandé)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2 — GitHub + Vercel Dashboard
1. Push sur GitHub : `git init && git add . && git commit -m "init" && git push`
2. Va sur [vercel.com](https://vercel.com) → "New Project"
3. Importe le repo GitHub
4. Vercel détecte Next.js automatiquement → **Deploy**
5. URL publique générée ex: `https://kazidevis.vercel.app`

## Variables d'environnement (production)
```
NEXT_PUBLIC_PAYMENT_API_KEY=ta_clé_tmoney_ou_flooz
```
À configurer dans **Vercel Dashboard → Settings → Environment Variables**

## Installer comme PWA sur Android
1. Ouvre l'URL dans **Chrome Android**
2. Menu (⋮) → **"Ajouter à l'écran d'accueil"**
3. L'app apparaît comme une vraie app native avec l'icône KaziDevis

## Structure
```
src/
├── app/              # Layout + page principale
├── components/
│   ├── screens/      # Splash, Auth, Home, Devis, Clients, Rapport, Finances, Profil, Premium
│   ├── charts/       # BarChart, LineChart, DonutChart (SVG natif)
│   ├── layout/       # BottomNav, TopBar
│   └── ui/           # Button, Input, Badge, PremiumGate
├── lib/              # pdf.ts, whatsapp.ts, tmoney.ts, auth.ts, rapport.ts, utils.ts
├── store/            # useAppStore (Zustand)
└── types/            # Interfaces TypeScript
```
