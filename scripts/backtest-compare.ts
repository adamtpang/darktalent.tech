/**
 * backtest-compare: which signals, measured a year BEFORE, separated future
 * core maintainers from same-repo, same-era contributors who stayed peripheral?
 *
 * Metric: AUC, the probability a random late joiner scores higher than a
 * random control (ties count half). 0.5 = coin flip, 1.0 = perfect.
 *
 * Run: npx tsx scripts/backtest-compare.ts
 */
import { readFileSync } from "node:fs";

function load(path: string) {
  const [head, ...lines] = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const cols = head!.split(",");
  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
}

const joiners = load("data/backtest/scores_asof.csv");
const controls = load("data/backtest/scores_control.csv");

const metrics = [
  "overall", "technical", "trajectory", "darkSignal", "influence",
  "commits_12mo", "commits_prev12mo", "merged_prs", "reviews", "original_repos",
];

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

function auc(a: number[], b: number[]) {
  let wins = 0;
  for (const x of a) for (const y of b) wins += x > y ? 1 : x === y ? 0.5 : 0;
  return wins / (a.length * b.length);
}

console.log(`late joiners n=${joiners.length}, controls n=${controls.length}\n`);
console.log("metric".padEnd(18), "joiner median".padStart(14), "control median".padStart(15), "AUC".padStart(6));
const rows = metrics.map((m) => {
  const a = joiners.map((r) => Number(r[m]));
  const b = controls.map((r) => Number(r[m]));
  return { m, ja: median(a), cb: median(b), auc: auc(a, b) };
}).sort((x, y) => y.auc - x.auc);
for (const r of rows) {
  console.log(r.m.padEnd(18), String(r.ja).padStart(14), String(r.cb).padStart(15), r.auc.toFixed(2).padStart(6));
}

const zero = (rs: Record<string, string>[]) =>
  rs.filter((r) => Number(r.commits_12mo) === 0 && Number(r.merged_prs) === 0).length;
console.log(`\nno visible activity a year before: joiners ${zero(joiners)}/${joiners.length}, controls ${zero(controls)}/${controls.length}`);
