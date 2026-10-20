---
name: gather-smoke
description: >-
  Run the Gather Railway smoke checklist as admin, cell leader, and member.
  Use when the user asks to smoke-test, verify live deploy, or walk three roles
  on https://commseventsv1-production.up.railway.app.
---

# Gather live smoke

Closed demo only. Do not put passwords in chat logs or docs. Use seed accounts from local `prisma/seed.ts` stdout knowledge already shared with the team — never paste them into commits or the tester deck.

## Base URL

https://commseventsv1-production.up.railway.app

## Pass 1 — admin

1. Login dropdown: numbers only, first option “Choose your cell number”.
2. Calendar: Week for today; Christian then **All types** restores other types; map stays.
3. Pending: tiles by day.
4. Add event `?d=YYYY-MM-DD`: starts ~09:00; Find on map; Online beside Event Link.
5. Reports: “Events in a date range”.
6. Import: example table + Download CSV template.
7. Members add: **Return** present (does not save).

## Pass 2 — cell leader

1. Add on a day visible; pending reachable.
2. Nav has no Import / Scraper / Audit.
3. `/import` shows a sentence + Back to calendar (not the form).

## Pass 3 — member

1. Nav is Calendar + My bookings only.
2. No Add event / no day Add.
3. `/login?next=https://example.com` after sign-in lands on `/calendar` (not example.com).

## Done

Record pass/fail in `docs/REVIEW.md` live smoke section (or tell the user the ticks). Do not fill FUNCTIONAL sign-off.
