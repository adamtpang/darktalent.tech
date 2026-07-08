import type { CSSProperties } from "react";
import Link from "next/link";
import { LEGENDS, getLegend } from "@/lib/cards/legends";
import { overall, initials, ROLE_ABBR } from "@/lib/cards/rating";
import { STAT_FULL, STAT_KEYS } from "@/lib/cards/types";
import type { Legend } from "@/lib/cards/types";
import { PlayerCard } from "@/components/PlayerCard";
import { TiltCard } from "@/components/TiltCard";
import { LEADER_ROWS } from "@/lib/rankings/model";
import { fmtNetWorth, flagOf, tierFromOverall } from "@/lib/rankings/format";
import { Sparkline } from "@/components/rankings/Sparkline";

const pick = (ids: string[]) => ids.map(getLegend).filter(Boolean) as Legend[];

const heroCards = pick(["jobs", "musk", "ramanujan"]);
const featured = pick([
  "musk", "jobs", "ramanujan", "huang", "rockefeller", "balaji",
  "bezos", "tesla", "buffett", "chanel", "gates", "walton",
]);
const ticker = [...LEGENDS].sort((a, b) => overall(b.stats) - overall(a.stats)).slice(0, 20);

const STAT_DESC: Record<string, string> = {
  vis: "Sees the future before it's obvious.",
  exe: "Ships. Relentlessly. Against odds.",
  inf: "Bends people, markets, and culture.",
  ino: "Creates what didn't exist.",
  cap: "Value created and captured.",
  grt: "Survives the valley of death.",
};

