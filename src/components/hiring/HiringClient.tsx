"use client";

import { useState } from "react";
import { runShortlist } from "@/app/hiring/actions";
import type { Shortlist } from "@/lib/shortlist/types";
import { ShortlistView } from "./ShortlistView";

const SAMPLE_JD = `Senior Infrastructure Engineer

We are looking for a senior engineer to own our distributed systems platform.
You will ship production Rust and Go services, run the Kubernetes migration,
and set the technical direction for how we scale the API. You care about
tests, CI, and documentation, and you have taken systems from prototype to
production before.`;

export function HiringClient({ initial }: { initial: Shortlist }) {
  const [jd, setJd] = useState("");
  const [shortlist, setShortlist] = useState<Shortlist>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(text: string) {
    setLoading(true);
    setError(null);
    const res = await runShortlist(text);
    setLoading(false);
    if (res.ok) setShortlist(res.shortlist);
    else setError(res.error);
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(jd);
        }}
      >
        <textarea
          className="jd-input"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the job description here."
          rows={7}
          aria-label="Job description"
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <button className="btn btn-gold" type="submit" disabled={loading}>
            {loading ? "Matching…" : "Build the shortlist →"}
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => {
              setJd(SAMPLE_JD);
              submit(SAMPLE_JD);
            }}
          >
            Try a sample JD
          </button>
          {error && (
            <span className="font-mono" style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</span>
          )}
        </div>
      </form>

      <div style={{ marginTop: 30 }}>
        <ShortlistView shortlist={shortlist} />
      </div>

      {/* No buy button: the price is drafted in OFFER.md and awaiting sign off. */}
      <div
        className="panel"
        style={{
          marginTop: 22,
          background:
            "radial-gradient(120% 120% at 100% 0%, rgba(231,194,76,0.08), transparent 55%), rgba(255,255,255,0.018)",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className="eyebrow">Hiring for this seat?</div>
          <p style={{ marginTop: 10, fontSize: 15, color: "var(--ink-dim)", maxWidth: 460 }}>
            This run used the demo pool. Send us the real req and we return five scored
            candidates with the evidence behind every number.
          </p>
        </div>
        <a
          className="btn btn-gold"
          href="mailto:adamtpang@gmail.com?subject=darktalent%20shortlist%20request&body=Company%3A%0ARole%3A%0AJD%20link%20or%20paste%3A%0ABudget%20band%3A%0A"
        >
          Request a shortlist →
        </a>
      </div>
    </div>
  );
}
