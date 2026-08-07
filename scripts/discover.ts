/**
 * discover: run the mobile-telescope pipeline for real.
 *
 * GitHub search (by language + region, cast wide) -> the real scoring engine
 * (the actual filter) -> persist as DISCOVERED (unclaimed, no display or
 * contact consent, per prisma/schema.prisma).
 *
 * This does NOT grow the sellable /hiring pool by itself, that pool is
 * consent-gated and only ever holds CLAIMED cards. This grows a lead list for
 * a future opt-in invite.
 *
 * Run:  GITHUB_TOKEN=$(gh auth token) DATABASE_URL=... DIRECT_URL=... \
 *         npx tsx scripts/discover.ts
 *
 * Flags: --dry (score only, do not write to the database)
 *        --max=N (cap candidates fully ingested, default 24)
 */
import { discoverAndScore, persistDiscovered } from "../src/lib/discovery/pipeline";

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const maxArg = args.find((a) => a.startsWith("--max="));
  const maxCandidates = maxArg ? Number(maxArg.split("=")[1]) : undefined;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("No GITHUB_TOKEN set. Search + per-candidate signal calls will rate-limit hard.\n");
  }

  const results = await discoverAndScore({ token, maxCandidates });

  const kept = results.filter((r) => r.kept);
  const skipped = results.filter((r) => !r.kept);

  console.log(`\n=== discovery summary ===`);
  console.log(`  candidates scored: ${results.length}`);
  console.log(`  cleared the dark-talent floor: ${kept.length}`);
  console.log(`  below floor: ${skipped.length}`);

  if (kept.length) {
    console.log(`\n=== kept, ranked ===`);
    [...kept]
      .sort((a, b) => b.score.overall - a.score.overall)
      .forEach((r, i) => {
        const dark = r.score.pillars.find((p) => p.key === "darkSignal")?.score ?? 0;
        console.log(
          `  ${String(i + 1).padStart(2)}. @${r.handle.padEnd(20)} overall ${r.score.overall.toFixed(0)}  ` +
            `dark ${dark.toFixed(0)}  (${r.seed.language}/${r.seed.location})`,
        );
      });
  }

  if (dry) {
    console.log("\n--dry: not persisted.");
    return;
  }

  const summary = await persistDiscovered(results);
  console.log(`\n=== persisted ===`);
  console.log(`  created: ${summary.created}`);
  console.log(`  refreshed (already DISCOVERED, re-scored): ${summary.refreshed}`);
  console.log(`  skipped (already CLAIMED, left alone): ${summary.skippedClaimed}`);
  if (summary.skippedNoDb) console.log(`  no DATABASE_URL configured, nothing written`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
