import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "How darktalent scores public work and builds consent-based hiring shortlists.",
  alternates: { canonical: `${SITE}/about` },
};

export default function AboutPage() {
  return (
    <section className="section" style={{ paddingTop: 64 }}>
      <div className="wrap" style={{ maxWidth: 820 }}>
        <div className="eyebrow">About darktalent</div>
        <h1 className="h2" style={{ marginTop: 14 }}>
          Evidence for overlooked builders.
        </h1>
        <div style={{ display: "grid", gap: 22, marginTop: 28, color: "var(--ink-dim)", fontSize: 17, lineHeight: 1.7 }}>
          <p>
            Darktalent is a talent discovery and hiring experiment operated by Adam Pangelinan. The product reads public GitHub activity, turns that evidence into an explainable six-stat score, and helps companies compare a small, relevant group of builders without relying only on school names or previous employers.
          </p>
          <p>
            The current hiring offer is a five-person shortlist for one job description at a flat price of $500. Each candidate is matched to the role and presented with the evidence behind the score. Candidates can audit a public GitHub handle for free, claim their own card, choose whether companies may contact them, and revoke that consent.
          </p>
          <p>
            Darktalent separates public scoring from the paid contactable pool. Public GitHub signals may be used to calculate a ranking, while inclusion in a company shortlist requires the builder to opt in to profile display. Direct contact requires a separate consent choice. The product does not sell job seekers access to their own opportunities.
          </p>
          <p>
            The project is in beta. Its scoring model is an aid for discovery, not a claim about a person&apos;s worth and not a substitute for interviews, references, work trials, or human judgment. The public legends, rankings, and squad builder make the model inspectable before anyone uses it for hiring.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
          <Link href="/hiring" className="btn btn-gold">Build a shortlist</Link>
          <Link href="/contact" className="btn btn-ghost">Contact Adam</Link>
        </div>
      </div>
    </section>
  );
}
