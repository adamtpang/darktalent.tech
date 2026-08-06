# OFFER, darktalent.tech

Filled 2026-08-01. This is the demand side of the skill.supply pairing
(see `skill.supply/LAUNCH.md` and `ECOSYSTEM.md`).

## One-liner

For **a founder or hiring manager with one open technical seat and no time to
read 500 applications**, who struggle with **a pile of resumes that all look the
same and tell them nothing about whether the person can actually build**,
**darktalent.tech** is a **paid scouting service** that **returns five scored
candidates matched to that specific seat, with the evidence behind every
number**. Unlike **a contingency recruiter who sends whoever is available and
charges nothing until a hire**, we **score demonstrated public output, treat
pedigree as a discount rather than a credit, and show our work on every
candidate so the ranking is auditable**.

## The first sellable unit: The Shortlist

One job description in, five scored candidates out.

| Field | Value |
| --- | --- |
| What | Five candidates matched to one JD, ranked by fit for that seat, not raw quality |
| Delivered | Five business days |
| Format | The shortlist artifact: fit score, six stat card, dark signal, and 3 evidence lines per candidate |
| Price | **$500 per shortlist** |
| Guarantee | If none of the five earn a first interview, full refund |
| Credit | The $500 credits in full against the placement fee if they hire from it |
| Placement fee | 20% of first year salary, standard band per ECOSYSTEM.md, 12 month replacement guarantee |

Why $500 and not free or $5,000:

- It is a credit card decision, so it clears without procurement.
- It filters the unserious. Per the Moneyball read, open contingency is an
  auction decided by whoever has the most recruiter hours, and that is the one
  contest we cannot win. Charging for the scouting means we only work reqs a
  company has actually committed to.
- It pays for the work whether or not they hire, which is what makes the
  pipeline survivable while the pool is small.
- Crediting it against the placement fee makes the upgrade the obvious next
  step rather than a second negotiation.

## Status: LIVE, approved 2026-08-06

Adam resolved the two-price conflict: The Shortlist is the real offer. The
$59 "founding lifetime license" (`prod_Us03avTjcH8dJP`, predated this offer,
matched no feature actually built on the site) is archived, product and
payment link both `active: false`.

- Product: `prod_V1NgtTXa3Avu6M`
- Price: `price_1U1KujFL7C10dNyG5KtIIRLb`, nickname
  `darktalent.tech The Shortlist - $500`, `keep: true`
- Payment link: https://buy.stripe.com/dRmaEX9340OhcME6KtaMU1F, verified
  rendering ("darktalent.tech The Shortlist", $500.00)
- Landing (`src/app/page.tsx`) points its CTA at this link, replacing the
  retired $59 button. Not yet deployed; deploys are Adam's for this project
  (CLI-only, `vercel deploy --prod`).

## Grand-slam checks

- [x] Dream outcome is clear and valuable: the seat gets filled by someone who
      can actually build, without reading 500 applications.
- [x] Perceived likelihood of achievement is high: every candidate arrives with
      auditable evidence, and the ranking method is shown rather than asserted.
- [x] Time delay is short: five business days to the artifact.
- [x] Effort and sacrifice are low: paste one JD, that is the whole intake.
- [x] Risk is reversed: full refund if none of the five earn a first interview,
      and the fee credits against the placement fee.

## Who never pays

Seekers. No tuition, no income share, ever. Per `ECOSYSTEM.md`, the network is
supply and only receives value. Revenue comes from clubs.
