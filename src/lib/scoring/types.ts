/**
 * Scoring domain types.
 *
 * Pipeline:
 *   raw platform data ─▶ TalentSignals (normalized, source-agnostic)
 *                     ─▶ DarkTalentScore (explainable, 0–100)
 *
 * The scorer is a PURE function of TalentSignals, no I/O, no DB, no network.
 * That keeps it deterministic, unit-testable, and auditable. Auditability is
 * not optional here: we score *people*, so every number must be explainable
 * (GDPR "right to explanation"). Hence every pillar carries its `factors`.
 */

export type SourceType =
  | "github"
  | "gitlab"
  | "stackoverflow"
  | "leetcode"
  | "linkedin"
  | "x"
  | "website"
  | "onchain";

export interface LanguageStat {
  language: string;
  /** Relative weight, e.g. bytes of code, or normalized usage 0..1. */
  weight: number;
}

/** Normalized, source-agnostic signal bundle that feeds the scorer. */
export interface TalentSignals {
  handle: string;
  sources: SourceType[];

  account: {
    accountAgeYears: number;
    publicRepos: number;
    followers: number;
    following: number;
  };

  output: {
    totalStars: number;
    totalForks: number;
    originalRepos: number; // non-fork repositories authored
    commitsLast12mo: number;
    commitsPrev12mo: number; // the 12 months before that, drives trajectory
    contributionsLastYear: number;
    mergedPRs: number;
    reviewsGiven: number;
    issuesResolved: number;
  };

  craft: {
    languages: LanguageStat[];
    reposWithTests: number;
    reposWithCI: number;
    reposWithDocs: number;
  };

  /**
   * "Establishment" markers. We deliberately DISCOUNT these. The Moneyball
   * thesis is that pedigree is overpriced and raw output is underpriced, * so high output + low pedigree is the undervalued "dark talent" we hunt.
   */
  pedigree: {
    eliteEducation: boolean; // top-tier CS program
    bigTechExperience: boolean; // FAANG-tier employer logo
    credentialedYears: number; // formal professional years
    selfReportedNonTraditional?: boolean; // self-taught / bootcamp / career-changer
  };

  /** Optional, consent-based Network-State alignment signals. */
  alignment?: {
    openSourceRatio: number; // 0..1, share of work done in the open
    onChainActivity: boolean;
    remoteAsync: boolean;
    indieProjects: number; // bootstrapped / solo ships
    selfAssessment?: Record<string, number>; // 0..100 questionnaire answers
  };
}

export type PillarKey =
  | "technical"
  | "trajectory"
  | "darkSignal"
  | "influence"
  | "alignment";

export interface ScoreFactor {
  label: string;
  /** Contribution on a 0..100 scale (pre-weight). Negative = a discount. */
  points: number;
  detail?: string;
}

export interface PillarScore {
  key: PillarKey;
  label: string;
  score: number; // 0..100
  weight: number; // effective weight in the blend (active pillars sum to 1)
  confidence: number; // 0..1, how much data backed this pillar
  factors: ScoreFactor[];
}

export interface DarkTalentScore {
  overall: number; // 0..100
  confidence: number; // 0..1, overall data confidence
  pillars: PillarScore[];
  highlights: string[]; // human-readable spotlight lines
  modelVersion: string;
  computedAt: string; // ISO timestamp (caller-supplied; engine stays pure)
}

export interface PillarWeights {
  technical: number;
  trajectory: number;
  darkSignal: number;
  influence: number;
  alignment: number;
}
