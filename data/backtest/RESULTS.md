# Backtest 1: can the engine spot future core maintainers? (2026-09-26)

## Setup
- 10 major repos (uv, tokio, ollama, next.js, polars, deno, svelte, bevy,
  transformers, zed). Top 5 human contributors each.
- **Late joiners (29 scored):** became core more than 120 days after the
  repo was created. The "scout could have found them" group.
- **Controls (59):** same repo, first commit within a year of a joiner,
  5 to 60 commits, never became core.
- Everyone scored **as of one year before their first commit** to that repo.
  Stars, forks, and followers zeroed for everyone (no historical values).

## Result

| Metric | Joiner median | Control median | AUC |
| --- | --- | --- | --- |
| original_repos | 13 | 4 | **0.63** |
| trajectory | 57.2 | 58.3 | 0.56 |
| overall score | 42.4 | 34.2 | 0.55 |
| technical | 36.2 | 32.2 | 0.53 |
| darkSignal | 32.5 | 27.7 | 0.53 |
| influence | 12.8 | 11.8 | 0.52 |
| reviews | 2 | 3 | 0.50 |
| commits (12 mo) | 77 | 61 | 0.50 |
| merged PRs | 9 | 8 | 0.48 |

AUC = chance a random future maintainer outscored a random control. 0.5 is
a coin flip.

## What it means
- **The overall score barely beats a coin flip (0.55).** As of today, the
  engine cannot tell a future core maintainer from a peripheral contributor
  a year ahead.
- **One weak signal: building your own things.** Future maintainers had
  about 3x more original repos (13 vs 4). AUC 0.63 is weak but real-looking.
- **Raw activity does not separate them.** Commits, PRs, and reviews are
  basically identical. Volume is not the tell.
- **Visibility gap:** 5/29 joiners and 9/59 controls showed no activity at
  all a year before. GitHub search misses a lot of older work.

## Caveats (why this is not a verdict yet)
- Small sample: 29 vs 59.
- The control group is a hard comparison: they all contributed to elite
  repos too. This asks "who becomes core," not "who is good at all."
- Commit search mostly indexes default branches; old activity undercounts.
- Some commit counts are inflated by mirror or automated repos (Timer
  41,979, sgugger 49,015). Not yet filtered.
- The biggest signals (stars, dependents, followers) were zeroed because
  they cannot be backdated, so the influence pillar was mostly blind.

## Next
1. Filter mirror/automated repos and huge commit counts.
2. Test "contributions to other people's repos" before joining, the
   likely real tell, which the engine barely measures today.
3. Expand to 30+ repos for a sample that can confirm or kill the
   original_repos signal.
4. Reweight the engine only after a signal survives a larger test.
