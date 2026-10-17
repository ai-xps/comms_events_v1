# Gather — review, 17 October 2026

Read of the working tree on 17 October 2026, after Guillaume’s 16 October notes and the calendar tester notes. Scores are against a closed community demo, not an NHS production system.

## Scorecard

| Area | Before this sprint | After | Why |
| --- | --- | --- | --- |
| Security | 5 | 8 | Open redirect, Event Link, colours, cron secret, formula injection, session revocation, headers. Still: `'unsafe-inline'` scripts, seed-on-start, no IP throttle. |
| Reliability | 5 | 7 | Last-place booking is locked. Day/week calendar was wrong. Still: `db push` on every start, no migrations, weekly series drift at the clock change. |
| Testing | 1 | 7 | Vitest, coverage gate on core libs, CI with Postgres. No browser end-to-end suite yet. |
| Accessibility | 6 | 7 | Confirm dialogs, `aria-current` on chips, error/loading/not-found pages. Month grid on a phone is still dense. |
| Neatness | 5 | 7 | Calendar split into a pure lib + components. Maps share one module. Insights is one calculation for page, file and share. |
| Product fit | 6 | 8 | Guillaume’s four asks plus the three calendar bugs, plus Insights for leaders. §16 mobile UI is still the next visual pass. |

## Security

| Sev | Item | Status |
| --- | --- | --- |
| High | Login `next=` open redirect | **Fixed** — `safeNextPath` |
| High | Logout / password reset left cookies valid | **Fixed** — `sessionVersion` |
| High | Cron secret in the query string, `!==` compare | **Fixed** — Bearer + `timingSafeEqual` |
| Med | Spreadsheet formula injection | **Fixed** — `safeCell` |
| Med | Import unbounded | **Fixed** — 2 MB / 2,000 rows |
| Med | Event Link any scheme | **Fixed** — http(s) only |
| Med | Category colours unvalidated | **Fixed** — `#rrggbb` |
| Med | No security headers | **Fixed** — CSP + HSTS + nosniff + frame deny |
| Med | Login throttle is per cell number only | **Backlog** — add IP / global limit |
| Med | GET export is a cookie-authenticated download | **Backlog** — prefer POST (Insights already POSTs) |
| Med | Login skips bcrypt when the account is missing | **Backlog** — dummy hash |
| Low | `Secure` cookie follows `NODE_ENV` | **Backlog** — derive from `APP_ORIGIN` |

## Data and ops

| Sev | Item | Status |
| --- | --- | --- |
| High | Two bookings can take the last place | **Fixed** — `SELECT … FOR UPDATE` |
| High | Seed demo passwords on first production boot | **Backlog** (track C) — stop seeding in production |
| High | `prisma db push` on every start; no migrations | **Backlog** (track C) |
| Med | No indexes on `(status, startsAt)` | **Backlog** |
| Med | Weekly series uses +7 UTC days (clocks go back 25 Oct) | **Backlog** |
| Med | Scrape lock is check-then-act | **Backlog** |
| Low | Unused `react-leaflet` | Removed earlier this week |

## UI and UX

| Sev | Item | Status |
| --- | --- | --- |
| High | Day/week empty; All types stuck; map vanishes | **Fixed** |
| High | Delete / discard / deactivate with no confirm | **Fixed** — `ConfirmDialog` |
| High | Silent client fetch failures | **Fixed** — `requestJson` |
| Med | No loading / error / not-found pages | **Fixed** |
| Med | Member cannot be deactivated | **Fixed** — form sends `on`/`off` |
| Med | Empty tables have no message | **Backlog** |
| Low | Attend vs “booked” copy mix | **Backlog** |
| — | §16 mobile redesign | **Backlog** (track A) |

## Testing

| Item | Status |
| --- | --- |
| Unit tests for calendar, security, policy, exports, Insights | **In** |
| Integration: last-place race, role matrix, session bump | **In** (runs in CI against Postgres) |
| Coverage gate 90% lines on named libs | **In** |
| GitHub Actions on `experiment` and `main` | **In** |
| Browser end-to-end | **Backlog** |

## Live smoke (run after each deploy)

Run 17 October 2026 on https://commseventsv1-production.up.railway.app (admin session unless noted).

1. **Pass.** Day view 17 Oct lists Sunday gathering and Test Guillaume. Week view 12–18 Oct lists Friday prayer through Sunday breakfast. Christian then All types restores Student, Networking, Meetup, Professional. Map stays (Birmingham pins).
2. **Pass.** `/login?next=https://example.com` signed in to `/calendar`, not example.com.
3. **Pass.** Login HEAD: `Content-Security-Policy`, `Strict-Transport-Security` (max-age=31536000; includeSubDomains), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`. Map tiles loaded.
4. **Pass (admin).** Insights loads (4 published, 3 Attend clicks, k-anon cells). Export CSV / TXT / JSON / XLSX and share buttons present. Member menu not checked this run.
5. **Partial.** Attend already recorded on Test Guillaume; “Didn’t attend” confirmation stuck. Publish→pending not re-clicked this run.

Attendance prompt “Ask me next time” is session-snoozed (`sessionStorage`), so it no longer returns on every navigation. Confirming Attended / Didn’t attend still clears it for good.

## Opportunities

1. Prisma migrate; never seed production; health check; backups.
2. Browser tests (Playwright) for calendar filters, Attend, Insights export.
3. Nonce-based CSP.
4. Weekly series wall-clock across 25 October.
5. Indexes and a live scraper behind the existing adapter.
6. §16 phone UI.

OpenStreetMap’s public tiles are fine for the demo. A regional rollout should use a tile provider with a usage agreement.
