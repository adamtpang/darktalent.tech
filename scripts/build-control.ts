/**
 * build-control: the control group for the maintainer backtest.
 *
 * For each late joiner, find up to 2 contributors to the SAME repo whose first
 * commit landed within a year of the joiner's, but who stayed peripheral
 * (5 to 60 commits, not in the top 15). They showed up too, and did not make
 * the first team. Same repo and same era cancel out project and timing effects.
 *
 * Uses the core REST API only (not search), so it does not compete with a
 * running backtest for the 30/min search quota.
 *
 * Input:  data/backtest/core_maintainers.csv
 * Output: data/backtest/control_group.csv (same columns, role=control)
 *
 * Run:  GITHUB_TOKEN=$(gh auth token) npx tsx scripts/build-control.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const DAY = 864e5;

const joiners = readFileSync("data/backtest/core_maintainers.csv", "utf8")
  .trim().split(/\r?\n/).slice(1).map((l) => l.split(","))
  .map(([repo, login, commits, first, created, , role]) => ({ repo, login, first, created, role }))
  .filter((r) => r.role === "late_joiner" && r.first);

const coreLogins = new Set(
  readFileSync("data/backtest/core_maintainers.csv", "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(",")[1]),
);

/** First commit date of `login` to `repo`, via the last page of the commits list. */
async function firstCommit(owner: string, repo: string, login: string): Promise<string | null> {
  const res = await octokit.repos.listCommits({ owner, repo, author: login, per_page: 1 });
  const link = res.headers.link ?? "";
  const last = link.match(/[?&]page=(\d+)>; rel="last"/);
  if (!last) return res.data[0]?.commit.author?.date?.slice(0, 10) ?? null;
  const tail = await octokit.repos.listCommits({ owner, repo, author: login, per_page: 1, page: Number(last[1]) });
  return tail.data[0]?.commit.author?.date?.slice(0, 10) ?? null;
}

const out = ["repo,login,commits,first_commit,repo_created,days_after_creation,role,matched_to"];
const used = new Set<string>();

for (const repoName of [...new Set(joiners.map((j) => j.repo))]) {
  const [owner, repo] = repoName.split("/");
  // Contributors ranked roughly 16 to 115: showed up, stayed peripheral.
  const pool: { login: string; contributions: number; first?: string | null }[] = [];
  for (const page of [1, 2, 3, 4]) {
    const { data } = await octokit.repos.listContributors({ owner, repo, per_page: 30, page });
    for (const [i, c] of data.entries()) {
      const rank = (page - 1) * 30 + i;
      if (rank < 15 || c.type !== "User" || !c.login || /bot/i.test(c.login)) continue;
      if (coreLogins.has(c.login)) continue;
      if ((c.contributions ?? 0) < 5 || (c.contributions ?? 0) > 60) continue;
      pool.push({ login: c.login, contributions: c.contributions ?? 0 });
    }
  }

  for (const j of joiners.filter((x) => x.repo === repoName)) {
    const target = new Date(j.first).getTime();
    let picked = 0;
    for (const c of pool) {
      if (picked >= 2) break;
      if (used.has(c.login)) continue;
      if (c.first === undefined) {
        try { c.first = await firstCommit(owner, repo, c.login); } catch { c.first = null; }
      }
      if (!c.first) continue;
      if (Math.abs(new Date(c.first).getTime() - target) > 365 * DAY) continue;
      used.add(c.login);
      picked++;
      const days = Math.round((new Date(c.first).getTime() - new Date(j.created).getTime()) / DAY);
      const line = [repoName, c.login, c.contributions, c.first, j.created, days, "control", j.login].join(",");
      out.push(line);
      console.log(line);
    }
    if (picked < 2) console.warn(`${j.login}: only ${picked} control(s) found`);
  }
}

writeFileSync("data/backtest/control_group.csv", out.join("\n") + "\n");
console.log(`\n${out.length - 1} controls for ${joiners.length} late joiners`);
