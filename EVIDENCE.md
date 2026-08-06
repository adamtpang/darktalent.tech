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

## 2026-08-06: the card is live in production, not just tested locally

Everything below happened against the real production site and a real Neon
database, not a local server.

| Fact | Evidence |
| --- | --- |
| Production was 3 commits stale before this session | `list_deployments` showed the live deployment built from commit `41c769a`, one commit before "Wire the card" (`1e9759f`). Confirmed via Vercel MCP, not guessed. |
| Redeployed via `vercel deploy --prod` | 2 production deploys this session, both `READY` |
| Created a Neon database for darktalent.tech | project `green-forest-70890620`, following the same one-database-per-product pattern as beware.dog, sprite.email, summon.guide, everybot.fun |
| `DATABASE_URL` and `DIRECT_URL` set on Vercel production | `vercel env ls production` confirms both, type Sensitive |
| Migration applied | `npx prisma migrate dev` created and applied `20260806044830_init_card_artifacts_placements`; `get_database_tables` confirms 20 tables including `TalentProfile`, `Artifact`, `Placement` |
| `GET /api/card` on production | `{"accepting": true, "note": "Opt-ins are being accepted."}` |
| A real opt-in against production | `POST /api/card` for `torvalds`: `201 {"ok":true,"handle":"torvalds","overall":79.5,"created":true}`. Real GitHub ingestion, real score from the actual engine, not a fixture. |
| Found and fixed a second bug while verifying | `/hiring` was statically prerendered, so its initial content was frozen from build time, before any opt-in existed. Added `force-dynamic`. Confirmed live: the pool line changed from the composite fallback to `"consented cards from the darktalent pool"` and `torvalds` appeared in the rendered page. |
| Pool grows on a second real opt-in | `sindresorhus`: `201`, overall `90.7`. `/hiring` then reported `"2 consented cards"`. |

**This is the first real, non-zero number in this repo's history.** Two real,
consented people (`torvalds`, `sindresorhus`) are in the live pool, scored by
the real engine, visible on the live `/hiring` page, right now.

## 2026-08-01, later: Phase 1 of TRIFECTA.md, the card is wired

The critical fault F1 (no repo persists a person) is now fixed in code, and
gated on one environment variable rather than on more building.

| Change | Before | After | Evidence |
| --- | --- | --- | --- |
| The card exists | `src/lib/db.ts` existed and zero app files imported it | `POST /api/card` creates a consented TalentProfile with an immutable SignalSnapshot, a full Score, and ConsentRecord rows | build lists `/api/card` as a dynamic route |
| Consent is enforced in code | n/a | opt-in without `consent.display: true` is rejected 400 | `curl` returned `consent.display: Invalid literal value, expected true` |
| Revocation exists | n/a | `DELETE /api/card?handle=` revokes every granted consent and sets the profile HIDDEN | route implemented, untested against a live DB |
| The pool can read real people | hardcoded composites only | `loadPool()` prefers consented cards, falls back to composites, and reports which it used | `/hiring` reported "Local seed pool of fictional composites" and did NOT claim consent |
| Proof can compound | no artifact or outcome model | `Artifact` (academy write-back) and `Placement` (labeled outcome, freezes predictedFit and modelVersion) added to the schema | `prisma generate` succeeded, `tsc --noEmit` clean |
| Nothing broke without a DB | n/a | `/`, `/scout`, `/hiring` all 200, 17/17 tests pass, no server errors | dev server logs clean |

**Still zero.** No person has opted in, because opt-ins are rejected until a
database is configured. `GET /api/card` currently returns
`{"accepting": false}` and says why. That is the honest state.

**What turns it on:** set `DATABASE_URL` and `DIRECT_URL` (Neon) locally and on
Vercel, then `npx prisma migrate dev --name card-artifacts-placements`. Local
`prisma validate` currently fails only on the missing `DIRECT_URL` env var, not
on the schema, which generated cleanly. See `CARD_API.md`.

**Next, and it is not in this repo:** skill.supply adds one "add me to the pool"
button that POSTs to this endpoint. Phase 2 of `Aether/TRIFECTA.md`. The
integration snippet is written out in `CARD_API.md` so it is a copy-paste job.

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
