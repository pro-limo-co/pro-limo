import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prolimo.com"),
  title: {
    default: "Pro Limo — Private Chauffeur, Worldwide",
    template: "%s — Pro Limo",
  },
  description:
    "An hour earlier than you need. A vehicle quieter than the city. Pro Limo is private chauffeur service for travelers and businesses in 500+ cities — flat rates, professional drivers, and a flawless arrival every time.",
  keywords: [
    "private chauffeur",
    "limo service",
    "airport transfer",
    "executive car service",
    "luxury transportation",
    "Pro Limo",
  ],
  openGraph: {
    title: "Pro Limo — Private Chauffeur, Worldwide",
    description:
      "Private chauffeur service in 500+ cities. Flat rates. Professional drivers. A flawless arrival every time.",
    type: "website",
    siteName: "Pro Limo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pro Limo — Private Chauffeur, Worldwide",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${geist.variable} ${geistMono.variable} ${oswald.variable}`}
    >
      <body className="page-frame">{children}</body>
    </html>
  );
}
