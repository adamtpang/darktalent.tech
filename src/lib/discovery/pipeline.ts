import { fetchGitHubSignals } from "@/lib/integrations/github";
import { scoreTalent } from "@/lib/scoring/engine";
import { DEFAULT_WEIGHTS } from "@/lib/scoring/weights";
import type { DarkTalentScore, TalentSignals } from "@/lib/scoring/types";
import { getPrisma } from "@/lib/db";
import { discoverCandidateHandles, type SearchSeed, DEFAULT_SEEDS } from "./search";

/**
 * The discovery pipeline: search -> score -> filter -> persist as DISCOVERED.
 *
 * The search step (search.ts) only decides where to look. This module is
 * where the actual talent judgment happens, and it happens exactly once, in
 * the same scoreTalent() the rest of the product uses. A candidate is kept
 * only if their OWN output clears the bar, never because of where they are.
 *
 * DISCOVERED is a real ProfileStatus already in prisma/schema.prisma, built
 * for exactly this: ingested from public data, unclaimed. No ConsentRecord is
 * created here, so these profiles carry no PROFILE_DISPLAY or CONTACT
 * consent, and loadPoolFromDb() (src/lib/card/service.ts) will never surface
 * them on /hiring. They are raw material for a future "we found your GitHub,
 * want to claim your card" invite, not a bypass of consent.
 */

export interface DiscoveryResult {
  handle: string;
  seed: SearchSeed;
  signals: TalentSignals;
  score: DarkTalentScore;
  kept: boolean;
  reason?: string;
}

export interface DiscoverAndScoreOptions {
  seeds?: SearchSeed[];
  token?: string;
  perSeed?: number;
  /** Cap on candidates fully ingested. Each one costs ~5 Search API calls. */
  maxCandidates?: number;
  /**
   * Minimum Dark-Talent Signal pillar score to keep, 0-100. This pillar is
   * output-minus-pedigree, so a high floor is the actual "dark talent" filter,
   * not the search seed. Default chosen to be selective, not exhaustive.
   */
  darkSignalFloor?: number;
  /** Minimum overall score, a floor against thin/inactive accounts. */
  overallFloor?: number;
}

const PACE_MS = 3000; // mirrors scripts/scout-batch.ts's existing pacing

export async function discoverAndScore(
  opts: DiscoverAndScoreOptions = {},
): Promise<DiscoveryResult[]> {
  const token = opts.token ?? process.env.GITHUB_TOKEN;
  const seeds = opts.seeds ?? DEFAULT_SEEDS;
  const darkSignalFloor = opts.darkSignalFloor ?? 55;
  const overallFloor = opts.overallFloor ?? 40;

  console.log(`Searching ${seeds.length} seeds (mobile-telescope net)...`);
  const candidates = await discoverCandidateHandles(seeds, {
    token,
    perSeed: opts.perSeed,
    maxCandidates: opts.maxCandidates ?? 24,
  });
  console.log(`Found ${candidates.length} candidate handles. Scoring each...\n`);

  const results: DiscoveryResult[] = [];

  for (const { handle, seed } of candidates) {
    try {
      const signals = await fetchGitHubSignals(handle, { token });
      const score = scoreTalent(signals);
      const darkSignal = score.pillars.find((p) => p.key === "darkSignal")?.score ?? 0;
      const kept = darkSignal >= darkSignalFloor && score.overall >= overallFloor;

      results.push({
        handle,
        seed,
        signals,
        score,
        kept,
        reason: kept
          ? undefined
          : `below floor (dark ${darkSignal.toFixed(0)}/${darkSignalFloor}, overall ${score.overall.toFixed(0)}/${overallFloor})`,
      });

      const tag = kept ? "KEEP" : "skip";
      console.log(
        `  [${tag}] ${handle.padEnd(20)} overall ${String(score.overall.toFixed(0)).padStart(3)}  ` +
          `dark ${darkSignal.toFixed(0).padStart(3)}  ${signals.output.totalStars}★  ${signals.output.originalRepos} repos  ` +
          `(${seed.language}/${seed.location})`,
      );
    } catch (e) {
      console.log(`  [err]  ${handle.padEnd(20)} ${(e as Error).message.slice(0, 70)}`);
    }
    await new Promise((r) => setTimeout(r, PACE_MS));
  }

  return results;
}

export interface PersistSummary {
  attempted: number;
  created: number;
  refreshed: number;
  skippedClaimed: number;
  skippedNoDb: boolean;
}

/**
 * Persist the kept results as DISCOVERED profiles, mirroring prisma/seed.ts's
 * exact upsert -> snapshot -> score -> denormalize pattern. A profile that is
 * already CLAIMED (a real person who opted in through /scout or /api/card) is
 * left alone: discovery never overwrites a consented card.
 */
export async function persistDiscovered(results: DiscoveryResult[]): Promise<PersistSummary> {
  const db = getPrisma();
  const kept = results.filter((r) => r.kept);
  const summary: PersistSummary = {
    attempted: kept.length,
    created: 0,
    refreshed: 0,
    skippedClaimed: 0,
    skippedNoDb: !db,
  };

  if (!db) {
    console.warn("\nNo DATABASE_URL configured. Scored candidates were not persisted.");
    return summary;
  }

  for (const r of kept) {
    const existing = await db.talentProfile.findUnique({
      where: { handle: r.handle },
      select: { id: true, status: true },
    });

    if (existing && existing.status === "CLAIMED") {
      summary.skippedClaimed++;
      continue;
    }

    const profile = await db.talentProfile.upsert({
      where: { handle: r.handle },
      create: {
        handle: r.handle,
        status: "DISCOVERED",
        origin: "darktalent.tech:discovery",
        latestOverall: r.score.overall,
        latestConfidence: r.score.confidence,
        latestScoredAt: new Date(r.score.computedAt),
      },
      update: {
        latestOverall: r.score.overall,
        latestConfidence: r.score.confidence,
        latestScoredAt: new Date(r.score.computedAt),
      },
      select: { id: true },
    });

    const snapshot = await db.signalSnapshot.create({
      data: {
        profileId: profile.id,
        source: "GITHUB",
        signals: r.signals as unknown as object,
      },
      select: { id: true },
    });

    await db.score.create({
      data: {
        profileId: profile.id,
        snapshotId: snapshot.id,
        overall: r.score.overall,
        confidence: r.score.confidence,
        breakdown: r.score as unknown as object,
        weightsUsed: DEFAULT_WEIGHTS as unknown as object,
        modelVersion: r.score.modelVersion,
      },
    });

    if (existing) summary.refreshed++;
    else summary.created++;
  }

  return summary;
}
