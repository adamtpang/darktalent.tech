import type { TalentSignals } from "./types";

/** Sensible zeroed baseline so fixtures only specify what they care about. */
export function baseSignals(overrides: Partial<TalentSignals> = {}): TalentSignals {
  return {
    handle: "anon",
    sources: ["github"],
    account: { accountAgeYears: 1, publicRepos: 0, followers: 0, following: 0 },
    output: {
      totalStars: 0,
      totalForks: 0,
      originalRepos: 0,
      commitsLast12mo: 0,
      commitsPrev12mo: 0,
      contributionsLastYear: 0,
      mergedPRs: 0,
      reviewsGiven: 0,
      issuesResolved: 0,
    },
    craft: { languages: [], reposWithTests: 0, reposWithCI: 0, reposWithDocs: 0 },
    pedigree: {
      eliteEducation: false,
      bigTechExperience: false,
      credentialedYears: 0,
    },
    ...overrides,
  };
}

/**
 * The archetype: self-taught, no logos, enormous public output, accelerating.
 * This is who the platform exists to surface.
 */
export const DARK_TALENT: TalentSignals = baseSignals({
  handle: "dark-talent",
  account: { accountAgeYears: 3, publicRepos: 48, followers: 1200, following: 80 },
  output: {
    totalStars: 6400,
    totalForks: 900,
    originalRepos: 38,
    commitsLast12mo: 2100,
    commitsPrev12mo: 700,
    contributionsLastYear: 2600,
    mergedPRs: 220,
    reviewsGiven: 140,
    issuesResolved: 310,
  },
  craft: {
    languages: [
      { language: "TypeScript", weight: 0.4 },
      { language: "Rust", weight: 0.3 },
      { language: "Go", weight: 0.2 },
      { language: "Python", weight: 0.1 },
    ],
    reposWithTests: 30,
    reposWithCI: 28,
    reposWithDocs: 33,
  },
  pedigree: {
    eliteEducation: false,
    bigTechExperience: false,
    credentialedYears: 0,
    selfReportedNonTraditional: true,
  },
  alignment: {
    openSourceRatio: 0.9,
    onChainActivity: true,
    remoteAsync: true,
    indieProjects: 6,
    selfAssessment: { decentralization: 90, meritocracy: 95, builderMindset: 92 },
  },
});

/**
 * The contrast: elite education + FAANG logo, but modest *public* output.
 * Likely a strong engineer, but not undervalued, so the dark signal is low.
 */
export const CREDENTIALED: TalentSignals = baseSignals({
  handle: "credentialed",
  account: { accountAgeYears: 8, publicRepos: 12, followers: 600, following: 120 },
  output: {
    totalStars: 240,
    totalForks: 40,
    originalRepos: 9,
    commitsLast12mo: 320,
    commitsPrev12mo: 300,
    contributionsLastYear: 360,
    mergedPRs: 35,
    reviewsGiven: 60,
    issuesResolved: 25,
  },
  craft: {
    languages: [
      { language: "Java", weight: 0.6 },
      { language: "Python", weight: 0.4 },
    ],
    reposWithTests: 6,
    reposWithCI: 5,
    reposWithDocs: 7,
  },
  pedigree: {
    eliteEducation: true,
    bigTechExperience: true,
    credentialedYears: 8,
  },
});
