import { createHash } from "node:crypto";
import { z } from "zod";
import { getPrisma, isDbConfigured } from "@/lib/db";
import { scoreTalent } from "@/lib/scoring";
import { fetchGitHubSignals } from "@/lib/integrations/github";
import type { TalentSignals } from "@/lib/scoring/types";
import type { PoolCandidate } from "@/lib/shortlist/pool";

/**
 * The card service.
 *
 * This is the hub the talent trifecta was missing. skill.supply and
 * company.university call into it, darktalent reads out of it, and the shared
 * object is TalentProfile plus its Score, Artifact and Placement history.
 *
 * Two rules are enforced here rather than trusted to callers:
 *  1. Ranking is permissionless, selling is not. The score itself reads only
 *     public GitHub signal, the same surface any recruiter can already see,
 *     so DISCOVERED profiles are ranked on the public leaderboard without
 *     needing consent, exactly like a box score does not need a player's
 *     permission to compute his batting average. What still requires the
 *     person's own opt-in is being placed in the PAID, contactable pool that
 *     skill.supply brokers, `loadPoolFromDb` below, which stays gated on
 *     `PROFILE_DISPLAY` consent. Contact details are never surfaced at all
 *     without separate `CONTACT` consent, on either surface.
 *  2. Players never pay and are never sold to. Nothing in this file takes money.
 */

export const OptInSchema = z.object({
  handle: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-]{1,39}$/, "handle must be a valid GitHub username"),
  displayName: z.string().trim().max(120).optional(),
  tagline: z.string().trim().max(200).optional(),
  location: z.string().trim().max(120).optional(),
  /** Which surface captured the opt-in. */
  origin: z.enum(["skill.supply", "darktalent.tech", "company.university"]),
  consent: z.object({
    /** Required. Without it the person is not shown to any company. */
    display: z.literal(true),
    /** Optional. Gates whether a company may be given contact details. */
    contact: z.boolean().default(false),
  }),
  /** Optional pre-computed signals. When absent we ingest from public GitHub. */
  signals: z.custom<TalentSignals>().optional(),
});

export type OptInInput = z.infer<typeof OptInSchema>;

export type OptInResult =
  | { ok: true; handle: string; overall: number; created: boolean }
  | { ok: false; error: string; code: "NO_DB" | "BAD_INPUT" | "INGEST_FAILED" | "DB_FAILED" };

/** Never store a raw IP. */
function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.AUTH_SECRET ?? "darktalent";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Create or refresh a consented card. Idempotent on handle: opting in twice
 * refreshes the score rather than duplicating the person.
 */
export async function upsertCard(
  input: OptInInput,
  meta: { ip?: string | null } = {},
): Promise<OptInResult> {
  const db = getPrisma();
  if (!db) {
    return {
      ok: false,
      code: "NO_DB",
      error: "No database configured. Set DATABASE_URL to accept opt-ins.",
    };
  }

  // 1. Signals: use what the caller sent, else ingest public GitHub.
  let signals = input.signals;
  if (!signals) {
    try {
      signals = await fetchGitHubSignals(input.handle);
    } catch {
      return {
        ok: false,
        code: "INGEST_FAILED",
        error: `Could not read public GitHub for "${input.handle}".`,
      };
    }
  }

  // 2. Score with the real engine. Nothing is hand assigned.
  const score = scoreTalent(signals);

  try {
    const existing = await db.talentProfile.findUnique({
      where: { handle: input.handle },
      select: { id: true },
    });

    const profile = await db.talentProfile.upsert({
      where: { handle: input.handle },
      create: {
        handle: input.handle,
        displayName: input.displayName ?? input.handle,
        headline: input.tagline,
        location: input.location,
        origin: input.origin,
        // They opted in themselves, so this is a claimed card, not a scrape.
        status: "CLAIMED",
        latestOverall: score.overall,
        latestConfidence: score.confidence,
        latestScoredAt: new Date(score.computedAt),
      },
      update: {
        displayName: input.displayName ?? undefined,
        headline: input.tagline ?? undefined,
        location: input.location ?? undefined,
        status: "CLAIMED",
        latestOverall: score.overall,
        latestConfidence: score.confidence,
        latestScoredAt: new Date(score.computedAt),
      },
      select: { id: true },
    });

    // 3. Immutable provenance: a new snapshot and a new score every time.
    const snapshot = await db.signalSnapshot.create({
      data: {
        profileId: profile.id,
        source: "GITHUB",
        signals: signals as unknown as object,
      },
      select: { id: true },
    });

    await db.score.create({
      data: {
        profileId: profile.id,
        snapshotId: snapshot.id,
        overall: score.overall,
        confidence: score.confidence,
        breakdown: score as unknown as object,
        weightsUsed: Object.fromEntries(score.pillars.map((p) => [p.key, p.weight])),
        modelVersion: score.modelVersion,
      },
    });

    // 4. Consent, recorded per scope and revocable.
    const ipHash = hashIp(meta.ip ?? null);
    const scopes: { scope: "PUBLIC_INGEST" | "PROFILE_DISPLAY" | "CONTACT" }[] = [
      { scope: "PUBLIC_INGEST" },
      { scope: "PROFILE_DISPLAY" },
    ];
    if (input.consent.contact) scopes.push({ scope: "CONTACT" });

    await db.consentRecord.createMany({
      data: scopes.map((s) => ({
        profileId: profile.id,
        scope: s.scope,
        status: "GRANTED" as const,
        source: `opt-in:${input.origin}`,
        ipHash,
      })),
    });

    await db.auditLog.create({
      data: {
        action: existing ? "REFRESH_CARD" : "CREATE_CARD",
        targetId: profile.id,
        metadata: { handle: input.handle, origin: input.origin, overall: score.overall },
      },
    });

    return { ok: true, handle: input.handle, overall: score.overall, created: !existing };
  } catch (e) {
    // A bare catch{} here once discarded the real error entirely, making a
    // real production failure undiagnosable from the outside. Log it; never
    // swallow a write failure silently again.
    console.error("upsertCard write failed:", e instanceof Error ? e.message : e);
    return { ok: false, code: "DB_FAILED", error: "Could not write the card." };
  }
}

