import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What darktalent collects, why it is used, which services receive it, and how to request deletion.",
  alternates: { canonical: `${SITE}/privacy` },
};

const headingStyle = { fontSize: 22, fontWeight: 800, marginTop: 18 } as const;

export default function PrivacyPage() {
  return (
    <section className="section" style={{ paddingTop: 64 }}>
      <div className="wrap" style={{ maxWidth: 820 }}>
        <div className="eyebrow">Privacy</div>
        <h1 className="h2" style={{ marginTop: 14 }}>Privacy policy</h1>
        <p style={{ color: "var(--ink-faint)", marginTop: 10, fontSize: 13 }}>Last updated August 30, 2026</p>

        <div style={{ display: "grid", gap: 18, marginTop: 28, color: "var(--ink-dim)", fontSize: 16, lineHeight: 1.72 }}>
          <p>
            Darktalent is operated by Adam Pangelinan. This policy describes the data used by the public website, GitHub audit, consent-based talent pool, hiring tool, and hosted checkout. Darktalent does not require an account to browse the public pages or use the initial shortlist demonstration.
          </p>

          <h2 className="font-display" style={headingStyle}>Public GitHub audits and cards</h2>
          <p>
            When someone enters a GitHub handle, darktalent requests public profile, repository, contribution, pull request, review, issue, language, star, fork, documentation, and activity signals from GitHub. The audit result is calculated on the server. Entering a handle for an audit does not by itself add that person to the paid hiring pool.
          </p>
          <p>
            When a builder claims a card, darktalent stores the handle, public GitHub signal snapshot, calculated score and breakdown, opt-in source, and the builder&apos;s display and contact consent choices. Cross-site opt-ins may store a salted hash of the request IP for consent records; the application does not store the raw IP in that record.
          </p>

          <h2 className="font-display" style={headingStyle}>Hiring and payment</h2>
          <p>
            A job description pasted into the hiring tool is processed on the server to build a role profile and shortlist. The current application code does not write that text to the darktalent database. Purchasing a shortlist opens Stripe&apos;s hosted checkout, where Stripe collects and processes payment and checkout information under its own privacy terms.
          </p>

          <h2 className="font-display" style={headingStyle}>Analytics and service providers</h2>
          <p>
            Darktalent uses Vercel to host the website and Vercel Web Analytics to understand aggregate page usage. Hosting infrastructure necessarily receives request information such as IP address, browser details, requested route, and timing data. GitHub supplies public developer data, Stripe hosts checkout, and the configured PostgreSQL provider stores consented card records.
          </p>

          <h2 className="font-display" style={headingStyle}>Choices and deletion</h2>
          <p>
            A builder can choose profile display separately from direct recruiter contact. Revoking display consent hides the profile from darktalent surfaces. To correct a card, remove contact permission, hide a profile, request deletion, or ask a privacy question, use the <Link href="/contact" style={{ color: "var(--signal)" }}>contact page</Link> and include the relevant GitHub handle.
          </p>

          <p>
            Darktalent keeps consent and score records only while they support the product, an audit trail, or a legal obligation. The service is a beta and this policy will be updated when collection, vendors, or user controls materially change. The update date above identifies the version currently published.
          </p>
        </div>
      </div>
    </section>
  );
}
