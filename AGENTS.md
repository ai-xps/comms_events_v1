# Gather — agent briefing

Closed calendar for one Birmingham community (demo, not NHS production). Soft blush / berry UI. Live demo on Railway until Ubuntu+SQLite cutover gate is green ([`docs/deploy-ubuntu.md`](docs/deploy-ubuntu.md)).

**Source of truth for agents.** Thin adapters (`CLAUDE.md`, Cursor rules) point here. Do not duplicate this file elsewhere.

## Commands

```bash
npm install
npm test              # unit (integration needs TEST_DATABASE_URL)
npm run typecheck
npm run test:coverage
npm run build
npm run dev           # local; needs SQLite DATABASE_URL=file:./data/gather.db
```

Live demo (until Ubuntu gate): https://commseventsv1-production.up.railway.app  
Ubuntu / Oracle cutover: [`docs/deploy-ubuntu.md`](docs/deploy-ubuntu.md). **Do not push SQLite to Railway while it still has a Postgres URL** (pause redeploy first). `scripts/start.sh` refuses Postgres URLs.  
Branch for work: `experiment`. Ship notes: [`docs/CHANGELOG.md`](docs/CHANGELOG.md). Smoke checklist: [`docs/REVIEW.md`](docs/REVIEW.md). Product calls: [`DECISIONS.md`](DECISIONS.md). What it does / sign-off: [`docs/FUNCTIONAL.md`](docs/FUNCTIONAL.md).

## Always

- Follow [`.cursor/rules/teach-an.mdc`](.cursor/rules/teach-an.mdc) (plain teaching) and [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) (simple, surgical, verify).
- Prefer existing patterns in `src/`; soft blush / berry tokens in `src/app/globals.css` (`--paper`, `--accent-gradient`, `--accent` / `--terracotta` alias, `--sage` / `--gold`).
- After non-trivial code changes: `npm test` and `npm run typecheck`.
- On **auth**, **export**, or **import** changes: run Cursor **`/review-security`** before calling the work done.
- After a human correction: add one line to [`docs/agent-lessons.md`](docs/agent-lessons.md).

## Ask first

- `git commit` / `git push` / open or merge a PR
- Merge or push to `main`
- Changing roles, privacy toggles, or scraper allowlists
- Installing Loop Engineering or other unattended agent loops
- Forging or filling FUNCTIONAL sign-off (An / Becca / Guillaume)

## Never

- Commit secrets, `.env`, seed passwords, or real member data into docs or the tester deck
- Force-push `main` / `master`
- Skip hooks unless the user explicitly asks
- Invent App Store / offline PWA caching of bookings (stale Attend is unsafe)
- Dump huge third-party rulebooks into **always-on** rules (on-demand skills under `.cursor/skills/` are fine when documented)

## Verify (goal-driven)

Typical success checks:

1. Unit tests green → `npm test`
2. Types green → `npm run typecheck`
3. Role smoke (optional skill) → `.cursor/skills/gather-smoke/SKILL.md`

## Emil Kowalski UI / motion skills (on demand)

Vendor skills live under [`.cursor/skills/`](.cursor/skills/) (see [`docs/EMIL-SKILLS.md`](docs/EMIL-SKILLS.md)).

- **Invoke** with `/skill-name` or “use the `mobile-native` skill…”.
- **Highest Gather value now:** `mobile-native` (phone feel). Then `animate` / `animation-performance` / `review-animations` when the user asks for motion.
- **Low value here:** `animate-expo`, `write-swift` (Gather is Next.js web, not Expo/Swift).
- While those skills run: keep current product tokens; ask before new UI libraries; prefer no motion over wrong motion.

## Out of scope for agents unless asked

§16 teal phone redesign, Prisma migrate cutover, stopping production seed, Loop/autopilot systems, merge to `main`.
