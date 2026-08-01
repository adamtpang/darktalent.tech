import type {
  TalentSignals,
  DarkTalentScore,
  PillarScore,
  PillarKey,
  PillarWeights,
  ScoreFactor,
} from "./types";
import { DEFAULT_WEIGHTS, MODEL_VERSION, PILLAR_LABELS } from "./weights";
import {
  clamp,
  clamp01,
  logScale,
  ratioPct,
  weightedAvg,
  growthScore,
  mean,
  round1,
  round2,
} from "./normalize";

export interface ScoreOptions {
  /** Override any subset of the default pillar weights. */
  weights?: Partial<PillarWeights>;
  /** Injected clock for determinism. Defaults to `new Date()` at call time. */
  now?: Date;
}

/**
 * Score a normalized signal bundle into an explainable 0..100 DarkTalentScore.
 *
 * Each pillar is computed independently and returns its own sub-score,
 * confidence, and human-readable factors. Pillars with zero confidence (e.g. no
 * consented alignment data) are dropped and their weight is redistributed
 * across the rest, so a missing optional signal never silently caps a score.
 */
export function scoreTalent(
  signals: TalentSignals,
  opts: ScoreOptions = {},
): DarkTalentScore {
  const weights: PillarWeights = { ...DEFAULT_WEIGHTS, ...opts.weights };

  const pillars: PillarScore[] = [
    technicalPillar(signals),
    trajectoryPillar(signals),
    darkSignalPillar(signals),
    influencePillar(signals),
    alignmentPillar(signals),
  ];

  // Re-normalize weights across only the pillars we actually have data for.
  const activeWeightSum =
    pillars.reduce(
      (s, p) => s + (p.confidence > 0 ? weights[p.key] : 0),
      0,
    ) || 1;

  for (const p of pillars) {
    p.weight = p.confidence > 0 ? weights[p.key] / activeWeightSum : 0;
  }

  const overall = clamp(pillars.reduce((s, p) => s + p.score * p.weight, 0));
  const confidence = clamp01(
    pillars.reduce((s, p) => s + p.confidence * p.weight, 0),
  );

  return {
    overall: round1(overall),
    confidence: round2(confidence),
    pillars,
    highlights: buildHighlights(signals, pillars),
    modelVersion: MODEL_VERSION,
    computedAt: (opts.now ?? new Date()).toISOString(),
  };
}

// ───────────────────────────── Pillars ─────────────────────────────

/** Technical ability, depth, breadth, impact, and engineering discipline. */
function technicalPillar(s: TalentSignals): PillarScore {
  const { output: o, craft: c } = s;

  const originality = logScale(o.originalRepos, 40);
  const impact = logScale(o.totalStars, 800);
  const volume = logScale(o.commitsLast12mo, 1500);
  const collaboration = logScale(o.mergedPRs + o.reviewsGiven, 300);
  // Discipline = share of repos that ship tests, CI, and docs (3 facets).
  const discipline =
    o.originalRepos > 0
      ? ratioPct(
          c.reposWithTests + c.reposWithCI + c.reposWithDocs,
          o.originalRepos * 3,
        )
      : 0;

  const score = weightedAvg([
    { value: originality, weight: 0.15 },
    { value: impact, weight: 0.25 },
    { value: volume, weight: 0.2 },
    { value: collaboration, weight: 0.2 },
    { value: discipline, weight: 0.2 },
  ]);

  const factors: ScoreFactor[] = [
    f("Original repositories", originality, `${o.originalRepos} authored`),
    f("Community impact", impact, `${o.totalStars} stars earned`),
    f("Commit volume (12mo)", volume, `${o.commitsLast12mo} commits`),
    f(
      "Collaboration",
      collaboration,
      `${o.mergedPRs} merged PRs · ${o.reviewsGiven} reviews`,
    ),
    f("Engineering discipline", discipline, "tests · CI · docs coverage"),
  ];

  const confidence = clamp01(
    0.4 +
      (o.originalRepos > 0 ? 0.2 : 0) +
      (o.commitsLast12mo + o.commitsPrev12mo > 0 ? 0.2 : 0) +
      (c.languages.length > 0 ? 0.2 : 0),
  );

  return pillar("technical", score, confidence, factors);
}

