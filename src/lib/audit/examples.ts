import type { TalentSignals } from "@/lib/scoring/types";
import { baseSignals } from "@/lib/scoring/fixtures";

/**
 * Zero-network demo candidates, clearly-labelled FICTIONAL composites so the
 * /scout page has something real to render without a GitHub token or live call.
 * The numbers are hand-authored *signals*; the scores are computed by the real
 * engine, so what you see is genuine engine output, not fabricated ratings.
 */
export interface Example {
  key: string;
  displayName: string;
  tagline: string;
  playsLike?: string;
  signals: TalentSignals;
}

/** The archetype the platform exists to surface: huge output, no logos. */
const ade: Example = {
  key: "ade-ogun",
  displayName: "Ade Ogun",
  tagline: "self-taught systems builder · Lagos · fictional composite",
  playsLike: "a young Armin Ronacher, prolific infra output, quiet public presence",
  signals: baseSignals({
    handle: "ade-ogun",
    account: { accountAgeYears: 4, publicRepos: 31, followers: 120, following: 60 },
    output: {
      totalStars: 2100,
      totalForks: 90,
      originalRepos: 31,
      commitsLast12mo: 1650,
      commitsPrev12mo: 640,
      contributionsLastYear: 2000,
      mergedPRs: 74,
      reviewsGiven: 14,
      issuesResolved: 60,
    },
    craft: {
      languages: [
        { language: "Rust", weight: 0.42 },
        { language: "Go", weight: 0.24 },
        { language: "TypeScript", weight: 0.2 },
        { language: "Python", weight: 0.14 },
      ],
      reposWithTests: 27,
      reposWithCI: 25,
      reposWithDocs: 22,
    },
    pedigree: {
      eliteEducation: false,
      bigTechExperience: false,
      credentialedYears: 0,
      selfReportedNonTraditional: true,
    },
    alignment: {
      openSourceRatio: 0.88,
      onChainActivity: false,
      remoteAsync: true,
      indieProjects: 5,
      selfAssessment: { builderMindset: 96, meritocracy: 90 },
    },
  }),
};

/** A different shape: an open-source maintainer whose leverage is other people. */
const lin: Example = {
  key: "lin-wei",
  displayName: "Lin Wei",
  tagline: "open-source maintainer & connector · remote · fictional composite",
  playsLike: "an early-career DHH, the project's gravity is the community around it",
  signals: baseSignals({
    handle: "lin-wei",
    account: { accountAgeYears: 6, publicRepos: 40, followers: 5200, following: 300 },
    output: {
      totalStars: 900,
      totalForks: 520,
      originalRepos: 9,
      commitsLast12mo: 700,
      commitsPrev12mo: 640,
      contributionsLastYear: 1400,
      mergedPRs: 160,
      reviewsGiven: 520,
      issuesResolved: 300,
    },
    craft: {
      languages: [
        { language: "TypeScript", weight: 0.5 },
        { language: "Python", weight: 0.3 },
        { language: "Go", weight: 0.2 },
      ],
      reposWithTests: 7,
      reposWithCI: 8,
      reposWithDocs: 8,
    },
    pedigree: {
      eliteEducation: false,
      bigTechExperience: false,
      credentialedYears: 0,
    },
    alignment: {
      openSourceRatio: 0.95,
      onChainActivity: false,
      remoteAsync: true,
      indieProjects: 3,
      selfAssessment: { builderMindset: 88, meritocracy: 92 },
    },
  }),
};

export const EXAMPLES: Example[] = [ade, lin];

const BY_KEY = new Map(EXAMPLES.map((e) => [e.key, e]));
export function getExample(key: string): Example | undefined {
  return BY_KEY.get(key);
}