/** Revoke display consent and hide the card. The right to leave must be real. */
export async function revokeCard(handle: string): Promise<{ ok: boolean; error?: string }> {
  const db = getPrisma();
  if (!db) return { ok: false, error: "No database configured." };
  try {
    const profile = await db.talentProfile.findUnique({
      where: { handle },
      select: { id: true },
    });
    if (!profile) return { ok: false, error: "No such card." };

    await db.consentRecord.updateMany({
      where: { profileId: profile.id, status: "GRANTED" },
      data: { status: "REVOKED" },
    });
    await db.talentProfile.update({
      where: { id: profile.id },
      data: { status: "HIDDEN" },
    });
    await db.auditLog.create({
      data: { action: "REVOKE_CONSENT", targetId: profile.id, metadata: { handle } },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not revoke." };
  }
}

/**
 * Read the sellable pool: cards that are visible, consented to display, and
 * carry a stored signal snapshot to score against.
 */
export async function loadPoolFromDb(limit = 200): Promise<PoolCandidate[]> {
  const db = getPrisma();
  if (!db) return [];
  try {
    const rows = await db.talentProfile.findMany({
      where: {
        status: { not: "HIDDEN" },
        consents: { some: { scope: "PROFILE_DISPLAY", status: "GRANTED" } },
        signalSnapshots: { some: {} },
      },
      orderBy: { latestScoredAt: "desc" },
      take: limit,
      select: {
        handle: true,
        displayName: true,
        headline: true,
        location: true,
        signalSnapshots: {
          orderBy: { capturedAt: "desc" },
          take: 1,
          select: { signals: true },
        },
      },
    });

    return rows
      .filter((r) => r.signalSnapshots.length > 0)
      .map((r): PoolCandidate => ({
        key: r.handle,
        displayName: r.displayName ?? r.handle,
        tagline: r.headline ?? [r.location, "opted in"].filter(Boolean).join(" · "),
        isComposite: false,
        signals: r.signalSnapshots[0]!.signals as unknown as TalentSignals,
      }));
  } catch {
    return [];
  }
}

export type LeaderboardRow = {
  handle: string;
  displayName: string;
  headline: string | null;
  location: string | null;
  status: "DISCOVERED" | "CLAIMED";
  overall: number;
  confidence: number;
  scoredAt: string;
};

/**
 * Read the public leaderboard: every ranked profile, DISCOVERED or CLAIMED,
 * scored from public signal alone. No consent required to appear here, only
 * to be sold. See the file-level comment above. HIDDEN profiles (a real
 * revoke) never appear, that request is honored everywhere, permissionless
 * or not.
 */
export async function loadPublicLeaderboard(limit = 100): Promise<LeaderboardRow[]> {
  const db = getPrisma();
  if (!db) return [];
  try {
    const rows = await db.talentProfile.findMany({
      where: {
        status: { in: ["DISCOVERED", "CLAIMED"] },
        signalSnapshots: { some: {} },
      },
      orderBy: { latestOverall: "desc" },
      take: limit,
      select: {
        handle: true,
        displayName: true,
        headline: true,
        location: true,
        status: true,
        latestOverall: true,
        latestConfidence: true,
        latestScoredAt: true,
      },
    });

    return rows.map((r) => ({
      handle: r.handle,
      displayName: r.displayName ?? r.handle,
      headline: r.headline,
      location: r.location,
      status: r.status as "DISCOVERED" | "CLAIMED",
      overall: r.latestOverall ?? 0,
      confidence: r.latestConfidence ?? 0,
      scoredAt: (r.latestScoredAt ?? new Date(0)).toISOString(),
    }));
  } catch {
    return [];
  }
}

export { isDbConfigured };
