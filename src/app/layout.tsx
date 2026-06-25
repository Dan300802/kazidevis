import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KaziDevis — Devis & Finances Artisans",
  description: "Gérez vos devis et finances facilement. Application pour artisans au Togo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KaziDevis",
    startupImage: "/icon-512.png",
  },
  icons: {
    icon:  [{ url: "/icon-192.png", sizes: "192x192" }, { url: "/icon-512.png", sizes: "512x512" }],
    apple: [{ url: "/icon-192.png" }],
  },
  keywords: ["devis", "artisan", "togo", "finances", "facture", "kazi"],
  authors: [{ name: "KaziDevis" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16A34A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KaziDevis" />
      </head>
      <body className="bg-white min-h-dvh">{children}</body>
    </html>
  );
}
