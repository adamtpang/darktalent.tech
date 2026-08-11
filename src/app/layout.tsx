import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { FLEET_HUB, FLEET_SISTERS } from "@/lib/fleet";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE = "https://darktalent.tech";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "darktalent: Moneyball for tech & business",
    template: "%s · darktalent",
  },
  description:
    "Everyone gets a card. Scout undervalued talent, rate the legends, living and dead, and build your dream squad. Signal over pedigree.",
  keywords: [
    "talent",
    "moneyball",
    "network state",
    "founders",
    "tech talent",
    "trading cards",
    "squad builder",
  ],
  openGraph: {
    title: "darktalent: Moneyball for tech & business",
    description:
      "Everyone gets a card. Scout the undervalued, rate the legends, build your squad.",
    url: SITE,
    siteName: "darktalent",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "darktalent: Moneyball for tech & business",
    description: "Everyone gets a card. Build your squad of legends.",
  },
};

function Nav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(12px)",
        background: "rgba(8,9,12,0.7)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <nav className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="font-display"
            style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.04em" }}
          >
            dark<span className="gold-text">talent</span>
          </span>
          <span className="chip" style={{ padding: "3px 8px", fontSize: 9 }}>BETA</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/scout" className="chip">Scout</Link>
          <Link href="/board" className="chip nav-hide-sm">Board</Link>
          <Link href="/duel" className="chip nav-hide-sm">Duel</Link>
          <Link href="/rankings" className="chip nav-hide-sm">Rankings</Link>
          <Link href="/hiring" className="btn btn-gold" style={{ padding: "9px 16px" }}>
            Hire
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 40 }}>
      <div
        className="wrap"
        style={{ padding: "48px 24px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.04em" }}>
            dark<span className="gold-text">talent</span>
          </div>
          <p style={{ color: "var(--ink-faint)", fontSize: 13, marginTop: 6, maxWidth: 320 }}>
            Moneyball for tech & business. The 1729 in the rough.
          </p>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: "var(--ink-dim)" }}>
          <Link href="/hiring">Hire</Link>
          <Link href="/scout">Scout</Link>
          <Link href="/board">Board</Link>
          <Link href="/cards">Legends</Link>
          <a href="https://ns.com" target="_blank" rel="noreferrer">Network School ↗</a>
        </div>
      </div>
      <div className="wrap" style={{ paddingBottom: 20 }}>
        <div className="fleet-ring">
          <span>Part of the adam.inc fleet</span>
          <span className="sep">·</span>
          <a href={FLEET_HUB.url} target="_blank" rel="noreferrer">{FLEET_HUB.name}</a>
          {FLEET_SISTERS.map((s) => (
            <span key={s.url} style={{ display: "inline-flex", gap: 14, alignItems: "center" }}>
              <span className="sep">·</span>
              <a href={s.url} target="_blank" rel="noreferrer" title={s.one}>{s.name}</a>
            </span>
          ))}
        </div>
      </div>
      <div className="wrap" style={{ paddingBottom: 28, color: "var(--ink-faint)", fontSize: 12, fontFamily: "var(--font-mono), monospace" }}>
        © {new Date().getFullYear()} darktalent.tech · built for the network state · built by{" "}
        <a href="https://adampang.com" target="_blank" rel="noreferrer">Adam Pangelinan</a>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
