# EVIDENCE: darktalent.tech

Baseline reset 2026-08-01 while executing prompt 6 of `Aether/UPGRADE_PROMPTS.md`
(darktalent as the demand side of the skill.supply pairing).

## Baseline (as of 2026-08-01)

| Metric | Value | Source | As-of |
| --- | --- | --- | --- |
| Revenue (stranger $) | **0** | Stripe | 2026-08-01 |
| MRR | **0** | Stripe | 2026-08-01 |
| Active customers | **0** | inbox | 2026-08-01 |
| Shortlists delivered | **0** | this repo | 2026-08-01 |
| Shortlist requests received | **0** | inbox | 2026-08-01 |
| Weekly active usage | unknown, Vercel Analytics is wired in code but counts not read this session | analytics | 2026-08-01 |
| Time to first value | about 10 seconds, paste a JD and the shortlist renders | /hiring, measured locally | 2026-08-01 |
| Cost / burn attributable | 0, no paid infra added this session | Finance | 2026-08-01 |
| Top risk | The pool is empty of real candidates. skill.supply persists nothing. | see below | 2026-08-01 |

A zero is data. Every zero above is real, not a placeholder.

## The blocker that decides this product

**skill.supply has no persisted talent pool.** Verified this session by reading
`skill.supply/lib/share.ts`, which states that a report is encoded into a URL
hash payload with no backend involved. Reports live client side in the URL
fragment. There is no seeker table, so there is nothing for darktalent to query.

The pairing described in `skill.supply/LAUNCH.md` (skill.supply builds the free
scored pool, darktalent sells access to it) therefore has a missing middle. The
demand side is now built and works. The supply it is supposed to sell does not
persist yet.

Until that changes, `/hiring` runs against a local seed pool of clearly labeled
fictional composites, and every artifact it produces says so on its face. We do
not claim a skill.supply pool we do not have.

**What changes it:** skill.supply needs an opt-in "add me to the pool" step that
persists a consented seeker record. That is a skill.supply task, not a
darktalent one, and it is the single highest-value unblock for this pairing.

## Verified this session

| Date | Change | Before | After | Evidence |
| --- | --- | --- | --- | --- |
| 2026-08-01 | Landing states the pairing | hero read "Everyone gets a card" | hero reads "The hiring side of skill.supply" and links skill.supply | `curl /` returned both strings |
| 2026-08-01 | Shortlist pipeline built | none | JD in, five ranked candidates out with evidence per candidate | `/hiring` returned 200 with 5 fit blocks and all caveats |
| 2026-08-01 | Pipeline discriminates by seat | n/a | 3 JDs produced 3 different seats: BUILD, INFLUENCE, GRIT | `npx tsx scripts/shortlist-demo.ts` |
| 2026-08-01 | Fit function defect found and fixed | every qualified candidate tied at fit 100, useless for ranking | fit blends bar coverage with strength at the demanded capability, ranks now separate | demo output before and after |
| 2026-08-01 | Right person tops the right list | n/a | Lin Wei (690 reviews, 7.1k followers) ranks 1st for developer relations, Danilo Souza 1st for infrastructure | demo output |
| 2026-08-01 | Fleet ring added | no fleet footer | footer links adam.gives, skill.supply, company.university | `curl /` returned all three |
| 2026-08-01 | fleet.json updated | tier 3, "Moneyball for tech and business" | tier 1, "The hiring side of skill.supply: five scored candidates per job description" | `Aether/fleet.json` |
| 2026-08-01 | Em dashes removed from src | 100+ across 36 files | 0 in `src/`, 6 glyph regressions caught and repaired | `grep -rc` for the character across src/ returns nothing |
| 2026-08-01 | Build and tests | n/a | clean build, 122 pages, 17/17 unit tests pass | `npm run build`, `npm test` |

## Offer receipt

| Field | Value |
| --- | --- |
| Buyer | Founder or hiring manager with one open technical seat |
| Problem | 500 applications, no signal about who can actually build |
| Cure | Five scored candidates matched to that seat, with evidence per candidate |
| Price paid | **none yet.** The Shortlist at $500 is drafted in OFFER.md and awaiting Adam's yes |
| Proof of value | none yet. No shortlist has been sold or delivered to a stranger |
| Date | n/a |

## Fleet-ready checklist

| # | Item | Status |
| --- | --- | --- |
| 1 | OFFER.md filled, no brackets | **YES** |
| 2 | Landing states the offer in the first screen | **YES** for the offer, **NO** for the price, which is unapproved |
| 3 | Exactly ONE labeled Stripe price, active and verified | **NO.** See the conflict below |
| 4 | Vercel Analytics enabled | **PARTIAL.** `<Analytics />` is wired in `layout.tsx` and `@vercel/analytics` is installed. The dashboard toggle is Adam's and was not verified this session |
| 5 | Entry in fleet.json, footer ring on the site | **YES** |
| 6 | Hub card, LinkedIn post, community post | **NO.** Outreach drafted in OUTREACH.md, nothing posted or sent |
| 7 | EVIDENCE.md logs what happened | **YES**, this file |

**Not fleet-ready.** Blocked on items 3 and 6, both of which need Adam.

## Open decision for Adam: two prices, one product

The landing carries an uncommitted `Founding license · $59` button pointing at
`https://buy.stripe.com/6oU00jgvwgNffYQgl3aMU0G`. It was not added by this
session and it points at a different buyer than the one in OFFER.md.

The shared rule is exactly one Stripe price per product. So one of these has to
go:

- **Option A:** keep The Shortlist at $500 (companies pay, matches LAUNCH.md and
  ECOSYSTEM.md), archive the $59 founding license.
- **Option B:** keep the $59 founding license, and rewrite OFFER.md around
  whatever it actually sells.

The $59 button was left in place rather than deleted, because removing another
session's pricing decision is Adam's call. It was also not verified as rendering,
because the Stripe connector is not authorized in this session.
