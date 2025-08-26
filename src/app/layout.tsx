import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
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
  title: "Menu digital | Simple-Menu - Solution SaaS pour bars & restaurants",
  description:
    "Créez et gérez facilement le menu digital de votre bar ou restaurant avec Simple-Menu. Solution SaaS rapide, mobile, QR code, adaptée à l’hôtellerie-restauration.",
  keywords:
    "Menu digital, SaaS, Restaurants, Bars, QR Code, Menu en ligne, Simple-Menu, Hôtellerie",
  openGraph: {
    title: "Menu digital | Simple-Menu",
    description:
      "Créez et gérez facilement le menu digital de votre bar ou restaurant avec Simple-Menu.",
    url: "https://simple-menu.app",
    siteName: "Simple-Menu",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://simple-menu.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Simple-Menu - Menu digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu digital | Simple-Menu",
    description:
      "Créez et gérez facilement le menu digital de votre bar ou restaurant avec Simple-Menu.",
    images: ["https://simple-menu.app/og-image.jpg"],
  },
  alternates: {
    canonical: "https://simple-menu.app",
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
        <Toaster />
        {children}
      </body>
    </html>
  );
}
