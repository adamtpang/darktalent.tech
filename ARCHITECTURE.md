# darktalent.tech — Architecture

**Moneyball for tech talent.** Discover, score, and connect undervalued builders —
the self-taught, the bootcamp grads, the career-changers, the global talent
outside elite institutions — that legacy hiring systems overlook. Inspired by
_The Network State_: meritocratic, signal-based, pedigree-blind.

> The "1729" thesis: Ramanujan had no credentials and the notebook of a century.
> Somewhere there's a developer with a GitHub like a supernova and a résumé that
> would never clear an ATS filter. This platform exists to find that person.

---

## 1. System overview

```
                    ┌─────────────────────────────────────────────┐
                    │              Next.js 15 (App Router)         │
                    │                                              │
  Recruiter  ─────▶ │  /(marketing)   /dashboard   /p/[handle]    │
  Candidate  ─────▶ │  Server Components + Server Actions          │
                    │  Auth.js v5 (GitHub OAuth, wallet-ready)     │
                    └───────────┬───────────────────┬─────────────┘
                                │                    │
                   ┌────────────▼─────────┐  ┌───────▼──────────────┐
                   │   Scoring engine     │  │   Ingestion workers   │
                   │  (pure TS, in-proc)  │  │  GitHub · GitLab ·    │
                   │  TalentSignals ─▶    │  │  SO · X · LinkedIn ·  │
                   │  DarkTalentScore     │  │  on-chain (cron/queue)│
                   └────────────┬─────────┘  └───────┬──────────────┘
                                │                    │
                          ┌─────▼────────────────────▼─────┐
                          │   Prisma  ─▶  Neon Postgres     │
                          │  profiles · snapshots · scores  │
                          │  consent · audit · watchlists   │
                          └─────────────────────────────────┘

  Future scale-out: heavy ML / embeddings move to a FastAPI service behind the
  same TalentSignals interface; the in-proc engine stays as the fast path.
```

## 2. Data flow

1. **Ingest** — `src/lib/integrations/*` pull *public* data per source and
   normalize it into a single source-agnostic **`TalentSignals`** object.
2. **Snapshot** — each ingest is stored immutably as a `SignalSnapshot`
   (provenance + the raw material for trajectory-over-time analysis).
3. **Score** — `scoreTalent(signals)` (pure, deterministic) produces a
   **`DarkTalentScore`**: an overall 0–100 plus five explainable pillars.
4. **Persist** — the full breakdown is saved as a `Score`; the latest overall is
   denormalized onto `TalentProfile` for fast ranking/search.
5. **Serve** — dashboard (search, filters, spotlights) and profile pages render
   from the denormalized fields + latest `Score`.

The four stages are decoupled by the `TalentSignals` / `DarkTalentScore`
contracts, so any one (a new source, a smarter scorer, an ML service) can be
swapped without touching the others.

## 3. The scoring model

`overall` is a weighted blend of five pillars. Each pillar returns a 0–100
sub-score, a **confidence** (how much data backed it), and human-readable
**factors** — because we score *people*, every number must be explainable
(GDPR "right to explanation").

| Pillar | Weight | What it measures |
|---|---:|---|
| **Technical Ability** | 0.30 | Originality, impact (stars), commit volume, collaboration, engineering discipline (tests/CI/docs) |
| **Growth Trajectory** | 0.20 | Output acceleration YoY, skill breadth, sustained contribution |
| **Dark-Talent Signal** | 0.25 | **The arbitrage:** high demonstrated output relative to low pedigree |
| **Merit Influence** | 0.10 | Is the work *depended on* (forks) and *helpful* (reviews) — not just followed |
| **Network-State Alignment** | 0.15 | Optional/consent-based: open-source, on-chain, remote-async, indie building |

**The Dark-Talent Signal** is the heart of the model:

