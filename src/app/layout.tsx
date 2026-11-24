import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { AnalyticsBoot } from "@/components/AnalyticsBoot";
import { Footer, Header, StickyTourBar } from "@/components/SiteChrome";
import { SITE } from "@/content/site";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-body", display: "swap" });

/** The staged site must not compete with the live one in search until cutover. */
const indexable = process.env.SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${SITE.name} | Hood Canal wedding venue`, template: `%s | ${SITE.shortName}` },
  description:
    "Waterfront weddings in historic Port Gamble, WA: St. Paul's Church (1879) and the Hood Canal Vista Pavilion. Check your date and book a tour.",
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f7f2ea", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <AnalyticsBoot />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyTourBar />
      </body>
    </html>
  );
}
