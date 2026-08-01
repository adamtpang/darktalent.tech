import type { CardStats } from "@/lib/cards/types";
import type { SlotId } from "@/lib/audit/types";
import type { RoleSpec } from "./types";

/**
 * Parse a job description into a RoleSpec.
 *
 * Deterministic and dependency free on purpose: no LLM call, no network, so
 * the same JD always produces the same read and a buyer can audit why. The
 * `matched` array carries the exact signal words found, so the parse is
 * defensible rather than asserted.
 */

const SLOT_STAT: Record<SlotId, keyof CardStats> = {
  VISION: "vis",
  BUILD: "ino",
  INFLUENCE: "inf",
  CAPITAL: "cap",
  GRIT: "grt",
};

/** Signal words per slot. Lowercase, matched as substrings on a normalized JD. */
const SLOT_SIGNALS: Record<SlotId, string[]> = {
  BUILD: [
    "engineer", "developer", "backend", "frontend", "full stack", "fullstack",
    "infrastructure", "platform", "systems", "architect", "rust", "golang",
    "typescript", "python", "kubernetes", "distributed", "api", "ship",
    "codebase", "technical", "swe", "sre", "devops", "machine learning",
  ],
  VISION: [
    "product manager", "head of product", "founding", "strategy", "roadmap",
    "vision", "0 to 1", "zero to one", "define the", "product direction",
    "cto", "chief", "vp of product", "principal",
  ],
  INFLUENCE: [
    "developer relations", "devrel", "advocate", "evangelist", "community",
    "marketing", "growth", "sales", "go to market", "gtm", "brand",
    "partnerships", "content", "docs", "technical writer",
  ],
  CAPITAL: [
    "finance", "cfo", "controller", "fp&a", "revenue", "pricing", "billing",
    "monetization", "capital", "accounting", "budget", "unit economics",
  ],
  GRIT: [
    "operations", "ops", "reliability", "on call", "on-call", "support",
    "quality", "qa", "manufacturing", "logistics", "process", "incident",
    "compliance", "security operations",
  ],
};

const SENIORITY: { key: RoleSpec["seniority"]; words: string[]; floor: number }[] = [
  { key: "staff+", words: ["staff", "principal", "distinguished", "head of", "director", "vp", "chief"], floor: 82 },
  { key: "senior", words: ["senior", "sr.", "sr ", "lead", "iv", "experienced"], floor: 74 },
  { key: "junior", words: ["junior", "jr.", "jr ", "entry level", "entry-level", "new grad", "intern"], floor: 52 },
  { key: "mid", words: [], floor: 64 },
];

export function parseJD(raw: string): RoleSpec {
  const text = (raw || "").toLowerCase();

  // Score each slot by how many distinct signal words appear.
  const hits: Record<string, string[]> = {};
  let bestSlot: SlotId = "BUILD";
  let bestCount = -1;

  (Object.keys(SLOT_SIGNALS) as SlotId[]).forEach((slot) => {
    const found = SLOT_SIGNALS[slot].filter((w) => text.includes(w));
    hits[slot] = found;
    if (found.length > bestCount) {
      bestCount = found.length;
      bestSlot = slot;
    }
  });

  // Seniority: first band whose words appear, else mid.
  const band =
    SENIORITY.find((b) => b.words.length > 0 && b.words.some((w) => text.includes(w))) ??
    SENIORITY[SENIORITY.length - 1]!;

  const primaryStat = SLOT_STAT[bestSlot];
  const demand = buildDemand(primaryStat, band.floor);

  // Confidence: more distinct signal words means a more defensible read.
  // Zero hits means we are guessing, and the UI should say so.
  const total = Object.values(hits).reduce((s, a) => s + a.length, 0);
  const confidence = clamp01(bestCount === 0 ? 0.15 : Math.min(1, 0.35 + bestCount * 0.12) * (total ? bestCount / total : 1));

  return {
    title: extractTitle(raw) || `${band.key} ${bestSlot.toLowerCase()} role`,
    slot: bestSlot,
    primaryStat,
    demand,
    seniority: band.key,
    matched: hits[bestSlot] ?? [],
    confidence: round2(confidence),
  };
}

/**
 * A demand vector: the primary stat is held high, the rest sit at a competent
 * baseline. Deliberately not a spiky profile, because a real seat needs an
 * all-rounder who is excellent at one thing.
 */
function buildDemand(primary: keyof CardStats, floor: number): CardStats {
  const base = Math.max(40, floor - 12);
  const demand: CardStats = { vis: base, exe: base, inf: base, ino: base, cap: base, grt: base };
  demand[primary] = Math.min(96, floor + 12);
  // Execution is cross cutting: every seat needs someone who ships.
  demand.exe = Math.max(demand.exe, floor);
  return demand;
}

/** Take the first short, title-shaped line of the JD. */
function extractTitle(raw: string): string {
  const line = (raw || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 2 && l.length <= 80);
  return line ? line.replace(/^#+\s*/, "").slice(0, 80) : "";
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round2 = (n: number) => Math.round(n * 100) / 100;
