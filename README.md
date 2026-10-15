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

## Setup

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000. The seed command prints cell numbers and initial passwords once to stdout. They are not shown in the app. Re-running seed is a no-op if the admin user already exists.

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

`npm run scrape` and `POST /api/cron/scrape` (Bearer or `?secret=`) both run the fixture scraper with trigger `SCHEDULED`. The admin **Run now** button uses trigger `MANUAL` and an admin session.

This build does not fetch live websites. Priority URLs are stored on the run record. The live adapter at `src/lib/scraper/live-adapter.ts` is not called.

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
- Live HTTP scraping or geocoding
- Weeks past the 12th occurrence of a series
- A hierarchy manager
