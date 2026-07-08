/**
 * Seed: demonstrates the full pipeline — TalentSignals ─▶ score ─▶ persisted
 * profile + snapshot + explainable score. Run with: `npm run db:seed`
 * (requires DATABASE_URL set and `npm run db:push` already applied).
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { scoreTalent } from "../src/lib/scoring/engine";
import { DEFAULT_WEIGHTS } from "../src/lib/scoring/weights";
import { DARK_TALENT, CREDENTIALED } from "../src/lib/scoring/fixtures";
import type { TalentSignals } from "../src/lib/scoring/types";

const prisma = new PrismaClient();

async function seedProfile(
  signals: TalentSignals,
  meta: { displayName: string; headline: string; location: string },
) {
  const score = scoreTalent(signals);

  const profile = await prisma.talentProfile.upsert({
    where: { handle: signals.handle },
    update: { ...meta },
    create: { handle: signals.handle, status: "DISCOVERED", ...meta },
  });

  const snapshot = await prisma.signalSnapshot.create({
    data: {
      profileId: profile.id,
      source: "GITHUB",
      signals: signals as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.score.create({
    data: {
      profileId: profile.id,
      snapshotId: snapshot.id,
      overall: score.overall,
      confidence: score.confidence,
      breakdown: score as unknown as Prisma.InputJsonValue,
      weightsUsed: DEFAULT_WEIGHTS as unknown as Prisma.InputJsonValue,
      modelVersion: score.modelVersion,
    },
  });

  await prisma.talentProfile.update({
    where: { id: profile.id },
    data: {
      latestOverall: score.overall,
      latestConfidence: score.confidence,
      latestScoredAt: new Date(),
    },
  });

  console.log(`  seeded ${signals.handle} → ${score.overall}`);
}

async function main() {
  console.log("Seeding talent profiles…");
  await seedProfile(DARK_TALENT, {
    displayName: "Ada (dark talent)",
    headline: "Self-taught systems hacker · Rust/TS",
    location: "Lagos, NG",
  });
  await seedProfile(CREDENTIALED, {
    displayName: "Sam (credentialed)",
    headline: "Senior SWE · ex-BigTech",
    location: "Seattle, US",
  });
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
