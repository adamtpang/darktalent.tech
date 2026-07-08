/**
 * Numeric helpers — turn unbounded, skewed counts into bounded 0..100 scores.
 */

export const clamp = (x: number, lo = 0, hi = 100): number =>
  Math.min(hi, Math.max(lo, x));

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/**
 * Log-saturating scale: maps a non-negative count onto 0..100, where `k` is the
 * reference value that lands near ~100. Logarithmic so the first 10 stars matter
 * far more than the 1000th — diminishing returns — and so a handful of
 * superstars don't dwarf everyone else into the floor.
 *
 *   logScale(0, k)   = 0
 *   logScale(k, k)   ≈ 100
 */
export function logScale(value: number, k: number): number {
  if (value <= 0) return 0;
  if (k <= 1) return clamp(value);
  return clamp((Math.log1p(value) / Math.log1p(k)) * 100);
}

/** Ratio (num/den) mapped to 0..100, guarded against divide-by-zero. */
export function ratioPct(num: number, den: number): number {
  if (den <= 0) return 0;
  return clamp((num / den) * 100);
}

/** Weighted average of {value, weight} pairs, on a 0..100 scale. */
export function weightedAvg(
  parts: Array<{ value: number; weight: number }>,
): number {
  const totalW = parts.reduce((s, p) => s + p.weight, 0);
  if (totalW <= 0) return 0;
  return clamp(parts.reduce((s, p) => s + p.value * p.weight, 0) / totalW);
}

export const mean = (xs: number[]): number =>
  xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;

/**
 * Maps a growth ratio (recent / previous) onto 0..100, where 1.0 (flat) = 50,
 * acceleration climbs toward 100 and decline sinks toward 0. Log-logistic, so:
 *   2× ≈ 67   ·   4× ≈ 80   ·   ½× ≈ 33
 * The +1 smoothing lets brand-new accounts (previous ≈ 0) read as strong growth
 * instead of dividing by zero.
 */
export function growthScore(recent: number, previous: number): number {
  const r = (recent + 1) / (previous + 1);
  return clamp(50 + 50 * Math.tanh(0.5 * Math.log(r)));
}

export const round1 = (x: number): number => Math.round(x * 10) / 10;
export const round2 = (x: number): number => Math.round(x * 100) / 100;
