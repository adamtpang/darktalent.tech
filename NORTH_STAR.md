# North star, the platonic ideal version of darktalent.tech

One sentence: when it's perfect, darktalent.tech is Network School's
permissionless, publicly rankable merit board, technical talent priced by
demonstrated public output instead of pedigree, anyone can find and claim
their own card with no invitation needed, credentials are cryptographically
verified rather than self-reported, a company pays for a shortlist and hires
from it, and the score has been checked against a real placement outcome and
held up.

## The offer

- Who it's for: a founder or hiring manager with one open technical seat and
  no time to read 500 applications, plus, as the board grows, any builder who
  wants to be found on merit without applying anywhere
- What they get: five candidates scored against that specific seat, evidence
  behind every number, full refund if none earn a first interview
- What it costs: $500 flat per shortlist, live Stripe price
  `price_1U1KujFL7C10dNyG5KtIIRLb`, payment link
  buy.stripe.com/dRmaEX9340OhcME6KtaMU1F, credited in full against the
  placement fee if they hire from it. Being ranked and found costs nothing,
  ever, for the builder.

## What this is NOT (scope guard)

- Not a general ATS or recruiter CRM. The edge is the scoring model, not
  pipeline management.
- Not a jobs board. It scores one person against a named seat, it does not
  post listings.
- Not a MOOC or open-enrollment training program.
- Not a data broker. Ranking is permissionless (public GitHub signal only,
  the same surface a recruiter can already query), but selling a person into
  a paid, contactable shortlist still requires their own consent. Decided
  2026-08-10: this split, not "nothing without consent," is the actual
  privacy line.
- Not, yet, a capital-allocation or investor-matching platform, even though
  the same mechanism generalizes there. Out of scope until the loop below
  closes once, for real, with one real placement.

## Progress ladder (fact-based, not vibes)

- [x] 0. The scoring engine turns real public signal into a 5-pillar,
      confidence-weighted score, deterministic and explainable
- [x] 1. The app runs live in production against a real database, not a demo
- [x] 2. A priced, Stripe-verified offer is live on the site
- [x] 3. The discovery pipeline finds real candidates from public GitHub
      signal and persists them as `DISCOVERED`
- [ ] 4. The public leaderboard is live in production: every scored profile
      rankable with no consent needed to appear, and a working self-claim
      path from a recognized handle
- [ ] 5. A real stranger, not Adam testing the flow, claims their own card,
      whether by finding themselves on the board or by outreach
- [ ] 6. A real company pays for a shortlist
- [ ] 7. A real placement happens and is logged (`Placement` row, outcome
      `HIRED`)
- [ ] 8. The score is checked against that real outcome, predicted fit
      against what actually happened

**Progress: 4/9 (44%)**

Verification notes (2026-08-10): every rung re-checked this run, not carried
over from memory.
- Rung 0-3: `git log` on `darktalent.tech` shows the scoring engine, the
  production deploy, the discovery pipeline, and the CORS-hardened
  `/api/card` opt-in endpoint all built and committed.
- Rung 1 live-checked: `GET https://darktalent.tech/api/card` returned
  `{"accepting":true,"note":"Opt-ins are being accepted."}` this run.
- Rung 2 live-checked: fetched `https://darktalent.tech` this run, confirmed
  the real "Buy a shortlist, $500 →" CTA linking to the live Stripe payment
  link above.
- Rung 3 live-checked: direct SQL against Neon project
  `green-forest-70890620` this run. `TalentProfile` status counts:
  `DISCOVERED` 19, `CLAIMED` 2, `HIDDEN` 1.
- Rung 4 built and verified this run, but NOT counted done: `/board` and the
  `/scout?handle=` self-claim prefill were built, `tsc --noEmit` passed
  clean, and the full loop was run against the real production database
  (temporary local `DATABASE_URL`, deleted after) confirming all 21 real
  profiles render, ranked, with a working "is this you" link into a live
  audit for an unclaimed handle. Committed to `master` this session. Held
  at `[ ]` because it is not yet deployed, `vercel deploy --prod` is
  Adam's, and this skill only checks a rung on evidence the change is live.
- Rung 5 NOT done: both `CLAIMED` rows (`torvalds`, `sindresorhus`) were
  created 2026-08-06, the same day the database went live, both
  `origin: "darktalent.tech"`, these are test claims exercising the flow,
  not a real person's own opt-in. Zero real consented claims exist. One
  invite is fully drafted, addressed to `kubkon`, and has not been sent;
  sending it is Adam's own action, the agent drafts and never sends.
- Rung 6 and 7 NOT done: `SELECT COUNT(*) FROM "Placement"` returned 0 this
  run. $0 real stranger revenue.
- Rung 8 NOT done: blocked entirely on rung 7.

## Next milestone

Rung 4: Adam deploys (`vercel deploy --prod`). Once `/board` is live, rung 5
no longer needs to wait on outreach at all, a real stranger can find their
own handle and self-claim without anyone sending them anything.
