import type { Metadata } from "next";
import { buildAudit } from "@/lib/audit/build";
import { EXAMPLES } from "@/lib/audit/examples";
import { ScoutClient } from "@/components/scout/ScoutClient";

export const metadata: Metadata = {
  title: "Scout: audit your GitHub",
  description:
    "A professional audit of any public GitHub. Ships an archetype card you can post; keeps the score private. The Athletic × Visual Capitalist treatment for builders.",
};

export default function ScoutPage() {
  const first = EXAMPLES[0]!;
  const initial = buildAudit(first.signals, {
    displayName: first.displayName,
    tagline: first.tagline,
    playsLike: first.playsLike,
    isExample: true,
  });
  const chips = EXAMPLES.map((e) => ({ key: e.key, displayName: e.displayName }));

  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ color: "var(--signal)" }}>Scout · the audit</div>
        <h1 className="h2" style={{ marginTop: 12 }}>
          Scout the builder. <span className="gold-text">Don't rank the person.</span>
        </h1>
        <p className="lead" style={{ marginTop: 14, maxWidth: 620 }}>
          Enter a public GitHub handle and the engine reads its real signal. You get an{" "}
          <strong style={{ color: "var(--ink)" }}>archetype card to post</strong>, no number, no tier, and a <strong style={{ color: "var(--ink)" }}>private audit</strong> only you unlock. Opt-in, real
          data, right to explanation: the way scoring a human should work.
        </p>

        <div style={{ marginTop: 34 }}>
          <ScoutClient initial={initial} examples={chips} />
        </div>
      </div>
    </section>
  );
}
