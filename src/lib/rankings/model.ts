import { PEOPLE } from "./data";
import type { RankPerson } from "./types";
import type { Legend } from "@/lib/cards/types";
import { overall as statOverall } from "@/lib/cards/rating";
import { seedElo, seededHistory } from "@/lib/elo/engine";
import { fmtNetWorth } from "./format";

export { fmtNetWorth };

export interface RankedBuilder extends RankPerson {
  overall: number;
  elo: number;
  history: number[]; // ~90 days, ends at current Elo
  peakElo: number;
  rank: number;
  prevRank: number; // ~7 days ago
  move: number; // prevRank - rank (positive = climbed)
}

/** Lightweight row for the leaderboard table (trimmed history → smaller payload). */
export interface LeaderRow {
  id: string;
  name: string;
  surname: string;
  role: RankPerson["role"];
  domain: RankPerson["domain"];
  industry: string;
  country: string;
  netWorthB: number;
  overall: number;
  elo: number;
  rank: number;
  move: number;
  spark: number[]; // last 30 days
}

const HIST_DAYS = 90;
const MOVE_WINDOW = 7;

const enriched = PEOPLE.map((p) => {
  const overall = statOverall(p.stats);
  const seed = seedElo(p.netWorthB, overall);
  const history = seededHistory(p.id, seed, HIST_DAYS);
  const elo = history[history.length - 1] ?? seed;
  const elo7 = history[history.length - 1 - MOVE_WINDOW] ?? history[0] ?? seed;
  return { p, overall, history, elo, elo7, peakElo: Math.max(...history) };
});

const rankNow = new Map<string, number>();
[...enriched].sort((a, b) => b.elo - a.elo).forEach((e, i) => rankNow.set(e.p.id, i + 1));

const rankPrev = new Map<string, number>();
[...enriched].sort((a, b) => b.elo7 - a.elo7).forEach((e, i) => rankPrev.set(e.p.id, i + 1));

export const RANKED: RankedBuilder[] = enriched
  .map((e): RankedBuilder => {
    const rank = rankNow.get(e.p.id) ?? 0;
    const prevRank = rankPrev.get(e.p.id) ?? rank;
    return {
      ...e.p,
      overall: e.overall,
      elo: e.elo,
      history: e.history,
      peakElo: e.peakElo,
      rank,
      prevRank,
      move: prevRank - rank,
    };
  })
  .sort((a, b) => a.rank - b.rank);

export const BY_ID = new Map(RANKED.map((b) => [b.id, b]));

export const LEADER_ROWS: LeaderRow[] = RANKED.map((b) => ({
  id: b.id,
  name: b.name,
  surname: b.surname,
  role: b.role,
  domain: b.domain,
  industry: b.industry,
  country: b.country,
  netWorthB: b.netWorthB,
  overall: b.overall,
  elo: b.elo,
  rank: b.rank,
  move: b.move,
  spark: b.history.slice(-30),
}));

export function getBuilder(id: string): RankedBuilder | undefined {
  return BY_ID.get(id);
}

export function domainRankOf(b: RankedBuilder): { rank: number; total: number } {
  const peers = RANKED.filter((x) => x.domain === b.domain);
  return { rank: peers.findIndex((x) => x.id === b.id) + 1, total: peers.length };
}

export function countryRankOf(b: RankedBuilder): { rank: number; total: number } {
  const peers = RANKED.filter((x) => x.country === b.country);
  return { rank: peers.findIndex((x) => x.id === b.id) + 1, total: peers.length };
}

/** Rows centered on a builder (ranks n-span … n+span). */
export function nearby(b: RankedBuilder, span = 2): RankedBuilder[] {
  const lo = Math.max(0, b.rank - 1 - span);
  return RANKED.slice(lo, lo + span * 2 + 1);
}

/** Adapt a ranked person to the Legend shape the PlayerCard renders. */
export function toLegend(p: RankPerson): Legend {
  return {
    id: p.id,
    name: p.name,
    surname: p.surname,
    role: p.role,
    status: "living",
    domain: p.domain,
    company: p.company,
    era: fmtNetWorth(p.netWorthB),
    blurb: p.blurb,
    stats: p.stats,
  };
}

export const COUNTRIES = [...new Set(RANKED.map((b) => b.country))].sort();