/** Growth trajectory, is output accelerating, and is it sustained? */
function trajectoryPillar(s: TalentSignals): PillarScore {
  const o = s.output;

  const velocity = growthScore(o.commitsLast12mo, o.commitsPrev12mo);
  const breadth = logScale(s.craft.languages.length, 8);
  const consistency = logScale(
    o.contributionsLastYear / Math.max(1, s.account.accountAgeYears),
    600,
  );

  const score = weightedAvg([
    { value: velocity, weight: 0.5 },
    { value: breadth, weight: 0.2 },
    { value: consistency, weight: 0.3 },
  ]);

  const factors: ScoreFactor[] = [
    f(
      "Output acceleration (YoY)",
      velocity,
      `${o.commitsPrev12mo} → ${o.commitsLast12mo} commits`,
    ),
    f("Skill breadth", breadth, `${s.craft.languages.length} languages`),
    f(
      "Sustained contribution",
      consistency,
      `${o.contributionsLastYear} contributions/yr`,
    ),
  ];

  const confidence = clamp01(
    0.3 +
      (o.commitsPrev12mo > 0 ? 0.4 : 0.1) +
      (o.contributionsLastYear > 0 ? 0.3 : 0),
  );

  return pillar("trajectory", score, confidence, factors);
}

/**
 * The Dark-Talent signal, the heart of the model.
 *
 *   outputIndex   = how much this person demonstrably ships / impacts (0..100)
 *   pedigreeIndex = how much "establishment credential" they carry  (0..100)
 *
 * The signal rewards a large POSITIVE gap (high output, low pedigree): the
 * person the legacy filters miss. Someone elite-and-productive still scores
 * well on `technical`; the *arbitrage*, the undervaluation, lives here.
 * Ramanujan had no credentials and the notebook of a century. This pillar
 * exists to surface that shape: the 1729 hiding in plain sight.
 */
function darkSignalPillar(s: TalentSignals): PillarScore {
  const outputIndex = computeOutputIndex(s);
  const pedigreeIndex = computePedigreeIndex(s);

  // Undervaluation = demonstrated output beyond what the résumé predicts.
  const gap = clamp01((outputIndex - pedigreeIndex) / 100);
  const nonTradBonus = s.pedigree.selfReportedNonTraditional ? 8 : 0;

  const score = clamp(0.6 * outputIndex + 40 * gap + nonTradBonus);

  const factors: ScoreFactor[] = [
    f("Demonstrated output", outputIndex, "stars · commits · repos · PRs"),
    f("Pedigree (discounted)", -pedigreeIndex, pedigreeLabel(s)),
    f("Undervaluation gap", 40 * gap, "output beyond résumé expectation"),
  ];
  if (nonTradBonus) {
    factors.push(
      f(
        "Non-traditional path",
        nonTradBonus,
        "self-taught / bootcamp / career-changer",
      ),
    );
  }

  const confidence = clamp01(0.5 + (outputIndex > 0 ? 0.5 : 0));
  return pillar("darkSignal", score, confidence, factors);
}

/** Merit influence, is the person's work depended on, not just followed? */
function influencePillar(s: TalentSignals): PillarScore {
  const { output: o, account: a } = s;

  const dependents = logScale(o.totalForks, 400);
  const helping = logScale(o.reviewsGiven + o.issuesResolved, 200);
  const reach = logScale(a.followers, 2000); // vanity metric, least weight

  const score = weightedAvg([
    { value: dependents, weight: 0.45 },
    { value: helping, weight: 0.35 },
    { value: reach, weight: 0.2 },
  ]);

  const factors: ScoreFactor[] = [
    f("Code depended on", dependents, `${o.totalForks} forks`),
    f(
      "Helping others",
      helping,
      `${o.reviewsGiven} reviews · ${o.issuesResolved} issues resolved`,
    ),
    f("Audience reach", reach, `${a.followers} followers`),
  ];

  const confidence = clamp01(0.4 + (a.followers + o.totalForks > 0 ? 0.6 : 0));
  return pillar("influence", score, confidence, factors);
}

