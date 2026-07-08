/**
 * Elo engine — the spine of the rankings (clubelo/playerelo model).
 *
 * Pure & deterministic: no Date, no Math.random. Seeding maps (net worth,
 * overall) → an initial rating; head-to-head matches move ratings the standard
 * Elo way; and a seeded PRNG yields a reproducible synthetic rating history so
 * sparklines, trends, and rank-movement exist before any real votes are cast.
 */

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** Net-worth reference (USD billions) at which the money term saturates. */
const NW_REF = 400;

/**
 * Deterministic seed rating from net worth + a 0–100 stat overall.
 * Log-scaled on net worth (so $400B doesn't crush $2B to the floor), blended
 * 70% money / 30% signal, into ~[1400, 2150]. Monotonic in both inputs.
 */
export function seedElo(netWorthB: number, overall: number): number {
  const nw = clamp01(Math.log1p(Math.max(0, netWorthB)) / Math.log1p(NW_REF));
  const st = clamp01(overall / 100);
  const blend = 0.7 * nw + 0.3 * st;
  return Math.round(1400 + blend * 750);
}

/** Logistic expected score for A vs B. E_a + E_b === 1, always in (0,1). */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export const DEFAULT_K = 24;

/** Apply one head-to-head result. Zero-sum: winner's gain == loser's loss. */
export function applyMatch(
  ratingA: number,
  ratingB: number,
  winner: "a" | "b",
  k: number = DEFAULT_K,
): { a: number; b: number; delta: number } {
  const eA = expectedScore(ratingA, ratingB);
  const sA = winner === "a" ? 1 : 0;
  const delta = k * (sA - eA);
  return { a: ratingA + delta, b: ratingB - delta, delta: Math.abs(delta) };
}

// ── Seeded PRNG (deterministic history) ──────────────────────────────────────

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Reproducible ~`days`-long rating history for a person, ending near their seed
 * rating. Gentle mean-reverting random walk — enough wiggle to produce trends
 * and rank movement, small enough that the net-worth-driven order holds.
 */
export function seededHistory(id: string, seedRating: number, days = 90): number[] {
  const rand = mulberry32(hashStr(id));
  const out: number[] = [];
  // Start slightly displaced so there's a visible arc toward the seed.
  let r = seedRating - (rand() * 40 - 14);
  for (let i = 0; i < days; i++) {
    const meanRevert = (seedRating - r) * 0.08;
    const noise = (rand() * 2 - 1) * 6;
    r = r + meanRevert + noise;
    out.push(Math.round(r));
  }
  return out;
}
