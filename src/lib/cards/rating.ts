import type { CardStats, CardTier, Legend, Role } from "./types";
import type { DarkTalentScore } from "../scoring/types";

export const ROLE_ABBR: Record<Role, string> = {
  Founder: "FDR",
  Investor: "INV",
  Inventor: "IVT",
  Operator: "OPR",
  Visionary: "VSY",
  Financier: "FIN",
  Industrialist: "IND",
  Scientist: "SCI",
  Creative: "CRT",
};

const KEYS: (keyof CardStats)[] = ["vis", "exe", "inf", "ino", "cap", "grt"];

/** Overall = rounded mean of the six stats (transparent, predictable). */
export function overall(stats: CardStats): number {
  const sum = KEYS.reduce((s, k) => s + stats[k], 0);
  return Math.round(sum / KEYS.length);
}

/** Tier: dead = ICON always; living tiers off the overall. */
export function tier(legend: Legend): CardTier {
  if (legend.status === "dead") return "icon";
  const o = overall(legend.stats);
  if (o >= 90) return "elite";
  if (o >= 80) return "gold";
  if (o >= 70) return "silver";
  return "bronze";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return ((first + last).toUpperCase() || "?").slice(0, 2);
}

/**
 * Bridge for real users: map the scoring engine's DarkTalentScore (five pillars)
 * onto the six card stats, so an ingested GitHub profile becomes a card.
 */
export function statsFromScore(score: DarkTalentScore): CardStats {
  const p = (k: string) => score.pillars.find((x) => x.key === k)?.score ?? 0;
  const align = p("alignment") || p("trajectory");
  return {
    vis: Math.round(0.5 * p("trajectory") + 0.5 * align),
    exe: Math.round(p("technical")),
    inf: Math.round(p("influence")),
    ino: Math.round(p("darkSignal")),
    cap: Math.round(0.5 * p("influence") + 0.5 * p("technical")),
    grt: Math.round(0.5 * p("trajectory") + 0.5 * p("technical")),
  };
}