/** Network-State alignment, optional, consent-based. Absent ⇒ confidence 0. */
function alignmentPillar(s: TalentSignals): PillarScore {
  const a = s.alignment;
  if (!a) {
    return pillar("alignment", 0, 0, [
      f("Not shared", 0, "candidate has not provided alignment signals"),
    ]);
  }

  const openness = clamp(a.openSourceRatio * 100);
  const indie = logScale(a.indieProjects, 10);
  const onchain = a.onChainActivity ? 100 : 0;
  const remote = a.remoteAsync ? 100 : 0;
  const survey = a.selfAssessment ? clamp(mean(Object.values(a.selfAssessment))) : 0;

  const parts = [
    { value: openness, weight: 0.3 },
    { value: indie, weight: 0.2 },
    { value: onchain, weight: 0.2 },
    { value: remote, weight: 0.15 },
  ];
  if (a.selfAssessment) parts.push({ value: survey, weight: 0.15 });

  const factors: ScoreFactor[] = [
    f("Builds in the open", openness, `${Math.round(a.openSourceRatio * 100)}% open-source`),
    f("Parallel / indie building", indie, `${a.indieProjects} bootstrapped`),
    f("On-chain activity", onchain, a.onChainActivity ? "present" : "none"),
    f("Remote-first / async", remote, a.remoteAsync ? "yes" : "no"),
  ];
  if (a.selfAssessment) factors.push(f("Self-assessment", survey, "values questionnaire"));

  const confidence = clamp01(0.6 + (a.selfAssessment ? 0.4 : 0.2));
  return pillar("alignment", weightedAvg(parts), confidence, factors);
}

// ───────────────────────────── Internals ─────────────────────────────

function computeOutputIndex(s: TalentSignals): number {
  const o = s.output;
  return weightedAvg([
    { value: logScale(o.totalStars, 800), weight: 0.3 },
    { value: logScale(o.commitsLast12mo, 1500), weight: 0.25 },
    { value: logScale(o.originalRepos, 40), weight: 0.2 },
    { value: logScale(o.mergedPRs, 200), weight: 0.25 },
  ]);
}

function computePedigreeIndex(s: TalentSignals): number {
  const p = s.pedigree;
  return clamp(
    10 +
      (p.eliteEducation ? 35 : 0) +
      (p.bigTechExperience ? 35 : 0) +
      logScale(p.credentialedYears, 25) * 0.2,
  );
}

function pedigreeLabel(s: TalentSignals): string {
  const p = s.pedigree;
  const marks: string[] = [];
  if (p.eliteEducation) marks.push("elite education");
  if (p.bigTechExperience) marks.push("big-tech experience");
  if (p.credentialedYears > 0) marks.push(`${p.credentialedYears}y credentialed`);
  return marks.length ? marks.join(" · ") : "no establishment markers";
}

function buildHighlights(s: TalentSignals, pillars: PillarScore[]): string[] {
  const get = (k: PillarKey): PillarScore =>
    pillars.find((p) => p.key === k) as PillarScore;

  const out: string[] = [];
  const darkSignal = get("darkSignal");
  const trajectory = get("trajectory");
  const influence = get("influence");

  if (darkSignal.score >= 70 && computePedigreeIndex(s) < 30) {
    out.push(
      "💎 1729 signal, elite output from a non-elite background; exactly the talent legacy filters miss.",
    );
  }
  if ((trajectory.factors[0]?.points ?? 0) >= 70) {
    out.push("📈 Steep trajectory, output is accelerating year over year.");
  }
  const discipline =
    s.output.originalRepos > 0
      ? ratioPct(
          s.craft.reposWithTests + s.craft.reposWithCI + s.craft.reposWithDocs,
          s.output.originalRepos * 3,
        )
      : 0;
  if (discipline >= 70) {
    out.push("🧪 Disciplined craft, tests, CI, and docs across most repos.");
  }
  if ((influence.factors[0]?.points ?? 0) >= 70) {
    out.push("🌱 Real influence, their code is forked and depended upon, not just starred.");
  }
  if (s.pedigree.selfReportedNonTraditional) {
    out.push("🛤️ Non-traditional path, self-taught / bootcamp / career-changer.");
  }
  return out;
}

const f = (label: string, points: number, detail?: string): ScoreFactor => ({
  label,
  points: round1(points),
  detail,
});

const pillar = (
  key: PillarKey,
  score: number,
  confidence: number,
  factors: ScoreFactor[],
): PillarScore => ({
  key,
  label: PILLAR_LABELS[key],
  score: round1(score),
  weight: 0, // set by scoreTalent() after re-normalization
  confidence: round2(confidence),
  factors,
});
