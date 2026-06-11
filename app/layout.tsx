import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Mr. Delivery | Livraison rapide a Lubumbashi",
  description:
    "Livraison express, fiable et securisee pour particuliers, commerces, restaurants, pharmacies et entreprises a Lubumbashi.",
  icons: {
    icon: "/logo-mr-delivery.jpeg",
    shortcut: "/logo-mr-delivery.jpeg",
    apple: "/logo-mr-delivery.jpeg",
  },
  openGraph: {
    title: "Mr. Delivery | Livraison rapide a Lubumbashi",
    description:
      "Livraison express, fiable et securisee pour particuliers, commerces, restaurants, pharmacies et entreprises a Lubumbashi.",
    images: [
      {
        url: "/logo-mr-delivery.jpeg",
        width: 1080,
        height: 1080,
        alt: "Logo Mr. Delivery",
      },
    ],
    locale: "fr_CD",
    siteName: "Mr. Delivery",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mr. Delivery | Livraison rapide a Lubumbashi",
    description:
      "Livraison express, fiable et securisee pour particuliers, commerces, restaurants, pharmacies et entreprises a Lubumbashi.",
    images: ["/logo-mr-delivery.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
