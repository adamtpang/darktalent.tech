/**
 * build-random-control: the fair control group. For each late joiner, one
 * RANDOM GitHub user whose account is about as old (GitHub user IDs are
 * sequential, so a nearby ID means a similar signup date), with at least 3
 * public repos so the account is real, not empty.
 *
 * This asks the business question: can the engine find strong builders in a
 * crowd? (The same-repo control asks the harder "good vs great" question.)
 *
 * Scored as of the SAME date as the joiner it is matched to (first_commit is
 * copied from the joiner, so backtest.ts computes the identical as-of date).
 *
 * Core REST API only. Seeded RNG, so the sample is reproducible.
 *
 * Output: data/backtest/random_control.csv (role=random)
 * Run:    GITHUB_TOKEN=$(gh auth token) npx tsx scripts/build-random-control.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

let seed = 1729;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);

const rows = readFileSync("data/backtest/core_maintainers.csv", "utf8")
  .trim().split(/\r?\n/).slice(1).map((l) => l.split(","))
  .filter((r) => r[6] === "late_joiner" && r[3]);

const exclude = new Set(rows.map((r) => r[1]!.toLowerCase()));
const out = ["repo,login,commits,first_commit,repo_created,days_after_creation,role,matched_to"];

for (const [repo, login, , first, created] of rows) {
  try {
    const { data: j } = await octokit.users.getByUsername({ username: login! });
    let found: string | null = null;
    for (let attempt = 0; attempt < 6 && !found; attempt++) {
      const since = Math.max(1, j.id + Math.round((rand() - 0.5) * 200_000));
      const { data: batch } = await octokit.users.list({ since, per_page: 20 });
      for (const u of batch) {
        if (u.type !== "User" || /bot/i.test(u.login) || exclude.has(u.login.toLowerCase())) continue;
        // Listed accounts can since be deleted or renamed: skip, don't abort.
        const full = await octokit.users.getByUsername({ username: u.login }).then((r) => r.data).catch(() => null);
        if (!full || (full.public_repos ?? 0) < 3) continue;
        found = u.login;
        exclude.add(u.login.toLowerCase());
        break;
      }
    }
    if (!found) { console.warn(`${login}: no random match`); continue; }
    const line = [repo, found, 0, first, created, "", "random", login].join(",");
    out.push(line);
    console.log(line);
  } catch (e) {
    console.warn(`${login}: ${(e as Error).message.slice(0, 80)}`);
  }
}

writeFileSync("data/backtest/random_control.csv", out.join("\n") + "\n");
console.log(`\n${out.length - 1} random controls for ${rows.length} late joiners`);
