# MASTERPLAN: darktalent.tech

The platonic ideal. This file should read almost the same whether opened
today or three months from now. If it drifts, the plan changed, not just
the mood of a session.

Shared with two sibling repos (skill.supply, company.university) via
`ECOSYSTEM.md`, the talent trifecta constitution. This file is the
darktalent-local recitation of that shared plan plus what is specific here.

## 🎯 THE THESIS

Build the machine that prices talent by demonstrated output instead of
pedigree, and broker it to companies that pay on placement, so the market
finally prices proof the way it already prices credentials.

## ⚙️ THE MECHANISM

The shared loop, from `ECOSYSTEM.md`:

1. **Discover demand.** Real companies, real open roles.
2. **Scout the player.** darktalent: proof, pedigree gap, potential. Pure,
   deterministic scoring of demonstrated public output; pedigree is a
   discount, never a credit.
3. **Gap analysis + ETA.** skill.supply: how many weeks to be the obvious
   hire for a specific seat.
4. **Academy.** company.university: close the named gap, emit verified
   artifacts.
5. **The artifact writes back to the card.** Proof compounds. A candidate
   not placed this month is measurably more placeable next month.
6. **Broker the deal.** skill.supply: warm intro, placement, fee.

The darktalent-specific piece built this session, step 2 made real:
GitHub discovery (the "mobile telescope," Balaji Srinivasan's own term for
finding undiscovered output as more of the world comes online) → score with
the real engine → persist as `DISCOVERED` (unclaimed, no consent) → the
person claims their own card (`/scout`, one click, real consent) → the
claimed card enters the sellable pool → `/hiring` turns a pasted JD into a
ranked shortlist against that pool.

## 💰 THE MODEL

**Clubs (companies) pay. Players (candidates) never pay, ever.** Standard
band: 15-25% of first-year salary, 20-30% senior/scarce, with a guarantee
period so fit protects the fee.

**Resolved:** the two-price conflict from earlier this session (a stray
$59 "founding license" vs a real $500 offer) is closed. The Shortlist,
$500 flat per JD, is the live product, Stripe-verified, the $59 archived.

**Open, not resolved, said plainly:**

- **skill.supply's own free-report loop now requires the seeker to bring
  their own Anthropic API key.** This is a real friction point sitting
  directly upstream of the opt-in that grows darktalent's sellable pool.
  It was Adam's own considered call (his Claude subscription token cannot
  legally be wired in), but it is an unresolved tension with "free
  forever," not a solved problem.
- **The sellable pool is thin and largely unconsented.** 2 real `CLAIMED`
  cards, 19 real `DISCOVERED` profiles nobody has been told about yet
  beyond one fully drafted (still unsent) invite. The $500 product is live
  and correctly priced; the inventory behind it is not yet proven at any
  real scale.
- **The score is not yet validated against a real outcome.** Zero
  placements exist. Every number the engine produces is a well
  instrumented opinion until one placement runs its course.

## 🧭 THE DISCIPLINE

Standing rules, not to be relitigated each session:

- Demand-first, always. Secure the company before training or sourcing
  the player.
- The candidate never pays. Revenue comes only from clubs.
- Never sell to Network School members. They are supply; they only
  receive value.
- Proof over pedigree, in every ranking and every score.
- No em dashes anywhere: code, copy, docs, model output.
- Honest ETAs. A flattering estimate is a lie that costs someone months.
- Nothing claimed about a person or company unless defensible from the
  input, or clearly labeled an estimate.
- Deploys are Adam's by default; done in-session only on his explicit,
  current-turn instruction.
- Outreach is drafted, never sent, by the agent. Adam sends personally,
  every time, no exceptions carved out in the moment.
- Exactly one labeled Stripe price per product. Reactivate an archived
  price before minting a duplicate.

## 🚫 NOT

- Not a general ATS or recruiter CRM. Apollo and its kin already do that;
  darktalent's edge is the scoring model, not pipeline management.
- Not a jobs board. skill.supply doesn't post listings; it scores one
  person against named targets.
- Not a MOOC or a degree replacement at scale. company.university is
  narrow, demand-first tracks against a named gap, not open enrollment.
- Not a data broker. The `DISCOVERED` vs `CLAIMED` consent split exists
  specifically so a real person is never sold without their own say-so.
- Not, yet, a capital-allocation or investor-matching platform, even
  though the same mechanism (proof over pedigree) generalizes there.
  Explicitly out of scope until the two-sided loop above has closed once,
  for real, with one real placement.

## 📍 WHERE THINGS STAND (2026-08-07)

- Card infrastructure live in production (Neon `green-forest-70890620`).
- 2 `CLAIMED` cards (torvalds, sindresorhus, both test claims), 19
  `DISCOVERED` via the GitHub mobile-telescope pipeline, 0 invited beyond
  one drafted, unsent email to `kubkon`.
- The Shortlist, $500/JD, live and Stripe-verified since 2026-08-06.
- skill.supply's cross-origin opt-in verified working end to end; its own
  free-report core loop is gated on BYOK (see the open tension above).
- $0 real stranger revenue. 0 placements. 0 validated outcomes.
- `repos.yaml` kinship declared with sprite.email: it already has a real,
  consented Gmail send path darktalent's outreach step needs and does not
  have.

## 📡 REALITY CHECK

Everything built this session (the discovery pipeline, the claim button,
the two invite drafts, the repos.yaml link) is directly the discover →
score → claim → sell loop above, exercised end to end for the first time
with real people. No drift. The one thing worth saying plainly: the
session's energy has been on *building the pipe*, and the plan's actual
bottleneck right now is *water in the pipe*, real consented claims, a real
sent invite, one real placement. The next move is supply and proof, not
more infrastructure.

**Draft, not yet confirmed.** Built from `ECOSYSTEM.md`, `TRIFECTA.md`,
`OFFER.md`, and this session's verified work, not from a fresh interview.
Correct anything wrong before treating this as settled.

---

Next natural handoff: `/north-star` to put real numbers on the ladder from
here to a first proven placement.
