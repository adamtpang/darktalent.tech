import type { TalentSignals } from "@/lib/scoring/types";
import { baseSignals } from "@/lib/scoring/fixtures";
import { EXAMPLES } from "@/lib/audit/examples";

/**
 * The candidate pool adapter.
 *
 * Reads real consented cards when a database is configured, and falls back to
 * clearly labeled fictional composites when it is not. Every shortlist reports
 * which of the two it used, so an artifact never implies real people who are
 * not there.
 *
 * The real path is fed by `POST /api/card`, the consented opt-in that
 * skill.supply calls at the end of a free report. Until people actually opt in,
 * the fallback keeps /hiring demonstrable without claiming a pool we lack.
 */

export interface PoolCandidate {
  key: string;
  displayName: string;
  tagline: string;
  /** True for hand authored demo profiles. Real opt-in candidates set false. */
  isComposite: boolean;
  signals: TalentSignals;
}

export const POOL_SOURCE =
  "Local seed pool of fictional composites. No real seeker records are claimed here.";

export interface LoadedPool {
  candidates: PoolCandidate[];
  source: string;
  /** True when these are real consented people rather than demo composites. */
  live: boolean;
}

/** Infra builder: huge output, floor pedigree. The archetypal dark talent. */
const seed: PoolCandidate[] = [
  ...EXAMPLES.map((e) => ({
    key: e.key,
    displayName: e.displayName,
    tagline: e.tagline,
    isComposite: true,
    signals: e.signals,
  })),
  {
    key: "mira-halvorsen",
    displayName: "Mira Halvorsen",
    tagline: "ML systems builder, Oslo (fictional composite)",
    isComposite: true,
    signals: baseSignals({
      handle: "mira-halvorsen",
      account: { accountAgeYears: 5, publicRepos: 24, followers: 640, following: 90 },
      output: {
        totalStars: 3400,
        totalForks: 260,
        originalRepos: 19,
        commitsLast12mo: 1180,
        commitsPrev12mo: 900,
        contributionsLastYear: 1500,
        mergedPRs: 130,
        reviewsGiven: 70,
        issuesResolved: 140,
      },
      craft: {
        languages: [
          { language: "Python", weight: 0.5 },
          { language: "Rust", weight: 0.28 },
          { language: "C++", weight: 0.22 },
        ],
        reposWithTests: 15,
        reposWithCI: 14,
        reposWithDocs: 16,
      },
      pedigree: { eliteEducation: false, bigTechExperience: false, credentialedYears: 4 },
      alignment: { openSourceRatio: 0.8, onChainActivity: false, remoteAsync: true, indieProjects: 3 },
    }),
  },
  {
    key: "tobi-adeyemi",
    displayName: "Tobi Adeyemi",
    tagline: "maintainer and community builder, Abuja (fictional composite)",
    isComposite: true,
    signals: baseSignals({
      handle: "tobi-adeyemi",
      account: { accountAgeYears: 7, publicRepos: 52, followers: 7100, following: 410 },
      output: {
        totalStars: 1200,
        totalForks: 780,
        originalRepos: 11,
        commitsLast12mo: 620,
        commitsPrev12mo: 600,
        contributionsLastYear: 1600,
        mergedPRs: 210,
        reviewsGiven: 690,
        issuesResolved: 420,
      },
      craft: {
        languages: [
          { language: "TypeScript", weight: 0.55 },
          { language: "Go", weight: 0.25 },
          { language: "Shell", weight: 0.2 },
        ],
        reposWithTests: 8,
        reposWithCI: 9,
        reposWithDocs: 11,
      },
      pedigree: { eliteEducation: false, bigTechExperience: false, credentialedYears: 2 },
      alignment: { openSourceRatio: 0.97, onChainActivity: false, remoteAsync: true, indieProjects: 2 },
    }),
  },
  {
    key: "priya-raman",
    displayName: "Priya Raman",
    tagline: "reliability and on-call lead, Bengaluru (fictional composite)",
    isComposite: true,
    signals: baseSignals({
      handle: "priya-raman",
      account: { accountAgeYears: 6, publicRepos: 18, followers: 300, following: 120 },
      output: {
        totalStars: 480,
        totalForks: 130,
        originalRepos: 14,
        commitsLast12mo: 1420,
        commitsPrev12mo: 1310,
        contributionsLastYear: 1900,
        mergedPRs: 240,
        reviewsGiven: 180,
        issuesResolved: 520,
      },
      craft: {
        languages: [
          { language: "Go", weight: 0.42 },
          { language: "Python", weight: 0.33 },
          { language: "Shell", weight: 0.25 },
        ],
        reposWithTests: 13,
        reposWithCI: 14,
        reposWithDocs: 12,
      },
      pedigree: { eliteEducation: false, bigTechExperience: false, credentialedYears: 6 },
      alignment: { openSourceRatio: 0.6, onChainActivity: false, remoteAsync: true, indieProjects: 1 },
    }),
  },
  {
    key: "danilo-souza",
    displayName: "Danilo Souza",
    tagline: "founding engineer, zero to one, Sao Paulo (fictional composite)",
    isComposite: true,
    signals: baseSignals({
      handle: "danilo-souza",
      account: { accountAgeYears: 8, publicRepos: 44, followers: 1500, following: 200 },
      output: {
        totalStars: 2600,
        totalForks: 340,
        originalRepos: 33,
        commitsLast12mo: 1500,
        commitsPrev12mo: 1100,
        contributionsLastYear: 2100,
        mergedPRs: 190,
        reviewsGiven: 150,
        issuesResolved: 260,
      },
      craft: {
        languages: [
          { language: "TypeScript", weight: 0.4 },
          { language: "Elixir", weight: 0.2 },
          { language: "Go", weight: 0.2 },
          { language: "Swift", weight: 0.2 },
        ],
        reposWithTests: 24,
        reposWithCI: 22,
        reposWithDocs: 28,
      },
      pedigree: {
        eliteEducation: false,
        bigTechExperience: false,
        credentialedYears: 3,
        selfReportedNonTraditional: true,
      },
      alignment: {
        openSourceRatio: 0.72,
        onChainActivity: true,
        remoteAsync: true,
        indieProjects: 9,
        selfAssessment: { builderMindset: 94, meritocracy: 88 },
      },
    }),
  },
  {
    key: "hana-kobayashi",
    displayName: "Hana Kobayashi",
    tagline: "data and revenue instrumentation, Fukuoka (fictional composite)",
    isComposite: true,
    signals: baseSignals({
      handle: "hana-kobayashi",
      account: { accountAgeYears: 4, publicRepos: 21, followers: 410, following: 75 },
      output: {
        totalStars: 760,
        totalForks: 190,
        originalRepos: 17,
        commitsLast12mo: 980,
        commitsPrev12mo: 520,
        contributionsLastYear: 1300,
        mergedPRs: 110,
        reviewsGiven: 95,
        issuesResolved: 130,
      },
      craft: {
        languages: [
          { language: "Python", weight: 0.45 },
          { language: "SQL", weight: 0.35 },
          { language: "TypeScript", weight: 0.2 },
        ],
        reposWithTests: 12,
        reposWithCI: 11,
        reposWithDocs: 14,
      },
      pedigree: { eliteEducation: false, bigTechExperience: false, credentialedYears: 3 },
      alignment: { openSourceRatio: 0.66, onChainActivity: false, remoteAsync: true, indieProjects: 4 },
    }),
  },
];

/** The demo pool. Always available, never claimed to be real people. */
export function getPool(): PoolCandidate[] {
  return seed;
}

/**
 * The pool a shortlist should actually be built from.
 *
 * Prefers real consented cards. Falls back to composites when no database is
 * configured or when nobody has opted in yet, and says which happened. The
 * import is dynamic so that pure-compute paths and static builds never pull in
 * the Prisma client.
 */
export async function loadPool(): Promise<LoadedPool> {
  try {
    const { loadPoolFromDb, isDbConfigured } = await import("@/lib/card/service");
    if (isDbConfigured()) {
      const live = await loadPoolFromDb();
      if (live.length > 0) {
        return {
          candidates: live,
          live: true,
          source: `${live.length} consented cards from the darktalent pool. Every person here opted in and can revoke at any time.`,
        };
      }
      return {
        candidates: seed,
        live: false,
        source:
          "Database is configured but no one has opted in yet, so this run used the labeled demo pool.",
      };
    }
  } catch {
    // fall through to the demo pool
  }
  return { candidates: seed, live: false, source: POOL_SOURCE };
}
