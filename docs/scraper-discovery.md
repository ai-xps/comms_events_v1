# Frozen Birmingham discovery pack

**Status: frozen (Nov 2026).** Do not casually shrink, reorder for “cleanup,” or replace with an open web crawl. Widen only with a measured probe + admin ask.

## Goal

Cover Birmingham (and nearby West Midlands listings) for the five Gather types — Christian, Networking, Professional, Student, Meetup — with cited Source feeds. Target scale: on the order of **hundreds of November events** when feeds are healthy (~500 observed in the freeze harvest).

## Method (locked)

1. **Allowlist only** — [`src/lib/scraper/allowlist.ts`](../src/lib/scraper/allowlist.ts). No arbitrary URL fetch.
2. **Discovery pack** — [`src/lib/scraper/discovery-pack.ts`](../src/lib/scraper/discovery-pack.ts) is the candidate list (Eventbrite category slices, Meetup keyword finds, Allevents city pages, Ticketmaster search, cathedral, Luma, Visit Birmingham).
3. **Probe then seed** — `npx tsx scripts/seed-discovery-pack.ts` keeps only URLs that return ≥1 event; writes Settings Priority URLs (cap **60**); turns all five type toggles on.
4. **Parsers** — ICS, JSON-LD (incl. ItemList → item), microdata, same-host `.ics` discovery.
5. **Category from aggregator URL** — Eventbrite/Meetup/Allevents path or `keywords=` beats bare host default.
6. **Dedupe** — first live `sourceKey` wins (specific slices before broad “all events”); fixtures still overwrite.
7. **Caps** — 1 MiB body · 300 events/URL · **2500**/run · **60** Priority URLs · default pause **1500ms** (`SCRAPE_PAUSE_MS`).
8. **Coverage** — this week (Mon–Sun) + whole calendar month day×type on admin Scraper page and `npm run scrape`.

## Install / refresh on a box

```bash
npx tsx scripts/seed-discovery-pack.ts   # probe + write Settings
SCRAPE_FIXTURES=0 npm run scrape         # live harvest + month table
```

Empty Priority URLs also get the frozen pack automatically on scrape/settings clean (see `ensureFrozenDiscoveryPack`).

## Out of scope

Open crawl of the whole internet · shipping `videos/` · changing org whitelist/Publish rules without ask.
