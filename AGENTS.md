<!-- BEGIN:claude-codex-sync -->
# Claude/Codex sync

Before making changes, read `CLAUDE.md` in this project if it exists. It is the live handoff from Claude Code and the source of truth for current project progress, design decisions, constraints, and open tasks. Keep future progress updates there so Claude and Codex stay in sync.

If this file contains older project context that conflicts with `CLAUDE.md`, prefer `CLAUDE.md` unless the user says otherwise.
<!-- END:claude-codex-sync -->

<!-- BEGIN:imported-claude-context -->
# Imported Claude context

Copied from `CLAUDE.md` on 2026-07-07 so Codex starts with the same project context Claude Code used. Keep `CLAUDE.md` as the source of truth and refresh this block after meaningful Claude-side progress.

<!-- SOURCE: CLAUDE.md -->

# CLAUDE.md - darktalent.tech

Context for Claude Code, Codex, and humans working in this folder.

## What this is

This handoff was generated on 2026-07-07 so every top-level Codex project under
`C:\Users\adamp\OneDrive\Aether` has both `CLAUDE.md` and `AGENTS.md`.

No richer Claude handoff was found here during the workspace sync. Treat this file
as a starting point, then inspect the actual code and docs before making changes.

## Detected project facts

- Workspace folder: `darktalent.tech`
- Git repository: no
- `package.json`: yes
- Detected stack: Next.js, React, Tailwind, TypeScript, package "darktalent"
- Existing context-like files: README.md, readme.md, ARCHITECTURE.md
- Notable top-level files: .env.example, .gitignore, ARCHITECTURE.md, next-env.d.ts, next.config.ts, package-lock.json, package.json, postcss.config.mjs, README.md, tsconfig.json, tsconfig.tsbuildinfo

## How to keep this useful

- If you learn the product purpose, stack, run commands, deployment target, or open
  tasks, update this file.
- Keep `AGENTS.md` synchronized with this file so Codex sessions have the same
  context inline.
- Prefer concrete project facts over generic instructions.

## Imported existing context

Source: `README.md`

```markdown
# darktalent.tech

**Moneyball for tech talent** — discover, score, and connect the undervalued
builders that legacy hiring overlooks. Signal over pedigree.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design and the scoring model.

## Status

| Area | State |
|---|---|
| Data model (Prisma) | ✅ built |
| Scoring engine (5 pillars, explainable) | ✅ built + tested |
| GitHub ingestion | ✅ built |
| Auth.js v5 | ⏳ next |
| API routes (`/ingest`, `/score`) | ⏳ next |
| Profile page + recruiter dashboard | ⏳ next |

## Quickstart

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env          # then fill in DATABASE_URL + AUTH_* (see below)

# 3. See the scoring engine work — no DB required
npm run score:demo
npm test

# 4. Database (after DATABASE_URL is set)
npm run db:generate           # generate Prisma client
npm run db:push               # create tables on Neon
npm run db:seed               # insert two scored sample profiles

# 5. Dev server
npm run dev                   # http://localhost:3000
```

## Environment

Copy `.env.example` → `.env`. Minimum to run the app:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection (runtime) |
| `DIRECT_URL` | Neon **direct** connection (migrations) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth app |
| `GITHUB_TOKEN` | _(optional)_ raises ingestion rate limit |

The scoring engine (`npm run score:demo`, `npm test`) needs **no** env or DB —
it's a pure module.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run score:demo` | Render scores for the sample archetypes |
| `npm test` | Run the scoring engine unit tests |
| `npm run db:push` | Push schema to the database |
| `npm run db:seed` | Seed sample scored profiles |
| `npm run db:studio` | Prisma Studio (browse data) |
| `npm run typecheck` | `tsc --noEmit` |

## Deploy

1. **Neon** — create a project; copy the pooled URL → `DATABASE_URL`, the direct
   URL → `DIRECT_URL`.
2. **Vercel** — import the repo, add all env vars, deploy. `build` runs
   `prisma generate` automatically.
3. **Migrations** — `npm run db:migrate` locally (uses `DIRECT_URL`), commit the
   `prisma/migrations` folder; Vercel applies on deploy.

## Privacy

Public-data ingestion only, per-scope consent (`ConsentRecord`), full access
audit (`AuditLog`), and right-to-erasure are built into the schema — not bolted
on. See [ARCHITECTURE.md §4](ARCHITECTURE.md#4-privacy--consent-first-class).
```
<!-- END:imported-claude-context -->
