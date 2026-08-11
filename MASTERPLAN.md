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
ranked shortlist against that pool. `/board` (2026-08-10) makes every
scored profile, claimed or not, publicly rankable without waiting on
consent, since ranking reads only public signal; consent still gates
selling and contact.

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
- **The PAID, contactable pool is still thin.** 2 real `CLAIMED` cards, 19
  real `DISCOVERED` profiles. Decided 2026-08-10: display no longer needs
  consent (see the board, below), so the growth bottleneck that used to
  require Adam sending an invite per person is gone. What is still thin,
  because it still requires the person's own say-so, is the pool `/hiring`
  can actually sell into. The $500 product is live and correctly priced;
  that inventory is not yet proven at real scale.
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
- Not a data broker. Ranking is permissionless (public GitHub signal only,
  the same surface any recruiter can already query), but selling and
  contact stay gated on the person's own say-so; the `DISCOVERED` vs
  `CLAIMED` split exists specifically so a real person is never sold or
  contacted without consenting, even though being ranked never required it.
- Not, yet, a capital-allocation or investor-matching platform, even
  though the same mechanism (proof over pedigree) generalizes there.
  Explicitly out of scope until the two-sided loop above has closed once,
  for real, with one real placement.

## 📍 WHERE THINGS STAND (2026-08-10)

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
- **2026-08-10: darktalent named explicitly as the NS merit-and-signal
  identity layer**, LinkedIn's actual failure mode being that everything on
  it is self-reported and unverifiable. Built and verified live against
  real production data (build + local run against the real Neon DB, not a
  mock): `/board`, a public leaderboard, all 21 scored profiles ranked, no
  consent required to appear, and `/scout?handle=` prefill so a person who
  recognizes their own handle lands straight on their own real audit,
  claim button already showing. Committed to `master` this session; not
  yet deployed, production still runs the pre-board build until Adam runs
  `vercel deploy --prod`. This is the fix for the founder-bottleneck problem: growing the
  visible board no longer requires Adam sending one invite at a time.
  Cryptographic proof-of-learn credentials, company.university signing an
  `Artifact` so it is independently verifiable rather than a trust-me
  database boolean, are the named next layer, explicitly not started,
  because company.university, the thing that would sign them, does not
  exist yet.

## 📡 REALITY CHECK

Everything built across these sessions (the discovery pipeline, the claim
button, the invite drafts, the repos.yaml link, and now the public board)
is directly the discover to score to claim to sell loop above, exercised
end to end with real people. No drift, the board is a deliberate,
discussed pivot, not scope creep: darktalent is now named explicitly as
the NS merit-and-signal identity layer, and permissionless ranking is
required for that to be true. What is still real and unsolved: 0 real
consented claims, 0 real sent outreach, 0 placements. The board removes
the founder-bottleneck excuse for that, it does not yet fix it, someone
still has to actually find their handle and click claim, or Adam still
has to send the one drafted invite that exists. The next move is supply
and proof, not more infrastructure.

**Draft, not yet confirmed.** Built from `ECOSYSTEM.md`, `TRIFECTA.md`,
`OFFER.md`, and this session's verified work, not from a fresh interview.
Correct anything wrong before treating this as settled.

---

Next natural handoff: `/north-star` to put real numbers on the ladder from
here to a first proven placement.
