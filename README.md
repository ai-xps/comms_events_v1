# Gather — Birmingham Community Events

A closed calendar for one community in Birmingham. An admin creates accounts from a file. Members sign in with a cell number and password, browse events, click Attend, and later confirm they went. Cell leaders review scraped events and look after their own cell.

This deployment is Birmingham only. Another region would be a separate copy with its own database, admin, and calendar.

## Prerequisites

- Node.js 20 or later
- npm

Postgres is required (local Docker/Postgres or Railway). SQLite is no longer used.

## Environment

Copy `.env.example` to `.env`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres URL, e.g. `postgresql://USER:PASSWORD@HOST:5432/gather?schema=public`. |
| `SESSION_SECRET` | Signs the httpOnly session cookie. Use a long random string. |
| `CRON_SECRET` | Guards `POST /api/cron/scrape`. |
| `APP_ORIGIN` | Exact origin for mutation checks, e.g. `http://localhost:3000` or your Railway HTTPS URL (no trailing slash). |
| `SCRAPE_LIVE` | Set to `0` to skip fetching Priority URLs. Fixtures still run unless `SCRAPE_FIXTURES=0`. |
| `SCRAPE_FIXTURES` | Set to `0` to skip the demo harvest. Default is on. |

## Setup

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000. The seed command prints cell numbers and initial passwords once to stdout. They are not shown in the app. Re-running seed is a no-op if the admin user already exists.

## Tests

```bash
npm test              # unit tests (integration tests run when TEST_DATABASE_URL is set)
npm run test:coverage
npm run typecheck
```

CI (`.github/workflows/ci.yml`) on push to `experiment` or `main`: typecheck, tests against Postgres 16, then `next build`.

What the app does, with who agreed it: [`docs/FUNCTIONAL.md`](docs/FUNCTIONAL.md). Weak points and the live smoke list: [`docs/REVIEW.md`](docs/REVIEW.md). Six-slide tester guide: [`docs/presentation/Gather-tester-guide.pptx`](docs/presentation/Gather-tester-guide.pptx) (`npm run deck` to rebuild).

To start again:

```bash
npm run db:reset
```

## Migrations

```bash
npx prisma db push
```

That keeps Postgres in line with `prisma/schema.prisma`.

## Railway

Deploy the `experiment` branch. Attach Postgres and set `DATABASE_URL` (variable reference), `APP_ORIGIN`, `SESSION_SECRET`, `CRON_SECRET`, and `NODE_ENV=production`. `npm start` runs `prisma db push`, seed (if empty), then Next.js.

## Daily scraper (05:00 Europe/London)

Do not start a scheduler inside `next dev`. Use cron on the host:

```cron
0 5 * * * cd /path/to/app && /usr/bin/env CRON_SECRET=your-cron-secret npm run scrape
```

`npm run scrape` and `POST /api/cron/scrape` with `Authorization: Bearer <CRON_SECRET>` both run the scraper with trigger `SCHEDULED`. The admin **Run now** button uses trigger `MANUAL` and an admin session.

The demo harvest runs unless `SCRAPE_FIXTURES=0`. If Priority URLs are set, Gather fetches only https ICS or JSON-LD from the host allowlist (User-Agent `GatherBirmingham/1.0`, robots.txt, 8s timeout, 1 request/s, 512 KiB body cap). Set `SCRAPE_LIVE=0` to skip the network. A failed feed is recorded on the run and does not stop the others. Saving an event after publish freezes scrape updates for that row. Gather does not collect member data from third-party sites.

## Import columns

Name, Cell number, Cell, Password, Permission.

Permission is `admin`, `cell leader`, or `member`. Password must be at least 8 characters. CSV, Excel, and JSON are accepted. If any row fails, nobody is created.

## Replacing a password

An admin opens **Members**, edits the person, types a new password, and tells the cell leader. The old password cannot be read back.

## What this build does not do

- Public registration or invites
- Member password reset
- Email or SMS
- A live link to the wider Birmingham department system
- Overlap warnings
- Attendance reminders
- A second city in this calendar
- Live HTML scraping of third-party pages (ICS/JSON-LD only)
- Weeks past the 12th occurrence of a series
- A hierarchy manager
