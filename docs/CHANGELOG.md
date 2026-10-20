# Changelog

What each Gather demo build shipped. Newest first.

A **changelog** is a dated notebook of “what we put on the noticeboard,” not the full story of *why* (that stays in [`DECISIONS.md`](../DECISIONS.md)).

| Branch | Live demo | `package.json` |
| --- | --- | --- |
| `experiment` | https://commseventsv1-production.up.railway.app | `1.0.0` (demo label only — bump when church go-live needs numbered releases) |

Git history is the source of truth. Smoke checklists live in [`REVIEW.md`](REVIEW.md). Sign-off stays blank in [`FUNCTIONAL.md`](FUNCTIONAL.md) until An, Becca and Guillaume choose to sign.

Style later: [Keep a Changelog](https://keepachangelog.com/).

---

## 2026-10-20 — Soft blush / berry UI (style only)

- Visual restyle from Gelain-style refs: blush paper, berry CTAs, sage/gold gentle accents.
- Tokens in `globals.css`; map/Insights/category art follow. No behaviour changes.
- Nav fits admin links: shorter labels, wrapping flex topbar, secondary Sign out.
- Insights KPIs: even 3×3 grid + frosted filter bar.
- Event cards: small category illustrations + soft colour washes (calendar, bookings, pending, detail).

## 2026-10-20 — Fix scraper / members / import after shared-cell login

- Password uniqueness only among people who share the same cell number (faster create/import).
- Origin check accepts Referer / same-origin when browsers omit Origin (manual scrape + member save).
- Import: rich-text Excel cells, safer parse errors, audit failures no longer block create/import.
- Scraper “Run now”, member Save, and import show clear busy / error states.

## 2026-10-19 — Shared cell number + unique password login

- Several people may share one cell number; login picks the person by unique password (Guillaume B).
- Create/import reject reused passwords; Prisma drops unique on `cellNumber` (index kept).

## 2026-10-19 — Apple/tech UX + stakeholder pack + login rules

- Cool Apple/tech UI tokens (less cream); SF-style system stack; blue accent.
- Cell login IDs: alphanumeric, any length. Passwords: non-empty, any length.
- Stakeholder Canva brief, requirements-loop, checklist, `npm run deck:stakeholder`.
- README hero screenshot + presentation links.

## 2026-10-19 — Emil Kowalski skills (local; commit when ready)

- Vendor copy of all [emilkowalski/skills](https://github.com/emilkowalski/skills) under `.cursor/skills/` (MIT).
- Gather how-to: [`EMIL-SKILLS.md`](EMIL-SKILLS.md). Prefer `mobile-native` before heavy motion; keep current product tokens.

## 2026-10-18 — agent briefing (local; commit when ready)

- Root [`AGENTS.md`](../AGENTS.md) + thin [`CLAUDE.md`](../CLAUDE.md).
- Karpathy always-on rule; keep teach-An; [`docs/agent-lessons.md`](agent-lessons.md); optional smoke skill.
- Skip Loop Engineering / autopilot until CI/PR chore pain is real.

---

## 2026-10-18 — tester evening + live smoke (`28a9929`)

Commits `da8c50d` … `28a9929`.

- Multi-select event types (`types=`), Month/Week/Day as view tabs, All types clears the filter.
- Login: dropdown of active cell numbers (no names); “Choose your cell number.”
- Event form: Find on map, Online beside Event Link, `?d=` prefills 09:00 London; pending Save/Publish/Discard/Back stay on `/pending`.
- Quiet Add on month cells and week/day headings (reviewers only).
- Pending queue as noticeboard tiles by London day; equal-height tiles.
- Members Return without save; import example table + CSV template (admin only; leaders who type `/import` see a sentence).
- Reports: “Events in a date range” card (CSV/Excel); per-event attendee export kept.
- Drop stale scraper Priority URLs instead of blocking the whole settings save.
- Railway: stop login prerender so the image builds without Postgres (`force-dynamic`).
- Live smoke as admin, cell leader, and member — see [`REVIEW.md`](REVIEW.md).

**Known leftover:** “Didn’t attend” sticky on Test Guillaume from an earlier smoke not re-checked this run. §16 phone redesign still backlog.

---

## 2026-10-17 — calendar fix, Insights, scraper 8, tester deck (`dc1fbc6` … `6378449`)

- Day/week follow `d=YYYY-MM-DD`; Previous/Today/Next step by view; map stays when empty.
- Insights for admin (region) and cell leader (own cell); export and share totals only.
- High-severity review fixes (open redirect, session bump, cron secret, last-place booking lock, confirm dialogs).
- Scraper: DST-safe fixtures, allowlisted ICS/JSON-LD, freeze human-edited rows, bound live fetches.
- Tester deck (no secrets); attendance prompt session-snooze; blank FUNCTIONAL sign-off named for An, Becca, Guillaume.
- Docs: calendar notes, Insights decisions, REVIEW and FUNCTIONAL written.

---

## 2026-10-16 — Guillaume demo asks (`96bf9d2`, `dc0de12`)

- Member attendee view: Count / initials / **Count and Name + Cell**.
- Manual events: place text + map pin; Event Link label; return to pending after publish/discard.
- Mobile mockups recorded in `context.md` §16 (target look; not shipped UI).

---

## 2026-10 — first Railway deploy (`cf89aa6` … `902a286`)

- Initial Gather app (Next.js, Prisma, cream parish UI).
- Postgres on Railway; Railpack builder; bind to `PORT`.

---

## How to add the next entry

1. Ship on `experiment` (commit SHA at the top).
2. Add a new `## YYYY-MM-DD — short title (\`abc1234\`)` section **above** this list.
3. Bullet what people can *do*, not every file touched.
4. Point leftovers and smoke steps at [`REVIEW.md`](REVIEW.md).
5. When go-live needs numbered releases: bump `package.json` and use `## 1.1.0 — …` as the heading.
