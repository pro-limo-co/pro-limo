import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Oswald } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
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
  metadataBase: new URL("https://prolimodriver.com"),
  title: {
    default: "Professional Limousine Driver - Portland Chauffeur Service",
    template: "%s - Professional Limousine Driver",
  },
  description:
    "Professional Limousine Driver provides private chauffeur, black car, and airport transfer service around Portland, including Seattle, Eugene, Cannon Beach, Seaside, Astoria, and high-demand metro cities.",
  keywords: [
    "Portland limo service",
    "Portland chauffeur service",
    "PDX airport car service",
    "private chauffeur",
    "limo service",
    "airport transfer",
    "executive car service",
    "luxury transportation",
    "Professional Limousine Driver",
  ],
  openGraph: {
    title: "Professional Limousine Driver - Portland Chauffeur Service",
    description:
      "Private chauffeur, black car, and airport transfer service around Portland and the current regional service area.",
    type: "website",
    siteName: "Professional Limousine Driver",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Limousine Driver - Portland Chauffeur Service",
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
      suppressHydrationWarning
      className={`${cormorant.variable} ${geist.variable} ${geistMono.variable} ${oswald.variable}`}
    >
      <body className="page-frame">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
