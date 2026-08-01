import type { Metadata } from "next";
import { RANKED, toLegend } from "@/lib/rankings/model";
import { HeadToHead, type VersusEntry } from "@/components/rankings/HeadToHead";

export const metadata: Metadata = {
  title: "Versus",
  description: "Who's the bigger builder? Vote head-to-head and move the Elo rankings.",
};

const entries: VersusEntry[] = RANKED.map((b) => {
  const legend = toLegend(b);
  legend.blurb = undefined; // not rendered on the card, trims client payload
  return { id: b.id, elo: b.elo, legend };
});

export default function VersusPage() {
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap" style={{ maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div className="eyebrow" style={{ color: "var(--signal)" }}>The arena</div>
        </div>
        <HeadToHead entries={entries} endless />
      </div>
    </section>
  );
}
