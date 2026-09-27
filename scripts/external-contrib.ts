/**
 * external-contrib: backtest 2. Does helping on OTHER people's projects, before
 * anyone noticed you, predict becoming a core maintainer?
 *
 * For each person in the backtest (joiners + controls), counts, BEFORE their
 * as-of date:
 *   ext_prs        merged PRs they authored into repos they do not own
 *   ext_prs_12mo   same, in the 12 months before as-of only
 *   ext_repos      distinct outside repos that merged their work (from up to 100 PRs)
 *   ext_orgs       distinct outside owners (people or orgs) among those repos
 *
 * Search API only; paced for the 30/min limit.
 *
 * Output: data/backtest/external_contrib.csv, then prints AUC per metric.
 * Run:  GITHUB_TOKEN=$(gh auth token) npx tsx scripts/external-contrib.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { Octokit } from "@octokit/rest";
import { withBackoff } from "../src/lib/integrations/backoff";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function load(path: string) {
  const [head, ...lines] = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const cols = head!.split(",");
  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
}

const people = [
  ...load("data/backtest/scores_asof.csv"),
  ...load("data/backtest/scores_control.csv"),
].map((r) => ({ login: r.login!, role: r.role!, asOf: r.as_of! }));

async function search(q: string, perPage: number) {
  return withBackoff(
    () => octokit.search.issuesAndPullRequests({ q, per_page: perPage }),
    { maxAttempts: 4 },
  );
}

const out = ["login,role,as_of,ext_prs,ext_prs_12mo,ext_repos,ext_orgs"];
for (const p of people) {
  const end = p.asOf;
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  const base = `type:pr is:merged author:${p.login} -user:${p.login}`;
  try {
    const all = await search(`${base} created:<${end}`, 100);
    await sleep(2200);
    const recent = await search(`${base} created:${start.toISOString().slice(0, 10)}..${end}`, 1);
    await sleep(2200);
    const repos = new Set<string>();
    const orgs = new Set<string>();
    for (const it of all.data.items) {
      const m = it.repository_url.match(/repos\/([^/]+)\/([^/]+)$/);
      if (!m) continue;
      repos.add(`${m[1]}/${m[2]}`);
      orgs.add(m[1]!.toLowerCase());
    }
    const line = [p.login, p.role, p.asOf, all.data.total_count, recent.data.total_count, repos.size, orgs.size].join(",");
    out.push(line);
    console.log(line);
  } catch (e) {
    console.warn(`${p.login}: ${(e as Error).message.slice(0, 80)}`);
  }
}
writeFileSync("data/backtest/external_contrib.csv", out.join("\n") + "\n");

// ── AUC per metric ─────────────────────────────────────────────────────────
const rows = load("data/backtest/external_contrib.csv");
const J = rows.filter((r) => r.role === "late_joiner");
const C = rows.filter((r) => r.role === "control");
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};
const auc = (a: number[], b: number[]) => {
  let w = 0; for (const x of a) for (const y of b) w += x > y ? 1 : x === y ? 0.5 : 0;
  return w / (a.length * b.length);
};
console.log(`\njoiners n=${J.length}, controls n=${C.length}`);
for (const m of ["ext_prs", "ext_prs_12mo", "ext_repos", "ext_orgs"]) {
  const a = J.map((r) => Number(r[m])), b = C.map((r) => Number(r[m]));
  console.log(`${m.padEnd(14)} joiner median ${median(a)}  control median ${median(b)}  AUC ${auc(a, b).toFixed(2)}`);
}
