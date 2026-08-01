import { STAT_KEYS } from "@/lib/cards/types";
import type { CardStats } from "@/lib/cards/types";
import { buildAudit } from "@/lib/audit/build";
import type { RoleSpec, Shortlist, ShortlistEntry } from "./types";
import { getPool, POOL_SOURCE, type PoolCandidate } from "./pool";

/**
 * Build the sellable artifact: five scored candidates matched to one JD.
 *
 * Every number here comes from the real scoring engine (scoreTalent, via
 * buildAudit). Nothing is hand assigned. Fit is scored against the role's
 * demand vector, not against raw quality, because the best candidate overall
 * is often the wrong candidate for the seat.
 */

/**
 * Fit blends two things a hiring manager actually cares about:
 *
 *   coverage: does this person clear the bar the seat sets, across all six
 *             stats. Being above the bar never hurts, but it earns nothing
 *             here, so coverage alone saturates and cannot rank.
 *   strength: how strong they are at the one capability the seat demands.
 *
 * Coverage alone would tie every qualified candidate at 100, which is useless
 * on a shortlist, so strength does the separating.
 */
export function fitFor(stats: CardStats, role: RoleSpec): number {
  const primaryW = 0.4;
  const otherW = 0.6 / (STAT_KEYS.length - 1);

  let coverage = 0;
  for (const k of STAT_KEYS) {
    const shortfall = Math.max(0, role.demand[k] - stats[k]);
    const closeness = Math.max(0, 100 - shortfall);
    coverage += closeness * (k === role.primaryStat ? primaryW : otherW);
  }

  const strength = stats[role.primaryStat];
  return Math.round(0.6 * coverage + 0.4 * strength);
}

export function buildShortlist(
  role: RoleSpec,
  candidates: PoolCandidate[] = getPool(),
  size = 5,
  now: Date = new Date(),
): Shortlist {
  const scored: ShortlistEntry[] = candidates.map((c) => {
    const audit = buildAudit(c.signals, {
      displayName: c.displayName,
      tagline: c.tagline,
      isExample: c.isComposite,
    });

    const fit = fitFor(audit.stats, role);
    const darkSignal = audit.pillars.find((p) => p.key === "darkSignal")?.score ?? 0;

    return {
      handle: c.key,
      displayName: c.displayName,
      tagline: c.tagline,
      archetype: audit.archetype,
      overall: audit.overall,
      stats: audit.stats,
      fit,
      darkSignal: Math.round(darkSignal),
      evidence: audit.pillars
        .filter((p) => p.confidence > 0 && p.topFactor)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((p) => p.topFactor),
      whyThisRole: whyLine(audit.stats, role, audit.archetype),
    };
  });

  const entries = scored
    .sort((a, b) => b.fit - a.fit || b.darkSignal - a.darkSignal)
    .slice(0, size);

  return {
    role,
    entries,
    poolSource: POOL_SOURCE,
    poolSize: candidates.length,
    caveats: buildCaveats(role, candidates, size),
    computedAt: now.toISOString(),
  };
}

function whyLine(stats: CardStats, role: RoleSpec, archetype: string): string {
  const have = stats[role.primaryStat];
  const need = role.demand[role.primaryStat];
  const key = role.primaryStat.toUpperCase();
  if (have >= need) {
    return `${archetype}. Clears the bar this seat actually demands (${key} ${have} against ${need} required).`;
  }
  const gap = need - have;
  return `${archetype}. ${key} ${have} against ${need} required, a gap of ${gap}. Placeable after a short, named close rather than today.`;
}

function buildCaveats(role: RoleSpec, candidates: PoolCandidate[], size: number): string[] {
  const out: string[] = [];

  out.push(
    "Scores are computed from public code signals only. They are blind to design, product sense, communication, closed source work, and every non-code role.",
  );

  if (candidates.every((c) => c.isComposite)) {
    out.push(
      "Every candidate in this run is a labeled fictional composite. This artifact demonstrates the pipeline, it does not represent real people available to hire.",
    );
  }

  if (candidates.length < size) {
    out.push(
      `Pool holds ${candidates.length} candidates, fewer than the ${size} this artifact is meant to contain. Treat the list as partial.`,
    );
  }

  if (role.confidence < 0.4) {
    out.push(
      `The job description parsed with low confidence (${Math.round(role.confidence * 100)}%). Confirm the seat and the demanded capability with the company before trusting the ranking.`,
    );
  }

  out.push(
    "No score here has been validated against a real placement outcome yet. Until it has, treat this as a well instrumented opinion.",
  );

  return out;
}
