# Gather — review, 17 October 2026

Read of the working tree on 17 October 2026, after Guillaume’s 16 October notes and the calendar tester notes. Scores are against a closed community demo, not an NHS production system. Dated ship notes (what each build put on the board): [`CHANGELOG.md`](CHANGELOG.md).

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
| Med | `/import` page was client-only; leaders who typed the URL saw the form | **Fixed** — page checks admin; API still 403 |
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
| Med | Weekly series uses +7 UTC days (clocks go back 25 Oct) | **Fixed** for seed and scrape fixtures via London calendar days |
| Med | Scrape lock is check-then-act | **Fixed** — atomic `INSERT … ON CONFLICT` claim |
| Med | Any `https://…/*.ics` bypassed the host allowlist | **Fixed** — host must be on the list |
| Low | Unused `react-leaflet` | Removed earlier this week |

## UI and UX

| Sev | Item | Status |
| --- | --- | --- |
| High | Day/week empty; All types stuck; map vanishes | **Fixed** — re-checked 17 Oct evening; Week/Day are view tabs, not type chips |
| Med | Type chips only one at a time | **Fixed** — multi-select `types=` |
| Med | Login cell number free text | **Fixed** — dropdown of active numbers (no names) |
| Med | Add event felt lat/lng-only | **Fixed** — Find on map + pin; Online by Event Link |
| Med | Pending is a flat list; publish felt calendar-bound | **Fixed** — tiles by day; Save/Back stay on pending |
| Med | Reports only one event at a time | **Fixed** — date-range event file |
| Med | Import format not shown as a file | **Fixed** — example table + CSV template |
| Med | Leftover Meetup Priority URL 400'd the whole settings save | **Fixed** — drop disallowed URLs, save the rest, say so |
| — | 17 Oct evening tester list (multi-select, login dropdown, Find on map, Online by Event Link, quiet Add, pending tiles, Return, import template, reports range) | **Shipped** on `experiment` (`da8c50d`–`28a9929`). Re-smoke after each deploy (below). |
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

Re-run 18 October 2026 on https://commseventsv1-production.up.railway.app (admin, then leader, then member).

1. **Pass.** Week `d=2026-10-18` with Christian lists prayer / gathering / Test Guillaume / Eucharist only. All types restores Networking breakfast. Day view same date works. Map stays.
2. **Pass.** Login dropdown: numbers only, “Choose your cell number”. `/login?next=https://example.com` as member lands on `/calendar`.
3. **Pass (admin).** Pending tiles by London day; Add event `?d=` prefills 09:00–10:00; Find on map + Online by Event Link; Reports “Events in a date range”; Import example + CSV template; Members Return present. Menu at 390px.
4. **Pass (leader).** Add on days; no Import/Scraper/Audit in nav; `/import` is a sentence + Back to calendar (not the form).
5. **Pass (member).** Nav is Calendar + My bookings only; no Add event / day Add.
6. **Known leftover.** Attend already recorded on Test Guillaume from earlier smoke; “Didn’t attend” sticky from 17 Oct not re-checked this run.

Attendance prompt “Ask me next time” is session-snoozed (`sessionStorage`), so it no longer returns on every navigation. Confirming Attended / Didn’t attend still clears it for good.

## Opportunities

1. Prisma migrate; never seed production; health check; backups.
2. Browser tests (Playwright) for calendar filters, Attend, Insights export.
3. Nonce-based CSP.
4. Confirm live ICS against a real cathedral/uni feed on Railway.
5. Indexes. Broader live harvest (Eventbrite/Meetup APIs) still out.
6. §16 phone UI.

OpenStreetMap’s public tiles are fine for the demo. A regional rollout should use a tile provider with a usage agreement.
