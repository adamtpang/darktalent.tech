import type { Metadata } from "next";
import Link from "next/link";
import { loadPublicLeaderboard } from "@/lib/card/service";

export const metadata: Metadata = {
  title: "The board: every scored builder",
  description:
    "Every builder darktalent has scored, ranked by demonstrated public output. No invitation required to appear, the same way a box score doesn't need a player's permission. Claim your own card to be found and contacted.",
};

// The board changes as new opt-ins and discovery runs land, so it has to
// render per request rather than freeze whatever the pool looked like at
// the last build.
export const dynamic = "force-dynamic";

/**
 * The public leaderboard. Ranking is permissionless: it reads only public
 * GitHub signal, so a DISCOVERED profile appears here without ever being
 * asked, the same way sabermetrics never needed a player's consent to
 * compute his on-base percentage from public box scores. What still needs
 * the person's own opt-in is being placed in the PAID, contactable pool
 * skill.supply brokers (see /hiring and CARD_API.md), that boundary is
 * unchanged. Nobody's contact info is ever shown here, claimed or not.
 */
export default async function BoardPage() {
  const rows = await loadPublicLeaderboard();
  const claimedCount = rows.filter((r) => r.status === "CLAIMED").length;

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ color: "var(--signal)" }}>The board</div>
        <h1 className="h2" style={{ marginTop: 12 }}>
          Every scored builder. <span className="gold-text">No invitation required.</span>
        </h1>
        <p className="lead" style={{ marginTop: 14, maxWidth: 640 }}>
          Ranked from public GitHub signal alone, the same way a box score doesn&rsquo;t need a
          player&rsquo;s permission to compute his batting average. Recognize a handle below?{" "}
          <b style={{ color: "var(--ink)" }}>Claim it</b> to control what&rsquo;s shown and let
          companies contact you.
        </p>

        <div className="stat-strip" style={{ marginTop: 24 }}>
          <Stat n={String(rows.length)} l="scored builders" />
          <Stat n={String(claimedCount)} l="claimed" />
          <Stat n={String(rows.length - claimedCount)} l="unclaimed, waiting to be found" />
        </div>

        <div className="panel" style={{ marginTop: 30, padding: 0, overflow: "hidden" }}>
          {rows.length === 0 ? (
            <p style={{ padding: 20, color: "var(--ink-faint)", fontSize: 14 }}>
              No profiles scored yet. Run the discovery pipeline or{" "}
              <Link href="/scout" style={{ color: "var(--signal)" }}>scout a handle</Link> to seed it.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line-2)" }}>
                  <Th align="left">#</Th>
                  <Th align="left">Builder</Th>
                  <Th align="left">Status</Th>
                  <Th align="right">Score</Th>
                  <Th align="right">Confidence</Th>
                  <Th align="left"> </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.handle} style={{ borderBottom: "1px solid var(--line-2)" }}>
                    <Td>{i + 1}</Td>
                    <Td>
                      <a
                        href={`https://github.com/${r.handle}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ color: "var(--ink)", fontWeight: 600 }}
                      >
                        @{r.handle}
                      </a>
                      {r.headline && (
                        <div style={{ color: "var(--ink-faint)", fontSize: 12.5, marginTop: 2 }}>
                          {r.headline}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <span
                        className="chip"
                        style={{
                          fontSize: 11.5,
                          padding: "3px 9px",
                          color: r.status === "CLAIMED" ? "var(--signal)" : "var(--ink-faint)",
                          borderColor: r.status === "CLAIMED" ? "var(--signal-dim)" : "var(--line-2)",
                        }}
                      >
                        {r.status === "CLAIMED" ? "Claimed" : "Discovered"}
                      </span>
                    </Td>
                    <Td align="right">
                      <b className="font-mono">{Math.round(r.overall)}</b>
                    </Td>
                    <Td align="right">
                      <span className="font-mono" style={{ color: "var(--ink-faint)" }}>
                        {Math.round(r.confidence * 100)}%
                      </span>
                    </Td>
                    <Td>
                      {r.status !== "CLAIMED" && (
                        <Link href={`/scout?handle=${r.handle}`} style={{ color: "var(--signal)", fontSize: 12.5 }}>
                          Is this you? →
                        </Link>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display" style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em" }}>
        {n}
      </div>
      <div className="eyebrow" style={{ color: "var(--ink-faint)", marginTop: 4 }}>{l}</div>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th style={{ textAlign: align, padding: "10px 16px", color: "var(--ink-faint)", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {children}
    </th>
  );
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td style={{ textAlign: align, padding: "10px 16px", verticalAlign: "top" }}>{children}</td>
  );
}
