import type { CardStats } from "@/lib/cards/types";
import { STAT_KEYS } from "@/lib/cards/types";
import type { TalentSignals } from "@/lib/scoring/types";
import { scoreTalent } from "@/lib/scoring";
import { statsFromScore } from "@/lib/cards/rating";
import type {
  AuditResult,
  AuditPillar,
  AuditStrength,
  DevelopmentArea,
  SlotId,
  TrajectoryDir,
} from "./types";

/** Which of the six card stats each squad slot demands. `exe` rides cross-slot. */
const SLOT_STAT: Record<SlotId, keyof CardStats> = {
  VISION: "vis",
  BUILD: "ino",
  INFLUENCE: "inf",
  CAPITAL: "cap",
  GRIT: "grt",
};
const SLOT_IDS = Object.keys(SLOT_STAT) as SlotId[];

/** Archetype name + one-line definition, keyed off the dominant slot. */
const ARCHETYPE: Record<SlotId, { name: (s: CardStats) => string; def: string }> = {
  BUILD: {
    name: (s) => (s.exe >= 85 ? "Deep-Lying Systems Builder" : "Zero-to-One Builder"),
    def: "Ships production-grade systems — trusted for what they make, not where they worked.",
  },
  VISION: {
    name: () => "North-Star Strategist",
    def: "Reads where the field is going before it's obvious, and points the team at it.",
  },
  INFLUENCE: {
    name: () => "Force Multiplier",
    def: "Makes everyone around them faster — the work is depended on, not just seen.",
  },
  CAPITAL: {
    name: () => "Compounding Operator",
    def: "Turns effort into captured, durable value.",
  },
  GRIT: {
    name: () => "Relentless Closer",
    def: "Survives the valley and finishes what others abandon.",
  },
};

const STAT_PHRASE: Record<keyof CardStats, string> = {
  ino: "Builds what didn't exist — high original output",
  exe: "Ships relentlessly, and on time",
  inf: "Work is forked and depended on, not just followed",
  vis: "Sees where the field is going early",
  cap: "Converts output into captured value",
  grt: "Sustains output through the grind",
};

const PLACEMENT: Record<SlotId, { label: string; href?: string }> = {
  BUILD: { label: "A BUILD-slot fit — e.g. Intel's diagnosed BUILD gap", href: "/duel" },
  VISION: { label: "A VISION-slot fit — founder / strategy seats" },
  INFLUENCE: { label: "An INFLUENCE-slot fit — GTM, DevRel, brand" },
  CAPITAL: { label: "A CAPITAL-slot fit — finance / capital allocation" },
  GRIT: { label: "A GRIT-slot fit — ops / execution / reliability" },
};

const UPSKILL: Record<keyof CardStats, { slot: SlotId; title: string; action: string }> = {
  inf: {
    slot: "INFLUENCE",
    title: "Great work, quiet presence",
    action: "Turn your two strongest repos into written case studies or talks; convert forks into visible followers.",
  },
  vis: {
    slot: "VISION",
    title: "Thin field-of-view",
    action: "Review 3–4 external PRs a week in your ecosystem — it builds the strategic surface raw output lacks.",
  },
  cap: {
    slot: "CAPITAL",
    title: "Value made, not captured",
    action: "Ship one project with a funding or impact component (a paid template, Gitcoin, retroPGF).",
  },
  ino: {
    slot: "BUILD",
    title: "More adapting than originating",
    action: "Author one original repo that solves a problem you personally hit — depth over forks.",
  },
  exe: {
    slot: "BUILD",
    title: "Starts outpace finishes",
    action: "Take one project to a tagged 1.0 with docs and CI before opening the next.",
  },
  grt: {
    slot: "GRIT",
    title: "Bursty cadence",
    action: "Trade intensity spikes for a sustainable weekly commit rhythm.",
  },
};

const SCOPE_NOTE =
  "Audited from public GitHub only — blind to design, product, communication, closed-source work, and non-code roles.";

/**
 * Pure: normalized signals → a full AuditResult. Runs the REAL scoring engine
 * (scoreTalent) — this is the honest half the org side can never be, because a
 * consented builder's GitHub is real data, not a stage set.
 */
