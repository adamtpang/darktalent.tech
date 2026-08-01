import type { PillarWeights, PillarKey } from "./types";

/**
 * Default pillar weights, the Moneyball thesis encoded as numbers.
 *
 * We over-index on demonstrated ability, raw trajectory, and the undervaluation
 * signal; we under-index on network/vanity. Alignment is optional and only
 * contributes when the candidate has consented to share it (see engine.ts, * absent pillars have their weight redistributed, never silently zeroed).
 *
 * Recruiters/communities can override these per-search to re-tune the lens.
 */
export const DEFAULT_WEIGHTS: PillarWeights = {
  technical: 0.3,
  trajectory: 0.2,
  darkSignal: 0.25,
  influence: 0.1,
  alignment: 0.15,
};

export const MODEL_VERSION = "dts-1.0.0";

export const PILLAR_LABELS: Record<PillarKey, string> = {
  technical: "Technical Ability",
  trajectory: "Growth Trajectory",
  darkSignal: "Dark-Talent Signal",
  influence: "Merit Influence",
  alignment: "Network-State Alignment",
};
