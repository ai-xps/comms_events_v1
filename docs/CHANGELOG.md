# Changelog

What each Gather demo build shipped. Newest first.

A **changelog** is a dated notebook of “what we put on the noticeboard,” not the full story of *why* (that stays in [`DECISIONS.md`](../DECISIONS.md)).

| Where | What people open | Code |
| --- | --- | --- |
| Oracle (runs `experiment`) | https://132.145.68.166.sslip.io | Newest app change in this file: `26c2525` |
| Railway (announced demo, auto-deploy paused) | https://commseventsv1-production.up.railway.app | Last Postgres build. It does not include the 28 Oct notes. |

`package.json` stays `1.0.0` until a numbered church release.

Git history is the source of truth. Smoke checklists live in [`REVIEW.md`](REVIEW.md). Sign-off stays blank in [`FUNCTIONAL.md`](FUNCTIONAL.md) until An, Becca and Guillaume choose to sign.

Style later: [Keep a Changelog](https://keepachangelog.com/).

---

## 2026-10-28 — Cathedral what's-on is the starter feed

- The suggested priority address is `https://www.birminghamcathedral.com/whats-on/`. The old `calendar.ics` example returns 404.
- A fresh seed stores that address. An empty list still means demo events only.

## 2026-10-28 — Cutover gate checked; CI pinned to Ubuntu 24.04

- Oracle gate: systemd, HTTPS door, `APP_ORIGIN`, closed port 3000, disk-alert test, last-place booking test, and no leftover seed cell numbers are ticked in [`deploy-ubuntu.md`](deploy-ubuntu.md) and [`GATE-STATUS.md`](GATE-STATUS.md).
- Still blocking a Railway stop: green CI, one Attend, off-box backup, Telegram, telling Becca and Guillaume.
- GitHub Actions runs on `ubuntu-24.04` so Playwright can install Chromium. `ubuntu-latest` is 26.04, which Playwright 1.51 does not support.

## 2026-10-28 — Missing pages return 404, and the bare IP goes to the named site (`26c2525`)

- A missing event, or one a member cannot see, answers 404 with “Not found”, not a success status.
- The “Loading…” line is gone, so it cannot stay announced after the page has drawn.
- HTTP on the bare Oracle IP redirects to `https://132.145.68.166.sslip.io`.

## 2026-10-28 — Scraper Run now saves the priority list first (`8952c03`)

- Run now stores the priority box, then fetches. A host that is not on the allowlist is named and not fetched.
- A demo-only run says the pending list looks the same because existing demo events are updated in place.
- Leftovers (missing-event status, bare-IP certificate, sticky “Loading…”) are in [`REVIEW.md`](REVIEW.md).

## 2026-10-28 — Readable berry and the closed build record (`ba096bd` … `c74751f`)

- Button gradient light stop `#B14E58` and muted ink `#7A6266`, so white labels and hints clear 4.5:1.
- `context.md` section 20 is the rule for the app. Sections 1–19 stay as the October archive.

## 2026-10-28 — Bookings chips + Discard≠blacklist tests (`fb48a4f`)

- My bookings uses the same coloured attendance chip as the event page.
- Unit + integration cover Discard ≠ blacklist; E2E covers discard copy, CSV download, empty far-future month.

## 2026-10-27 — Week timetable calendar + brand mark (`7a7e96d` … `db65ee0`)

- Calendar defaults to **Week**; week/day use a Google-style time grid (hours × days, event blocks). Month view unchanged.
- Official Gather mark on welcome/topbar/favicon; login door is mark + Gather wordmark.
- Responsive shell: fluid type/spacing; compact chrome through iPad portrait (≤900px); tablet/desktop week-grid proportions; Apple web-app meta.
- Phone Menu and the top bar are opaque, so the page does not show through them.

## 2026-10-26 — UX redesign (Home browse, mark, calendar stars) (`24c0ec3` … `45de4e3`)

- Signed-in Home absorbs Search: kinds + upcoming list on `/?types=` / `format=`; `/search` redirects there. Phone tabs: Home, Calendar, Bookings. Sign out sits on that bar.
- Signed-out `/` is the mark, the catchphrase, and the sign-in fields together. Sign out returns to that door on `APP_ORIGIN`.
- `/api/health` answers without a sign-in, for an uptime check.
- GatherMark refined (soft pin fill, clearer people).
- Calendar: ★ on week/month rows; Saved strip; week/day list skips empty days.
- Bookings: Upcoming / Past; spots left when capacity is set; ★ when starred.
- Insights: Average fill explained; section headings; readable week bar labels. Reports: files vs Insights; Fill column on recent events.

## 2026-10-25 — Welcome hallway (entry UX)

- `/` is a welcome (mark, “Find. Book. Gather.”, one berry button, five event kinds), not a redirect to the month grid.
- `/search` asks the kind, then lists upcoming events (`types=` / `format=`); calendar stays a chosen destination.
- Phone bottom tabs: Home, Search, Calendar, Bookings. Menu keeps leader/admin links only.
- Sign-in with no `next=` returns to `/`. Sketch order from `docs/design-mockups/`; blush/berry tokens unchanged.
- Hardening: middleware keeps `?types=` in `next=`; signed-in `/login?next=` honours it; list rows clamp long titles; place names capped at 200; empty / kind-off / 50-cap copy; blush `themeColor`.
- RSI / touch: hover styles only on fine pointers; `:active` press feedback; ~44px targets on coarse pointers (nav, day cells, calendar event chips, back/Edit links, tab bar).

## 2026-10-24 — Ubuntu + SQLite Phase 1 (Oracle Tier 1 hardened; do not push to Railway yet)

- Prisma provider **sqlite**; `.env.example` `file:./data/gather.db`; CI uses SQLite (no Postgres service).
- SQLite-safe Attend lock + scrape lock; WAL + busy_timeout; `/api/health`.
- `scripts/start.sh`: no per-boot `db push` (use `BOOTSTRAP=1`); refuses Postgres URLs.
- [`deploy-ubuntu.md`](deploy-ubuntu.md), [`incident-card.md`](incident-card.md), `scripts/install-ubuntu.sh`, dual backup + disk alert, Caddy/systemd templates.
- **Ops:** pause Railway redeploy before this commit lands on a Railway-connected branch — Postgres URL + SQLite schema will not start.

## 2026-10-20 — Soft blush / berry UI (style only)

- Visual restyle from Gelain-style refs: blush paper, berry CTAs, sage/gold gentle accents.
- Tokens in `globals.css`; map/Insights/category art follow. No behaviour changes.
- Nav fits admin links: shorter labels, wrapping flex topbar, secondary Sign out.
- Insights KPIs: clumped into Reach / Showing up / Room & sharing; softer centred tiles.
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
