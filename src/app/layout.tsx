import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { ScrollEngine } from "@/components/shell/ScrollEngine";
import { site } from "@/content/site";
import { indexable } from "@/lib/seo";
import "./globals.css";

// Display: Hubot Sans, variable weight 200-900 and width 75%-125% (SIL OFL 1.1).
const hubot = localFont({
  src: [
    {
      path: "../fonts/HubotSans-latin-wdth-wght.woff2",
      weight: "200 900",
      style: "normal",
    },
  ],
  declarations: [{ prop: "font-stretch", value: "75% 125%" }],
  variable: "--font-hubot",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Text: Switzer, variable weight 100-900 (ITF Free Font License v2.0).
// The file is used exactly as supplied. The licence forbids modifying or subsetting it.
const switzer = localFont({
  src: [
    {
      path: "../fonts/Switzer-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Data only: JetBrains Mono, variable weight 100-800 (SIL OFL 1.1).
const jetbrains = localFont({
  src: [
    {
      path: "../fonts/JetBrainsMono-latin-wght.woff2",
      weight: "100 800",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Software, embedded systems, networks and CCTV`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Noindex until SITE_INDEXABLE=true is set at build time (D-44).
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | Software, embedded systems, networks and CCTV`,
    description: site.description,
    url: "/",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Software, embedded systems, networks and CCTV`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f6fa",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${hubot.variable} ${switzer.variable} ${jetbrains.variable}`}>
      <body className="bg-paper font-text text-body text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
        >
          Skip to content
        </a>
        <ScrollEngine />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
