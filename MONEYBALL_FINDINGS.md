# Moneyball findings so far (as of 2026-09-27)

The question, borrowed from Moneyball: do darktalent's stats predict an
outcome, or are they batting average? Baseball tested stats against wins.
With no placements yet, we test against a public outcome instead: **becoming
a core maintainer of a major open-source project.**

Companion files: `MONEYBALL.md` (the study), `PLAYER_METRICS.md`,
`TALENT_SCOUTS.md`. Raw data and scripts: `data/backtest/`, `scripts/`.

## Method

1. Take the top 5 human contributors of major repos.
2. Keep only **late joiners**: became core more than 120 days after the repo
   was created. Founders are excluded, since nobody had to discover them.
3. Score each one **as of one year before their first commit** to that repo
   (`asOf` mode in `src/lib/integrations/github.ts`).
4. Compare against a control group scored the same way.
5. Measure with AUC: the chance a random future maintainer outscores a
   random control. 0.50 is a coin flip, 1.00 is perfect.

Stars, forks, and followers are zeroed for everyone in this mode, because
GitHub only reports today's totals and using them would leak the future.

## Backtest 1: the engine's own score (10 repos)

29 late joiners vs 59 same-repo controls (contributed to the same repo in
the same year, 5 to 60 commits, never became core).

| Signal | Joiners (median) | Controls (median) | AUC |
| --- | --- | --- | --- |
| Own original repos | 13 | 4 | **0.63** |
| Trajectory | 57.2 | 58.3 | 0.56 |
| Overall score | 42.4 | 34.2 | 0.55 |
| Technical | 36.2 | 32.2 | 0.53 |
| Commits, prior 12 months | 77 | 61 | 0.50 |
| Merged PRs | 9 | 8 | 0.48 |

**Finding:** the overall score barely beats a coin flip. The one weak
signal is building your own things (about 3x more original repos).

## Backtest 2: contributions to other people's repos (10 repos)

Same people. Hypothesis: future maintainers were already helping on other
projects before anyone promoted them.

| Signal | Joiners | Controls | AUC |
| --- | --- | --- | --- |
| Merged PRs to others' repos, all time | 9 | 8 | 0.51 |
| Same, prior 12 months | 1 | 3 | 0.47 |
| Distinct outside repos | 3 | 4 | 0.50 |
| Distinct outside owners | 2 | 2 | 0.50 |

**Finding:** hypothesis rejected. Outside contributions do not separate
them either.

## What the two results mean together

The controls also contributed to elite repos like tokio and next.js, so
both groups were already strong, active developers. Public GitHub data
cannot tell them apart. Who becomes core likely depends on things GitHub
does not show: being hired by the company behind the project, persistence,
time zone, the lead maintainer's trust.

**GitHub looks good at separating builders from everyone else, and bad at
separating good from great.** That fits the Moneyball study: on-base
percentage separated run producers from non-producers. It did not pick
the MVP.

## In progress

- **30-repo expansion:** 90 late joiners across 30 repos (added
  rust-analyzer, tauri, biome, bun, vite, astro, react-router, supabase,
  pydantic, langchain, helix, neovim, prometheus, duckdb, arrow-rs,
  llama.cpp, vllm, vue, nushell, pnpm). Both backtests are rerunning on it.
  This decides whether the original-repos signal (0.63) holds or fades.
- **Random-developer control:** 90 random GitHub users matched on account
  age (3+ public repos, seeded draw). This is the test that matters for the
  business: can the engine find strong builders in a crowd? Not yet scored.

## Data quality notes

- Dropped prisma and caddy: rewritten git history gives false first-commit
  dates (prisma showed 2026, caddy made its founder look like a late joiner).
- Dropped bots whose names lack "bot" (bors, robobun).
- Some commit counts are inflated by mirror or automated repos (Timer
  41,979 and sgugger 49,015 in a year). Not yet filtered; this is a real
  engine bug regardless of the backtest.
- GitHub commit search mostly indexes default branches, so older activity
  is undercounted. 5 of 29 joiners and 9 of 59 controls showed no activity
  at all a year before.
- zkochan (pnpm) is tagged late joiner at day 160 but is effectively the lead.

## Honest bottom line so far

Two backtests, two coin flips on the "good vs great" question. Nothing here
justifies reweighting the engine yet. The next result that matters is the
random-developer test. Until then, darktalent's score should keep being
presented as "a shape, not a verdict."
