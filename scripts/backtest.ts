/**
 * backtest: score core maintainers as they looked ONE YEAR BEFORE their first
 * commit to the repo they later became core on. This is the Moneyball test:
 * does the engine see ability before the outcome, not after.
 *
 * Input:  data/backtest/core_maintainers.csv
 * Output: data/backtest/scores_asof.csv
 *
 * Run:  GITHUB_TOKEN=$(gh auth token) npx tsx scripts/backtest.ts [--limit=N] [--role=late_joiner]
 *
 * Stars, forks, and followers are zeroed in asOf mode (they only exist as
 * today's totals), so the test uses time-safe signals only.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fetchGitHubSignals } from "../src/lib/integrations/github";
import { scoreTalent } from "../src/lib/scoring";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=") as [string, string]),
);
const limit = args.limit ? Number(args.limit) : Infinity;
const role = args.role;

const rows = readFileSync("data/backtest/core_maintainers.csv", "utf8")
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((l) => l.split(","))
  .map(([repo, login, commits, first, created, days, r]) => ({ repo, login, first, role: r }))
  .filter((r) => r.first && (!role || r.role === role))
  .slice(0, limit);

const out = ["repo,login,role,as_of,overall,confidence,technical,trajectory,darkSignal,influence,commits_12mo,commits_prev12mo,merged_prs,reviews,original_repos"];

for (const r of rows) {
  const asOf = new Date(r.first);
  asOf.setFullYear(asOf.getFullYear() - 1);
  try {
    const s = await fetchGitHubSignals(r.login, { asOf });
    const sc = scoreTalent(s);
    const p = Object.fromEntries(sc.pillars.map((x) => [x.key, x.score]));
    const line = [
      r.repo, r.login, r.role, asOf.toISOString().slice(0, 10),
      sc.overall, sc.confidence, p.technical, p.trajectory, p.darkSignal, p.influence,
      s.output.commitsLast12mo, s.output.commitsPrev12mo, s.output.mergedPRs,
      s.output.reviewsGiven, s.output.originalRepos,
    ].join(",");
    out.push(line);
    console.log(line);
  } catch (e) {
    console.warn(`${r.login}: ${(e as Error).message.slice(0, 80)}`);
  }
  await new Promise((res) => setTimeout(res, 3000));
}

writeFileSync("data/backtest/scores_asof.csv", out.join("\n") + "\n");
