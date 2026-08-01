# The card API

The hub of the talent trifecta. `TalentProfile` is the shared object named in
`ECOSYSTEM.md`: its scores come from darktalent, its artifacts from
company.university, and it is transacted by skill.supply.

This endpoint is the wire the trifecta was missing. Before it, every flow in all
three products was stateless, so nothing compounded.

## Rules enforced here, not trusted to callers

1. **No display consent, no pool entry.** `consent.display` must be literally
   `true` or the request is rejected. A card only becomes sellable supply when
   the person said yes to being shown.
2. **Players never pay and are never sold to.** Nothing in this path takes money.
3. **Revocation is as easy as joining.** One DELETE, and the card is hidden and
   every granted consent is set to REVOKED.
4. **Raw IPs are never stored.** They are salted and hashed for the audit trail.

## POST /api/card

Creates or refreshes a consented card. Idempotent on handle: opting in twice
refreshes the score rather than duplicating the person.

```json
{
  "handle": "ada-example",
  "displayName": "Ada Example",
  "tagline": "self-taught systems builder, Lagos",
  "location": "Lagos",
  "origin": "skill.supply",
  "consent": { "display": true, "contact": false }
}
```

`signals` is optional. When omitted, darktalent ingests the person's public
GitHub itself and scores it with the real engine. Pass `signals` only if the
caller already holds a normalized `TalentSignals` bundle.

Responses:

| Status | Meaning |
| --- | --- |
| 201 | New card created |
| 200 | Existing card refreshed |
| 400 | Invalid payload, including missing display consent |
| 422 | Could not read that public GitHub |
| 503 | No database configured, opt-ins are not being accepted |

## GET /api/card

Health check. Tells a caller whether opt-ins are being accepted right now, so
skill.supply can hide the button rather than show one that fails.

```json
{ "accepting": false, "note": "No DATABASE_URL configured, ..." }
```

## DELETE /api/card?handle=ada-example

Revokes all granted consents and sets the profile to HIDDEN.

## What skill.supply needs to add (Phase 2)

One button at the end of the free report. Suggested copy: "Add me to the pool".
Free forever, and say so next to it.

```ts
const res = await fetch("https://darktalent.tech/api/card", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    handle: githubHandle,
    displayName: name,
    tagline: oneLiner,
    origin: "skill.supply",
    consent: { display: true, contact: wantsContact },
  }),
});
```

Gate the button on `GET /api/card` returning `accepting: true`.

## To actually accept opt-ins

The endpoint returns 503 until a database is configured. To turn it on:

1. Create a Neon project and set `DATABASE_URL` (pooled) and `DIRECT_URL`
   (direct) in the environment, locally and on Vercel.
2. Run the migration:

```bash
npx prisma migrate dev --name card-artifacts-placements
```

3. Confirm with `GET /api/card`, which should report `accepting: true`.

Until then `/hiring` falls back to the labeled demo pool and says so on every
artifact it produces.

## What the schema now carries

Already existed and is now used: `TalentProfile`, `SignalSnapshot`, `Score`,
`ConsentRecord`, `AuditLog`.

Added, because these are what let proof compound:

- **`Artifact`** is proof emitted by the academy and written back onto the card.
  A candidate who is not placed this month becomes measurably more placeable
  next month. Unverified artifacts never lift a score.
- **`Placement`** is the labeled outcome, and it freezes what the engine
  believed at introduction (`predictedFit`, `predictedOverall`, `modelVersion`)
  so that prediction can be compared against reality. This is the only thing
  that can ever validate a score, and it is the asset nobody else holds:
  recruiters have outcomes without a signal engine, code hosts have signals
  without outcomes. Here both sit on one row.
