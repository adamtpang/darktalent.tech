import type { Metadata } from "next";
import Link from "next/link";
import { LEADER_ROWS, RANKED, COUNTRIES, fmtNetWorth } from "@/lib/rankings/model";
import { Leaderboard } from "@/components/rankings/Leaderboard";

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "The Forbes list, ranked by Elo. Live head-to-head ratings for the world's top living builders, net worth is the market cap, Elo is the game.",
};

export default function RankingsPage() {
  const totalB = RANKED.reduce((s, b) => s + b.netWorthB, 0);

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="eyebrow">The rankings</div>
        <h1 className="h2" style={{ marginTop: 12 }}>
          The Forbes list, ranked by <span className="gold-text">Elo</span>.
        </h1>
        <p className="lead" style={{ marginTop: 14, maxWidth: 640 }}>
          Every builder gets a rating. Net worth is the market cap; Elo is the
          game, and it moves every time someone votes.{" "}
          <Link href="/versus" style={{ color: "var(--signal)" }}>
            Cast a vote →
          </Link>
        </p>

        <div className="stat-strip">
          <Stat n={String(RANKED.length)} l="builders" />
          <Stat n={String(COUNTRIES.length)} l="countries" />
          <Stat n={fmtNetWorth(totalB)} l="combined net worth" />
          <Stat n="Forbes 2025" l="snapshot" mono />
        </div>

        <div style={{ marginTop: 30 }}>
          <Leaderboard rows={LEADER_ROWS} />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l, mono }: { n: string; l: string; mono?: boolean }) {
  return (
    <div>
      <div className={mono ? "font-mono" : "font-display"} style={{ fontWeight: 800, fontSize: mono ? 18 : 26, letterSpacing: "-0.03em" }}>
        {n}
      </div>
      <div className="eyebrow" style={{ color: "var(--ink-faint)", marginTop: 4 }}>{l}</div>
    </div>
  );
}
