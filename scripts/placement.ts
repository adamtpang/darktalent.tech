/**
 * placement: record Moneyball outcomes by hand. This is the only data that can
 * ever validate the score (see MONEYBALL_FINDINGS.md: public signals alone
 * barely beat a coin flip at "good vs great").
 *
 *   intro   <handle> <company> <role...>   log an introduction, FREEZING the
 *                                          engine's current belief about them
 *   outcome <placementId> <OUTCOME>        INTERVIEWING | HIRED | DECLINED |
 *                                          LEFT_EARLY | STUCK
 *   list                                   every placement, prediction vs result
 *
 * Add --dry to any command to print what would be written without writing.
 *
 * Run: npx tsx scripts/placement.ts intro kubkon "Acme" "Founding engineer"
 * Needs DATABASE_URL.
 */
import { PrismaClient } from "@prisma/client";

const OUTCOMES = ["INTRODUCED", "INTERVIEWING", "HIRED", "DECLINED", "LEFT_EARLY", "STUCK"] as const;
type Outcome = (typeof OUTCOMES)[number];

const argv = process.argv.slice(2);
const dry = argv.includes("--dry");
const [cmd, ...rest] = argv.filter((a) => a !== "--dry");
const db = new PrismaClient();

async function intro(handle: string, company: string, role: string) {
  const profile = await db.talentProfile.findUnique({
    where: { handle },
    select: { id: true, latestOverall: true, status: true, scores: { orderBy: { computedAt: "desc" }, take: 1, select: { modelVersion: true } } },
  });
  if (!profile) throw new Error(`No profile for @${handle}. Scout or discover them first.`);
  // Ranking is permissionless; selling someone into a company is not (CARD_API.md).
  if (profile.status !== "CLAIMED") {
    throw new Error(`@${handle} is ${profile.status}, not CLAIMED. They must claim their own card before any introduction.`);
  }
  const data = {
    profileId: profile.id,
    company,
    roleTitle: role,
    predictedOverall: profile.latestOverall,
    modelVersion: profile.scores[0]?.modelVersion ?? null,
  };
  if (dry) return console.log("DRY intro", data);
  const p = await db.placement.create({ data, select: { id: true } });
  console.log(`Logged intro ${p.id}: @${handle} to ${company}, predicted overall ${data.predictedOverall}`);
}

async function outcome(id: string, value: string) {
  if (!OUTCOMES.includes(value as Outcome)) throw new Error(`Outcome must be one of ${OUTCOMES.join(", ")}`);
  const o = value as Outcome;
  const data = {
    outcome: o,
    ...(o === "HIRED" ? { startedAt: new Date() } : {}),
    ...(o === "LEFT_EARLY" || o === "DECLINED" ? { endedAt: new Date() } : {}),
  };
  if (dry) return console.log("DRY outcome", id, data);
  await db.placement.update({ where: { id }, data });
  console.log(`Placement ${id} is now ${o}`);
}

async function list() {
  const rows = await db.placement.findMany({
    orderBy: { introducedAt: "desc" },
    select: { id: true, company: true, roleTitle: true, outcome: true, predictedOverall: true, profile: { select: { handle: true } } },
  });
  if (rows.length === 0) return console.log("0 placements. The Moneyball test has no outcomes yet.");
  for (const r of rows) {
    console.log([r.id, `@${r.profile.handle}`, r.company, r.roleTitle, `predicted ${r.predictedOverall ?? "?"}`, r.outcome].join(" | "));
  }
}

try {
  if (cmd === "intro" && rest.length >= 3) await intro(rest[0]!, rest[1]!, rest.slice(2).join(" "));
  else if (cmd === "outcome" && rest.length === 2) await outcome(rest[0]!, rest[1]!);
  else if (cmd === "list") await list();
  else console.log("usage: intro <handle> <company> <role> | outcome <id> <OUTCOME> | list   [--dry]");
} finally {
  await db.$disconnect();
}
