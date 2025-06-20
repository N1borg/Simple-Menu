import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menu digital Lille | SimpleMenu - Solution SaaS pour bars & restaurants",
  description:
    "Créez et gérez facilement le menu digital de votre bar ou restaurant à Lille avec SimpleMenu. Solution SaaS rapide, mobile, QR code, adaptée à l’hôtellerie-restauration.",
  keywords:
    "Menu digital, SaaS, Lille, Restaurants, Bars, QR Code, Menu en ligne, SimpleMenu, Hôtellerie",
  openGraph: {
    title: "Menu digital Lille | SimpleMenu",
    description:
      "Créez et gérez facilement le menu digital de votre bar ou restaurant à Lille avec SimpleMenu.",
    url: "https://simple-menu.niborgpro.fr",
    siteName: "SimpleMenu",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://simple-menu.niborgpro.fr/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SimpleMenu - Menu digital Lille",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu digital Lille | SimpleMenu",
    description:
      "Créez et gérez facilement le menu digital de votre bar ou restaurant à Lille avec SimpleMenu.",
    images: ["https://simple-menu.niborgpro.fr/og-image.jpg"],
  },
  alternates: {
    canonical: "https://simple-menu.niborgpro.fr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
