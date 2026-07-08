import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RANKED,
  getBuilder,
  nearby,
  domainRankOf,
  countryRankOf,
  toLegend,
  fmtNetWorth,
} from "@/lib/rankings/model";
import { STAT_KEYS, STAT_LABELS, STAT_FULL } from "@/lib/cards/types";
import { flagOf } from "@/lib/rankings/format";
import { PlayerCard } from "@/components/PlayerCard";
import { TiltCard } from "@/components/TiltCard";
import { EloChart } from "@/components/rankings/EloChart";
import { StatRadar } from "@/components/rankings/StatRadar";
import { HeadToHead, type VersusEntry } from "@/components/rankings/HeadToHead";
import { Sparkline } from "@/components/rankings/Sparkline";

export function generateStaticParams() {
  return RANKED.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = getBuilder(id);
  if (!b) return { title: "Not found" };
  return {
    title: `${b.name} · #${b.rank}`,
    description: `${b.name} — Elo ${b.elo}, world #${b.rank}. ${b.blurb}`,
  };
}

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = getBuilder(id);
  if (!b) notFound();

  const dRank = domainRankOf(b);
  const cRank = countryRankOf(b);
  const prev = RANKED[b.rank - 2]; // one rank above
  const next = RANKED[b.rank]; // one rank below
  const near = nearby(b, 2);
  const eloDelta7 = b.elo - (b.history[b.history.length - 8] ?? b.elo);

  const pool = [
    b,
    ...RANKED.filter((x) => x.id !== b.id)
      .sort((x, y) => Math.abs(x.elo - b.elo) - Math.abs(y.elo - b.elo))
      .slice(0, 24),
  ];
  const entries: VersusEntry[] = pool.map((p) => ({ id: p.id, elo: p.elo, legend: toLegend(p) }));

  return (
    <>
      {/* sticky subheader */}
      <div className="detail-sub">
        <div className="wrap detail-sub__row">
          <div className="font-mono" style={{ fontSize: 12, color: "var(--ink-dim)" }}>
            <Link href="/rankings" style={{ color: "var(--ink-dim)" }}>RANKINGS</Link>
            <span style={{ color: "var(--ink-faint)" }}> / #{b.rank} {b.surname}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {prev && <Link className="chip" href={`/p/${prev.id}`}>←#{prev.rank}</Link>}
            {next && <Link className="chip" href={`/p/${next.id}`}>#{next.rank}→</Link>}
            <a href="#h2h" className="btn btn-gold" style={{ padding: "8px 14px" }}>Vote</a>
          </div>
        </div>
      </div>

      {/* hero */}
      <section className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="wrap hero-grid">
          <div style={{ maxWidth: 340, margin: "0 auto", width: "100%" }}>
            <TiltCard>
              <PlayerCard legend={toLegend(b)} />
            </TiltCard>
          </div>

          <div>
            <div className="font-display gold-text" style={{ fontSize: "clamp(52px,10vw,80px)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.05em" }}>
              #{b.rank}
            </div>
            <h1 className="h2" style={{ marginTop: 8 }}>{b.name}</h1>
            <div className="eyebrow" style={{ color: "var(--ink-dim)", marginTop: 10 }}>
              {b.role} · {b.domain} · {flagOf(b.country)} {b.country} · {fmtNetWorth(b.netWorthB)}
            </div>

            <div className="detail-elo">
              <div>
                <div className="detail-elo__num font-mono">{b.elo}</div>
                <div className="eyebrow" style={{ color: "var(--signal)", marginTop: 4 }}>
                  <span className="dt-card__live" style={{ display: "inline-flex" }}><i />Live Elo</span>
                </div>
              </div>
              <div className="detail-elo__meta font-mono">
                <span>PEAK <b>{b.peakElo}</b></span>
                <span>WORLD <b>#{b.rank}</b></span>
                <span>{b.domain.toUpperCase()} <b>#{dRank.rank}</b></span>
                <span>7D {b.move > 0 ? <b className="lb-up">▲{b.move}</b> : b.move < 0 ? <b className="lb-down">▼{-b.move}</b> : <b className="lb-flat">—</b>} <b className={eloDelta7 >= 0 ? "lb-up" : "lb-down"}>{eloDelta7 >= 0 ? "+" : ""}{eloDelta7}</b></span>
              </div>
            </div>

            <p className="lead" style={{ marginTop: 18, fontSize: 16, maxWidth: 460 }}>{b.blurb}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
              <a href="#h2h" className="btn btn-gold">Vote on this builder</a>
              <Link href="/squad" className="btn btn-ghost">Add to squad</Link>
            </div>
          </div>
        </div>
      </section>

      {/* elo history */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 48 }}>
        <div className="wrap">
          <div className="panel">
            <EloChart history={b.history} />
          </div>
        </div>
      </section>

      {/* radar + stat bars */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 48 }}>
        <div className="wrap detail-radar">
          <div className="panel" style={{ display: "grid", placeItems: "center" }}>
            <StatRadar stats={b.stats} />
          </div>
          <div className="panel">
            <div className="eyebrow">The six stats</div>
            <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
              {STAT_KEYS.map((k) => (
                <div key={k}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span><b className="font-mono" style={{ color: "var(--gold)" }}>{STAT_LABELS[k]}</b> <span style={{ color: "var(--ink-dim)" }}>{STAT_FULL[k]}</span></span>
                    <b className="font-mono">{b.stats[k]}</b>
                  </div>
                  <div className="statbar"><span style={{ width: `${b.stats[k]}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* head to head */}
      <section className="section" id="h2h" style={{ paddingTop: 0, paddingBottom: 48 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <HeadToHead key={b.id} entries={entries} seedA={b.id} />
        </div>
      </section>

      {/* nearby ladder */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 64 }}>
        <div className="wrap">
          <div className="eyebrow">Nearby in the rankings</div>
          <div className="lb" style={{ marginTop: 16 }}>
            {near.map((x) => (
              <Link key={x.id} href={`/p/${x.id}`} className="lb-row" data-self={x.id === b.id}>
                <span className="lb-c-rank"><span className="lb-rank" data-top={x.rank <= 3}><i>#</i>{x.rank}</span></span>
                <span className="lb-c-move">
                  {x.move > 0 ? <span className="lb-up">▲{x.move}</span> : x.move < 0 ? <span className="lb-down">▼{-x.move}</span> : <span className="lb-flat">—</span>}
                </span>
                <span className="lb-c-builder">
                  <span className="lb-name"><b>{x.surname}</b><em>{x.role} · {x.industry}</em></span>
                </span>
                <span className="lb-c-elo lb-elo">{x.elo}</span>
                <span className="lb-c-worth lb-worth">{fmtNetWorth(x.netWorthB)}</span>
                <span className="lb-c-domain lb-domain"><i data-domain={x.domain} />{x.domain}</span>
                <span className="lb-c-country">{flagOf(x.country)}</span>
                <span className="lb-c-spark"><Sparkline values={x.history.slice(-30)} /></span>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <Link href="/rankings" className="btn btn-ghost">Back to full rankings</Link>
          </div>
        </div>
      </section>
    </>
  );
}
