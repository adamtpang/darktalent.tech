import { Octokit } from "@octokit/rest";
import type { TalentSignals, LanguageStat } from "../scoring/types";
import { withBackoff } from "./backoff";

/**
 * GitHub ingestion, turns a public GitHub handle into the normalized
 * `TalentSignals` the scorer consumes.
 *
 * Privacy posture: this reads ONLY public data. A token (server GITHUB_TOKEN or
 * a candidate's own OAuth token) is used purely to raise the rate limit, never
 * to access private repos here. Every network call degrades gracefully: if the
 * Search API is rate-limited, the affected signal falls back to 0 rather than
 * failing the whole ingestion.
 *
 * Note on accuracy: commit/PR/review counts come from the Search API, which is
 * a good approximation. For production-grade exactness, swap these for a single
 * GraphQL `contributionsCollection` query, see fetchContributionsGraphQL TODO.
 */

export interface GitHubIngestOptions {
  token?: string;
  /** Injected clock for deterministic date-range math (defaults to now). */
  now?: Date;
  /** Cap on repos to scan for language/craft stats. */
  maxRepos?: number;
}

export async function fetchGitHubSignals(
  handle: string,
  opts: GitHubIngestOptions = {},
): Promise<TalentSignals> {
  const octokit = new Octokit({
    auth: opts.token ?? process.env.GITHUB_TOKEN,
  });
  const now = opts.now ?? new Date();
  const maxRepos = opts.maxRepos ?? 100;

  const { data: user } = await octokit.users.getByUsername({ username: handle });

  // ── Repositories (owned, public) ──────────────────────────────────────────
  const repos = await octokit.paginate(octokit.repos.listForUser, {
    username: handle,
    type: "owner",
    per_page: 100,
    sort: "pushed",
  });

  const owned = repos.slice(0, maxRepos);
  const original = owned.filter((r) => !r.fork);

  const totalStars = original.reduce((s, r) => s + (r.stargazers_count ?? 0), 0);
  const totalForks = original.reduce((s, r) => s + (r.forks_count ?? 0), 0);

  // Language histogram from each repo's primary language (cheap, no extra call).
  const langWeights = new Map<string, number>();
  for (const r of original) {
    if (r.language) langWeights.set(r.language, (langWeights.get(r.language) ?? 0) + 1);
  }
  const languages: LanguageStat[] = [...langWeights.entries()]
    .map(([language, weight]) => ({ language, weight }))
    .sort((a, b) => b.weight - a.weight);

  // Cheap craft proxies (no per-file fetches): description/license/wiki presence.
  // For deeper signals (real test/CI detection) inspect repo contents/workflows.
  const reposWithDocs = original.filter(
    (r) => !!r.description || !!r.license || r.has_wiki,
  ).length;
  const reposWithTests = original.filter(
    (r) => (r.topics ?? []).some((t) => /test|tdd|spec/i.test(t)),
  ).length;
  const reposWithCI = original.filter(
    (r) => (r.topics ?? []).some((t) => /ci|github-actions|cd/i.test(t)),
  ).length;

  // ── Activity via Search API (approximate, rate-limited, degrades to 0) ──────
  const last12 = isoRange(monthsAgo(now, 12), now);
  const prev12 = isoRange(monthsAgo(now, 24), monthsAgo(now, 12));

  const [commitsLast12mo, commitsPrev12mo, mergedPRs, reviewsGiven, issuesResolved] =
    await Promise.all([
      countSearch(octokit, "commits", `author:${handle} committer-date:${last12}`),
      countSearch(octokit, "commits", `author:${handle} committer-date:${prev12}`),
      countSearch(octokit, "issues", `type:pr author:${handle} is:merged`),
      countSearch(octokit, "issues", `type:pr reviewed-by:${handle}`),
      countSearch(octokit, "issues", `type:issue assignee:${handle} is:closed`),
    ]);

  const accountAgeYears = user.created_at
    ? Math.max(0, (now.getTime() - new Date(user.created_at).getTime()) / YEAR_MS)
    : 1;

  return {
    handle,
    sources: ["github"],
    account: {
      accountAgeYears: round(accountAgeYears, 2),
      publicRepos: user.public_repos ?? owned.length,
      followers: user.followers ?? 0,
      following: user.following ?? 0,
    },
    output: {
      totalStars,
      totalForks,
      originalRepos: original.length,
      commitsLast12mo,
      commitsPrev12mo,
      contributionsLastYear: commitsLast12mo + mergedPRs + issuesResolved,
      mergedPRs,
      reviewsGiven,
      issuesResolved,
    },
    craft: { languages, reposWithTests, reposWithCI, reposWithDocs },
    // Pedigree comes from elsewhere (LinkedIn import, self-report). Default to
    // "no establishment markers", which is exactly the dark-talent baseline.
    pedigree: {
      eliteEducation: false,
      bigTechExperience: false,
      credentialedYears: 0,
    },
    // Alignment is opt-in and consent-based; not inferred from GitHub here.
  };
}

// ───────────────────────────── helpers ─────────────────────────────

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

function monthsAgo(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() - months);
  return d;
}

function isoRange(start: Date, end: Date): string {
  return `${start.toISOString().slice(0, 10)}..${end.toISOString().slice(0, 10)}`;
}

async function countSearch(
  octokit: Octokit,
  kind: "commits" | "issues",
  q: string,
): Promise<number> {
  try {
    // A rate-limited candidate should not silently score as if they shipped
    // nothing: retry the transient case before accepting the 0.
    return await withBackoff(async () => {
      if (kind === "commits") {
        const { data } = await octokit.search.commits({ q, per_page: 1 });
        return data.total_count;
      }
      const { data } = await octokit.search.issuesAndPullRequests({ q, per_page: 1 });
      return data.total_count;
    }, { maxAttempts: 3 });
  } catch {
    // Unavailable after retries, or a non-rate-limit error → don't fail the
    // whole ingest, degrade this one signal to 0.
    return 0;
  }
}

const round = (x: number, dp: number): number => {
  const m = 10 ** dp;
  return Math.round(x * m) / m;
};
