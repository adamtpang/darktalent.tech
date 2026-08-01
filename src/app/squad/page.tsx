import type { Metadata } from "next";
import { SquadBuilder } from "@/components/SquadBuilder";

export const metadata: Metadata = {
  title: "Squad Builder",
  description: "Assemble your founding five, Vision, Build, Influence, Capital, Grit, and get a team rating.",
};

export default function SquadPage() {
  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ color: "var(--signal)" }}>Squad builder</div>
        <h1 className="h2" style={{ marginTop: 12 }}>
          Build your <span className="gold-text">founding five.</span>
        </h1>
        <p className="lead" style={{ marginTop: 14, maxWidth: 560 }}>
          Tap a position, pick a legend. Each slot favors a different stat, chemistry rewards putting the right legend in the right role.
        </p>
        <div style={{ marginTop: 34 }}>
          <SquadBuilder />
        </div>
      </div>
    </section>
  );
}