export default function Home() {
  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="section" style={{ paddingTop: 72, paddingBottom: 64 }}>
        <div className="wrap hero-grid">
          <div className="rise">
            <div className="eyebrow">Moneyball · for builders</div>
            <h1 className="h-title" style={{ marginTop: 18 }}>
              Everyone gets
              <br />
              a <span className="gold-text">card.</span>
            </h1>
            <p className="lead" style={{ marginTop: 22, maxWidth: 480 }}>
              Scout undervalued talent the way Oakland scouted hitters. Rate the
              legends — living and dead — build your dream squad, and surface the{" "}
              <strong style={{ color: "var(--ink)" }}>1729 hiding in plain sight.</strong>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
              <Link href="/rankings" className="btn btn-gold">See the rankings →</Link>
              <Link href="/versus" className="btn btn-ghost">Play head-to-head</Link>
            </div>
            <div
              className="font-mono"
              style={{ marginTop: 26, color: "var(--ink-faint)", fontSize: 12, display: "flex", gap: 18, flexWrap: "wrap" }}
            >
              <span>◆ {LEGENDS.length} legends seeded</span>
              <span>◆ 6-stat rating engine</span>
              <span>◆ Built for the network state</span>
            </div>
          </div>

          <div className="hero-cards">
            {heroCards.map((l, i) => {
              const layout = [
                { left: "34%", top: "2%", z: 3, rot: "-7deg", w: 230, delay: 0 },
                { left: "2%", top: "20%", z: 2, rot: "-2deg", w: 205, delay: 0.6 },
                { left: "60%", top: "26%", z: 1, rot: "8deg", w: 205, delay: 1.2 },
              ][i]!;
              return (
                <div
                  key={l.id}
                  className="floaty"
                  style={{
                    position: "absolute",
                    left: layout.left,
                    top: layout.top,
                    width: layout.w,
                    zIndex: layout.z,
                    ["--rot" as string]: layout.rot,
                    animationDelay: `${layout.delay}s`,
                  } as CSSProperties}
                >
                  <div style={{ transform: `rotate(${layout.rot})` }}>
                    <TiltCard>
                      <PlayerCard legend={l} />
                    </TiltCard>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── TICKER ───────── */}
      <div className="marquee">
        <div className="marquee__row">
          {[...ticker, ...ticker].map((l, i) => (
            <span className="marquee__item" key={`${l.id}-${i}`}>
              <b>{overall(l.stats)}</b> {l.surname}
              <span style={{ color: "var(--ink-faint)" }}>·</span>
              <span style={{ color: "var(--ink-faint)" }}>{l.company ?? l.domain}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ───────── LIVE RANKINGS ───────── */}
      <section className="section" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 26 }}>
            <div>
              <div className="eyebrow">Live rankings</div>
              <h2 className="h2" style={{ marginTop: 12 }}>The Forbes list, ranked by <span className="gold-text">Elo</span>.</h2>
              <p className="lead" style={{ marginTop: 12, maxWidth: 520 }}>
                Net worth is the market cap. Elo is the game — and every head-to-head vote moves it.
              </p>
            </div>
            <Link href="/rankings" className="btn btn-ghost">Full rankings →</Link>
          </div>

          <div className="lb">
            <div className="lb-head">
              <span className="lb-c-rank">#</span>
              <span className="lb-c-move">7D</span>
              <span className="lb-c-builder">Builder</span>
              <span className="lb-c-elo">Elo</span>
              <span className="lb-c-worth">Net worth</span>
              <span className="lb-c-domain">Domain</span>
              <span className="lb-c-country">•</span>
              <span className="lb-c-spark">30D</span>
            </div>
            {LEADER_ROWS.slice(0, 15).map((r) => (
              <Link key={r.id} href={`/p/${r.id}`} className="lb-row">
                <span className="lb-c-rank"><span className="lb-rank" data-top={r.rank <= 3}><i>#</i>{r.rank}</span></span>
                <span className="lb-c-move">
                  {r.move > 0 ? <span className="lb-up">▲{r.move}</span> : r.move < 0 ? <span className="lb-down">▼{-r.move}</span> : <span className="lb-flat">—</span>}
                </span>
                <span className="lb-c-builder">
                  <span className="lb-mono" data-tier={tierFromOverall(r.overall)}>{initials(r.name)}</span>
                  <span className="lb-name"><b>{r.surname}</b><em>{ROLE_ABBR[r.role]} · {r.industry}</em></span>
                </span>
                <span className="lb-c-elo lb-elo">{r.elo}</span>
                <span className="lb-c-worth lb-worth">{fmtNetWorth(r.netWorthB)}</span>
                <span className="lb-c-domain lb-domain"><i data-domain={r.domain} />{r.domain}</span>
                <span className="lb-c-country">{flagOf(r.country)}</span>
                <span className="lb-c-spark"><Sparkline values={r.spark} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── THESIS ───────── */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">The thesis</div>
          <h2 className="h2" style={{ marginTop: 14, maxWidth: 720 }}>
            Talent is everywhere. Opportunity isn't.
          </h2>
          <p className="lead" style={{ marginTop: 16, maxWidth: 640 }}>
            Legacy filters reward pedigree — the right school, the right logo. We
            reward signal: what you've actually built. Ramanujan had no
            credentials and the notebook of a century. The market underpriced
            him. We exist to close that gap.
          </p>

          <div className="two-col" style={{ marginTop: 44 }}>
            {[
              { k: "01", t: "Signal over pedigree", d: "A rating engine that scores demonstrated output and discounts the establishment markers everyone else over-weights." },
              { k: "02", t: "Legends, living & dead", d: "The Forbes list and the Founders canon, as collectible cards. Study the greats. Then go beat them." },
              { k: "03", t: "Build your squad", d: "Assemble your dream founding team from the talent pool. Share your card. Refer the undervalued." },
            ].map((c) => (
              <div className="panel" key={c.k}>
                <div className="font-mono gold-text" style={{ fontSize: 13, fontWeight: 700 }}>{c.k}</div>
                <h3 className="font-display" style={{ fontWeight: 800, fontSize: 22, marginTop: 14, letterSpacing: "-0.02em" }}>
                  {c.t}
                </h3>
                <p style={{ color: "var(--ink-dim)", marginTop: 10, fontSize: 15 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FEATURED WALL ───────── */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 34 }}>
            <div>
              <div className="eyebrow">The vault</div>
              <h2 className="h2" style={{ marginTop: 12 }}>Featured legends</h2>
            </div>
            <Link href="/cards" className="btn btn-ghost">See all {LEGENDS.length} →</Link>
          </div>
          <div className="card-grid">
            {featured.map((l, i) => (
              <div key={l.id} className="rise" style={{ animationDelay: `${Math.min(i * 40, 480)}ms` }}>
                <TiltCard>
                  <PlayerCard legend={l} />
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── STATS ───────── */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">The rating engine</div>
          <h2 className="h2" style={{ marginTop: 14, maxWidth: 680 }}>
            Six stats. One number. Zero pedigree bias.
          </h2>
          <div
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 1,
              background: "var(--line)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {STAT_KEYS.map((k) => (
              <div key={k} style={{ background: "var(--bg)", padding: "26px 22px" }}>
                <div className="font-display gold-text" style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-0.03em" }}>
                  {k.toUpperCase()}
                </div>
                <div style={{ fontWeight: 600, marginTop: 8 }}>{STAT_FULL[k]}</div>
                <p style={{ color: "var(--ink-dim)", fontSize: 14, marginTop: 6 }}>{STAT_DESC[k]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SQUAD TEASER ───────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            className="panel"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 30,
              alignItems: "center",
              padding: "40px 36px",
              background:
                "radial-gradient(120% 120% at 100% 0%, rgba(94,234,212,0.08), transparent 55%), rgba(255,255,255,0.018)",
            }}
          >
            <div>
              <div className="eyebrow" style={{ color: "var(--signal)" }}>Squad builder</div>
              <h2 className="h2" style={{ marginTop: 14 }}>
                Who's on your founding five?
              </h2>
              <p className="lead" style={{ marginTop: 14, maxWidth: 460 }}>
                Drop legends onto the pitch — Vision, Build, Influence, Capital,
                Grit. Get a team rating and chemistry. Then share it.
              </p>
              <Link href="/squad" className="btn btn-gold" style={{ marginTop: 24 }}>
                Open the squad builder →
              </Link>
            </div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              {pick(["jobs", "musk"]).map((l) => (
                <div key={l.id} style={{ width: 150 }}>
                  <TiltCard>
                    <PlayerCard legend={l} />
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── GET YOUR CARD / NS ───────── */}
      <section className="section" id="card" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              textAlign: "center",
              border: "1px solid var(--line-2)",
              borderRadius: 18,
              padding: "64px 28px",
              background:
                "radial-gradient(100% 140% at 50% 0%, rgba(231,194,76,0.12), transparent 60%)",
            }}
          >
            <div className="eyebrow">Claim your spot</div>
            <h2 className="h-title" style={{ fontSize: "clamp(34px, 6vw, 64px)", marginTop: 16 }}>
              Get your <span className="gold-text">card.</span>
            </h2>
            <p className="lead" style={{ margin: "18px auto 0", maxWidth: 520 }}>
              Enter a GitHub handle and the engine reads its real signal — you get an
              archetype card to post and a private audit only you unlock. Then refer
              undervalued talent into the network state and level up together.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 30 }}>
              <Link href="/scout" className="btn btn-gold">
                Get your card →
              </Link>
              <a href="https://ns.com" target="_blank" rel="noreferrer" className="btn btn-ghost">
                Join via Network School ↗
              </a>
            </div>
            <p className="font-mono" style={{ color: "var(--ink-faint)", fontSize: 11, marginTop: 22 }}>
              Live now — audited from your public GitHub · your data, your consent
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
