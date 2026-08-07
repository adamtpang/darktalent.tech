import { Octokit } from "@octokit/rest";
import { withBackoff } from "@/lib/integrations/backoff";

/**
 * GitHub discovery: the "mobile telescope."
 *
 * Balaji Srinivasan's own term for the dark-talent mechanism: mobile phones
 * connecting more of the world to the internet reveal undiscovered ability,
 * concentrated outside the traditional Silicon-Valley-adjacent pipeline. This
 * module operationalizes that as a set of seed (language, location) searches
 * over GitHub's public user index.
 *
 * This is a HYPOTHESIS about where to look, not a claim about who is talented.
 * The actual talent judgment happens downstream in scoreTalent(), which reads
 * real output signals, not location or language alone. Location here only
 * decides where the net gets cast; it never decides who clears the bar.
 *
 * Privacy posture: reads GitHub's public search index only, the same surface
 * every recruiting tool (LinkedIn Recruiter, Gem, SeekOut) already queries.
 * No private data, no scraping outside GitHub's own API.
 */

export interface SearchSeed {
  language?: string;
  location?: string;
  /** Minimum public repos, a cheap floor against empty/inactive accounts. */
  minRepos?: number;
}

/**
 * Starting hypothesis for where the market under-indexes. Deliberately not
 * narrow: a handful of languages crossed with regions Balaji names directly
 * (Global South, Eastern Europe, former Soviet states) plus a few more with
 * large, active developer populations that are still thin in most Western
 * recruiting pipelines. Tune this list; it is a hypothesis, not a policy.
 */
export const DEFAULT_SEEDS: SearchSeed[] = [
  { language: "TypeScript", location: "Nigeria", minRepos: 5 },
  { language: "Go", location: "Kenya", minRepos: 5 },
  { language: "Rust", location: "Ukraine", minRepos: 5 },
  { language: "Python", location: "Vietnam", minRepos: 5 },
  { language: "TypeScript", location: "Indonesia", minRepos: 5 },
  { language: "Go", location: "Philippines", minRepos: 5 },
  { language: "Rust", location: "Poland", minRepos: 5 },
  { language: "Python", location: "Bangladesh", minRepos: 5 },
  { language: "TypeScript", location: "Pakistan", minRepos: 5 },
  { language: "Go", location: "Egypt", minRepos: 5 },
  { language: "Rust", location: "Brazil", minRepos: 5 },
  { language: "Python", location: "Argentina", minRepos: 5 },
  { language: "Java", location: "Ghana", minRepos: 5 },
  { language: "PHP", location: "South Africa", minRepos: 5 },
  { language: "Kotlin", location: "Sri Lanka", minRepos: 5 },
  { language: "C++", location: "Nepal", minRepos: 5 },
  { language: "TypeScript", location: "Colombia", minRepos: 5 },
  { language: "Go", location: "Peru", minRepos: 5 },
  { language: "Rust", location: "Romania", minRepos: 5 },
  { language: "Python", location: "Serbia", minRepos: 5 },
  { language: "JavaScript", location: "Belarus", minRepos: 5 },
  { language: "Java", location: "Kazakhstan", minRepos: 5 },
  { language: "TypeScript", location: "Uzbekistan", minRepos: 5 },
  { language: "Go", location: "Turkey", minRepos: 5 },
  { language: "Python", location: "Morocco", minRepos: 5 },
  { language: "PHP", location: "Tunisia", minRepos: 5 },
  { language: "Swift", location: "Ethiopia", minRepos: 5 },
  { language: "Ruby", location: "Mexico", minRepos: 5 },
];

export interface CandidateHandle {
  handle: string;
  seed: SearchSeed;
}

function buildQuery(seed: SearchSeed): string {
  const parts = ["type:user"];
  if (seed.language) parts.push(`language:${seed.language}`);
  if (seed.location) parts.push(`location:"${seed.location}"`);
  parts.push(`repos:>=${seed.minRepos ?? 5}`);
  return parts.join(" ");
}

/**
 * Run one seed search. Sorted by repositories, not followers: followers
 * biases toward the already-famous, which is the opposite of the point.
 * One GitHub Search API call per seed, cheap against the 30/min budget.
 */
export async function searchSeed(
  seed: SearchSeed,
  opts: { token?: string; perSeed?: number } = {},
): Promise<CandidateHandle[]> {
  const octokit = new Octokit({ auth: opts.token ?? process.env.GITHUB_TOKEN });
  const perSeed = opts.perSeed ?? 8;

  const { data } = await withBackoff(
    () =>
      octokit.search.users({
        q: buildQuery(seed),
        sort: "repositories",
        order: "desc",
        per_page: perSeed,
      }),
    {
      maxAttempts: 4,
      onRetry: (attempt, delayMs) =>
        console.warn(
          `    rate limited on ${seed.language}/${seed.location}, retry ${attempt} in ${(delayMs / 1000).toFixed(1)}s`,
        ),
    },
  );

  return data.items.map((u) => ({ handle: u.login, seed }));
}

/**
 * Run every seed, dedupe by handle (first seed wins), cap the total. This is
 * the only place seeds fan out, so tuning DEFAULT_SEEDS or maxCandidates is
 * the whole knob for how wide the net is cast.
 */
export async function discoverCandidateHandles(
  seeds: SearchSeed[] = DEFAULT_SEEDS,
  opts: { token?: string; perSeed?: number; maxCandidates?: number } = {},
): Promise<CandidateHandle[]> {
  const maxCandidates = opts.maxCandidates ?? 24;
  const seen = new Set<string>();
  const out: CandidateHandle[] = [];

  for (const seed of seeds) {
    if (out.length >= maxCandidates) break;
    try {
      const found = await searchSeed(seed, opts);
      for (const c of found) {
        if (seen.has(c.handle)) continue;
        seen.add(c.handle);
        out.push(c);
        if (out.length >= maxCandidates) break;
      }
    } catch (e) {
      // One bad seed (a typo'd location, a transient rate limit) shouldn't
      // sink the whole discovery run.
      console.warn(`  seed ${JSON.stringify(seed)} failed: ${(e as Error).message.slice(0, 80)}`);
    }
    // Search API budget is 30/min authenticated; stay well under it.
    await new Promise((r) => setTimeout(r, 2200));
  }

  return out;
}
