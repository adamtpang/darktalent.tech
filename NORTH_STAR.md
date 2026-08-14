# North star: the platonic ideal version of darktalent.tech

One sentence: when it's perfect, darktalent.tech is the permissionless Moneyball merit board for technical talent, where builders are scored by demonstrated public output instead of pedigree, anyone can find and claim their own card, and companies pay for shortlists they actually hire from.

## The offer
- Who it's for: a founder or hiring manager with one open technical seat and no time to read 500 applications, plus any builder who wants to be found on merit without applying anywhere.
- What they get: The Shortlist, 5 scored candidates matched to their job description, evidence behind every number, refund if none earn a first interview. Being ranked and found is free for the builder, always.
- What it costs: $500 flat per shortlist, live Stripe price `price_1U1KujFL7C10dNyG5KtIIRLb` (buy.stripe.com/dRmaEX9340OhcME6KtaMU1F), credited against the placement fee on hire.

## What this is NOT (scope guard)
- Not a general ATS or recruiter CRM; the edge is the scoring model, not pipeline management.
- Not a jobs board; it scores one person against a named seat, it does not post listings.
- Not a data broker; ranking uses public GitHub signal only, but selling a person into a paid contactable shortlist requires their own consent (privacy line decided 2026-08-10).
- Not, yet, an investor-matching or capital-allocation platform; out of scope until one real placement closes.

## Progress ladder (fact-based, not vibes)
- [x] 0. Core loop works: the actual product function runs end to end for a real user
- [x] 1. Discoverable: sitemap, robots, meta description
- [x] 2. Tracked: analytics wired in code AND confirmed live
- [ ] 3. Instrumented: named funnel events beyond raw pageviews
- [x] 4. Payable: real automated checkout, not mailto or invoice-only
- [ ] 5. Converted: at least one verified stranger sale

**Progress: 4/6 (67%)**

Verification notes (2026-08-12): stage 0 checked: the 5-pillar scoring engine, GitHub discovery pipeline, and production app all run live against the real Neon database (21 real profiles as of the 2026-08-10 check; https://darktalent.tech returned 200 this run). Stage 1 checked live: /sitemap.xml and /robots.txt both 200 in production, meta description in `src/app/layout.tsx`. Stage 4 checked live: the real "$500 shortlist" Stripe payment link renders on the production homepage, fetched this run.

Verification notes (2026-08-14): the /board and /scout self-claim deploy mentioned below has now shipped (commit `cc5e41f`), confirmed live: both routes return 200. Stage 2 rechecked in a real browser (not just curl, since the analytics script injects client-side after hydration): `/_vercel/insights/script.js` loads and a `view` event posts, both 200, confirmed via network request log. Stage 3 still unchecked: zero named track events anywhere in `src/`, raw pageviews only. Stage 5 still the real gate: both CLAIMED profiles are same-day test claims, the Placement table held 0 rows at last SQL check, the one drafted invite (to kubkon) was still unsent as of the last check, $0 stranger revenue.

## Next milestone
The REACH unlock (/board, self-claim, no outreach needed) is live. The binding constraint is now CONVERT, not REACH: either (a) send the one drafted invite that's sitting unsent, to kubkon, or (b) drive one real stranger to /board so they self-claim their own card with zero outreach, the exact loop it was built for. Either path produces the first real evidence row Stage 5 needs.