export function buildAudit(
  signals: TalentSignals,
  meta: { displayName?: string; tagline?: string; playsLike?: string; isExample?: boolean } = {},
): AuditResult {
  const score = scoreTalent(signals);
  const stats = statsFromScore(score);

  // Dominant slot = the strongest slot-stat.
  const bestSlot = SLOT_IDS.reduce((best, id) =>
    stats[SLOT_STAT[id]] > stats[SLOT_STAT[best]] ? id : best,
  );

  const arche = ARCHETYPE[bestSlot];

  // Trajectory as a DIRECTION, never a projected number.
  const trajectory = readTrajectory(signals);

  // Strengths: prefer the engine's own curated highlights, then top up from the
  // dominant stat. Capped at 3 for a clean, screenshottable card.
  const strengths = buildStrengths(score.highlights, stats, bestSlot);

  const pillars: AuditPillar[] = score.pillars.map((p) => ({
    key: p.key,
    label: p.label,
    score: p.score,
    confidence: p.confidence,
    topFactor: topFactor(p.factors),
  }));

  // Development areas = the two lowest of the six stats, framed as levers.
  const developmentAreas = lowestStats(stats, 2).map((stat): DevelopmentArea => {
    const u = UPSKILL[stat];
    return { stat, slot: u.slot, title: u.title, action: u.action };
  });

  const noActivity =
    signals.output.commitsLast12mo === 0 &&
    signals.output.mergedPRs === 0 &&
    signals.output.reviewsGiven === 0 &&
    signals.account.publicRepos > 0;

  return {
    handle: signals.handle,
    displayName: meta.displayName ?? signals.handle,
    tagline: meta.tagline ?? "public GitHub audit",
    isExample: meta.isExample ?? false,
    archetype: arche.name(stats),
    archetypeDef: arche.def,
    playsLike: meta.playsLike,
    strengths,
    trajectory,
    overall: overallOf(stats),
    stats,
    pillars,
    bestSlot,
    placement: PLACEMENT[bestSlot],
    developmentAreas,
    scopeNote: SCOPE_NOTE,
    dataCaveat: noActivity
      ? "No GitHub token configured, so commit / PR / review counts came back approximate — volume and trajectory are under-counted here."
      : undefined,
  };
}

// ───────────────────────────── helpers ─────────────────────────────

function overallOf(stats: CardStats): number {
  const sum = STAT_KEYS.reduce((s, k) => s + stats[k], 0);
  return Math.round(sum / STAT_KEYS.length);
}

function readTrajectory(s: TalentSignals): { dir: TrajectoryDir; label: string } {
  const last = s.output.commitsLast12mo;
  const prev = s.output.commitsPrev12mo;
  if (last === 0 && prev === 0) {
    return { dir: "steady", label: "Steady — recent activity data unavailable" };
  }
  const ratio = last / Math.max(1, prev);
  if (ratio >= 1.2) return { dir: "rising", label: "Rising — output accelerating year over year" };
  if (ratio < 0.8) return { dir: "cooling", label: "Cooling — output easing off recently" };
  return { dir: "steady", label: "Steady — consistent output year over year" };
}

function buildStrengths(
  highlights: string[],
  stats: CardStats,
  bestSlot: SlotId,
): AuditStrength[] {
  const out: AuditStrength[] = [];
  const seen = new Set<string>();

  for (const h of highlights) {
    const parsed = splitEmoji(h);
    if (parsed && !seen.has(parsed.text)) {
      out.push(parsed);
      seen.add(parsed.text);
    }
    if (out.length >= 3) break;
  }

  // Top up from the dominant slot's stat so every card has ≥1 concrete strength.
  if (out.length < 3) {
    const phrase = STAT_PHRASE[SLOT_STAT[bestSlot]];
    if (!seen.has(phrase)) out.push({ icon: "↑", text: phrase });
  }

  return out.slice(0, 3);
}

/** Split a leading emoji off a highlight line ("💎 1729 signal — …"). */
function splitEmoji(line: string): AuditStrength | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const first = [...trimmed][0] ?? "";
  const isEmoji = /\p{Extended_Pictographic}/u.test(first);
  if (isEmoji) {
    return { icon: first, text: trimmed.slice(first.length).trim() };
  }
  return { icon: "↑", text: trimmed };
}

function topFactor(
  factors: { label: string; points: number; detail?: string }[],
): string {
  if (!factors.length) return "";
  const top = factors.reduce((a, b) => (b.points > a.points ? b : a));
  return top.detail ? `${top.label} — ${top.detail}` : top.label;
}

function lowestStats(stats: CardStats, n: number): (keyof CardStats)[] {
  return [...STAT_KEYS].sort((a, b) => stats[a] - stats[b]).slice(0, n);
}