```
outputIndex   = log-scaled blend of stars · commits · repos · merged PRs   (0..100)
pedigreeIndex = 10 + 35·eliteEdu + 35·bigTech + small·credentialedYears     (0..100)

gap   = clamp01((outputIndex − pedigreeIndex) / 100)      // undervaluation
score = 0.6·outputIndex + 40·gap + nonTraditionalBonus
```

Pedigree is treated as a **discount, not a credit**: two builders with identical
output get *different* dark-signal scores, and the one without the elite logos
scores higher — because they are the more undervalued bet. Absolute skill still
shows up in `Technical Ability`; the *arbitrage* lives here.

Design choices that matter:
- **Log-saturating scales** (`normalize.ts`) so the 1000th star matters less than
  the 10th, and superstars don't flatten everyone else.
- **Confidence-weighted, self-normalizing weights**: a pillar with no data (e.g.
  no consented alignment signals) is dropped and its weight redistributed — a
  missing optional signal never silently caps a score.
- **Deterministic & pure**: `scoreTalent` takes an injectable clock and no I/O,
  so it's unit-tested and reproducible (`engine.test.ts`).

> Roadmap for scoring: rule-based v1 (here) → + embeddings for semantic
> repo/skill similarity → + a calibrated success-prediction model trained on
> outcomes. Each is additive behind the same interface.

## 4. Privacy & consent (first-class)

- **Public-only ingestion.** Discovered profiles are read via public APIs; OAuth
  tokens are stored *only* for candidates who connect their own accounts.
- **`ConsentRecord`** gates ingestion, directory display, contact, and analytics
  independently — each revocable.
- **`AuditLog`** records who viewed/exported/rescored/erased what.
- **Right to erasure** via `ProfileStatus.HIDDEN` + hard-delete cascade.
- IPs are hashed, never stored raw.

## 5. Folder layout

```
darktalent.tech/
├── prisma/
│   ├── schema.prisma          # data model (auth, talent, consent, audit)
│   └── seed.ts                # signals → score → DB demo
├── src/
│   ├── app/                   # Next.js routes (UI — next step)
│   └── lib/
│       ├── db.ts              # Prisma client singleton
│       ├── env.ts             # zod-validated environment
│       ├── scoring/           # ⭐ the Moneyball core
│       │   ├── types.ts       #   TalentSignals + DarkTalentScore contracts
│       │   ├── weights.ts     #   default weights + model version
│       │   ├── normalize.ts   #   log scales, growth curve, clamps
│       │   ├── engine.ts      #   scoreTalent() — the five pillars
│       │   ├── fixtures.ts    #   dark-talent vs credentialed archetypes
│       │   ├── demo.ts        #   `npm run score:demo`
│       │   └── engine.test.ts #   thesis locked in by tests
│       └── integrations/
│           └── github.ts      # public GitHub → TalentSignals
└── ARCHITECTURE.md (this file) · README.md
```

## 6. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) + TS | Server Components + Server Actions |
| DB / ORM | Neon Postgres + Prisma | Serverless Postgres; pooled + direct URLs |
| Auth | Auth.js v5 | GitHub OAuth first; WalletConnect-ready |
| Styling | Tailwind v4 | Linear/Arc-inspired dark, minimalist |
| Charts | Recharts | Skill radar, trajectory, contribution graph |
| Scoring | Pure TypeScript (this repo) | FastAPI/ML as a later scale-out |
| Hosting | Vercel + Neon | Edge-friendly; cron for ingestion |

## 7. Roadmap

- **Now:** data model ✅ · scoring engine ✅ · GitHub ingestion ✅
- **Next:** Auth.js wiring · `/score` + `/ingest` API routes · profile page +
  dashboard · more sources (GitLab, Stack Overflow, X).
- **Then:** embeddings for semantic skill/repo matching (Vercel AI SDK) ·
  calibrated success-prediction model · saved searches + alerts.
- **Later:** on-chain verifiable credentials (claim your score as an attestation)
  · advanced AI matching (role ↔ talent) · community marketplace (bounties,
  groups, DAOs) per _The Network State_.
