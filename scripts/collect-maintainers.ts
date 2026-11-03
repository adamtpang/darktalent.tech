/**
 * collect-maintainers: add repos to the backtest roster. For each repo, takes
 * the top 5 human contributors (bots excluded), finds each one's first commit
 * to the repo, and tags them founding (<=120 days after repo creation) or
 * late_joiner. Appends to data/backtest/core_maintainers.csv, skipping repos
 * already present.
 *
 * Core REST API only (no search), so it can run beside a search-heavy job.
 *
 * Run:  GITHUB_TOKEN=$(gh auth token) npx tsx scripts/collect-maintainers.ts owner/repo ...
 */
import { readFileSync, appendFileSync } from "node:fs";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const FILE = "data/backtest/core_maintainers.csv";
const DAY = 864e5;

const existing = new Set(readFileSync(FILE, "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(",")[0]));

async function firstCommit(owner: string, repo: string, login: string): Promise<string | null> {
  const res = await octokit.repos.listCommits({ owner, repo, author: login, per_page: 1 });
  const last = (res.headers.link ?? "").match(/[?&]page=(\d+)>; rel="last"/);
  if (!last) return res.data[0]?.commit.author?.date?.slice(0, 10) ?? null;
  const tail = await octokit.repos.listCommits({ owner, repo, author: login, per_page: 1, page: Number(last[1]) });
  return tail.data[0]?.commit.author?.date?.slice(0, 10) ?? null;
}

for (const full of process.argv.slice(2)) {
  if (existing.has(full)) { console.log(`skip ${full} (already present)`); continue; }
  const [owner, repo] = full.split("/") as [string, string];
  try {
    const { data: meta } = await octokit.repos.get({ owner, repo });
    const created = meta.created_at.slice(0, 10);
    const { data } = await octokit.repos.listContributors({ owner, repo, per_page: 30 });
    const humans = data.filter((c) => c.type === "User" && c.login && !/bot/i.test(c.login)).slice(0, 5);
    for (const c of humans) {
      const first = await firstCommit(owner, repo, c.login!).catch(() => null);
      const days = first ? Math.round((new Date(first).getTime() - new Date(created).getTime()) / DAY) : "";
      const role = !first ? "unknown" : Number(days) <= 120 ? "founding" : "late_joiner";
      const line = [full, c.login, c.contributions, first ?? "", created, days, role].join(",");
      appendFileSync(FILE, line + "\n");
      console.log(line);
    }
  } catch (e) {
    console.warn(`${full}: ${(e as Error).message.slice(0, 80)}`);
  }
}
