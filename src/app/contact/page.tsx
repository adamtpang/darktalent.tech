import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Adam Pangelinan about darktalent shortlists, cards, consent, or data requests.",
  alternates: { canonical: `${SITE}/contact` },
};

export default function ContactPage() {
  return (
    <section className="section" style={{ paddingTop: 64 }}>
      <div className="wrap" style={{ maxWidth: 820 }}>
        <div className="eyebrow">Contact</div>
        <h1 className="h2" style={{ marginTop: 14 }}>
          Talk to the person operating darktalent.
        </h1>
        <p className="lead" style={{ marginTop: 20, maxWidth: 680 }}>
          Adam Pangelinan handles shortlist questions, card corrections, consent changes, privacy requests, and product feedback. Email is the direct support channel, and the subject line below identifies the request as darktalent-related.
        </p>
        <div className="panel" style={{ marginTop: 30, padding: 28 }}>
          <h2 className="font-display" style={{ fontSize: 23, fontWeight: 800 }}>Email Adam</h2>
          <p style={{ color: "var(--ink-dim)", marginTop: 10, lineHeight: 1.7 }}>
            Include the GitHub handle or shortlist order involved when relevant. For a data or consent request, state whether you want a correction, contact consent removed, the card hidden, or the stored profile deleted.
          </p>
          <a href="mailto:adamtpang@gmail.com?subject=darktalent%20request" className="btn btn-gold" style={{ marginTop: 22 }}>
            Email about darktalent
          </a>
        </div>
        <p style={{ color: "var(--ink-faint)", marginTop: 24, fontSize: 14, lineHeight: 1.6 }}>
          Looking to hire now? The self-serve path starts by pasting one real job description on the <Link href="/hiring" style={{ color: "var(--signal)" }}>hiring page</Link> before purchasing a $500 shortlist.
        </p>
      </div>
    </section>
  );
}
