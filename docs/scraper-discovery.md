# Frozen Birmingham discovery pack

**Status: frozen (Nov 2026 stretch).** Do not casually shrink, reorder for “cleanup,” or replace with an open web crawl. Widen only with a measured probe + admin ask.

## Goal

Cover Birmingham and nearby West Midlands / Midlands listings for the five Gather types — Christian, Networking, Professional, Student, Meetup — with cited Source feeds.

**Freeze harvest (observed):** **~1200** unique November live events, including **≥150 Christian**.

## Method (locked)

1. **Allowlist only** — [`src/lib/scraper/allowlist.ts`](../src/lib/scraper/allowlist.ts). No arbitrary URL fetch.
2. **Discovery pack** — [`src/lib/scraper/discovery-pack.ts`](../src/lib/scraper/discovery-pack.ts). Christian slices are listed **first** (first-wins dedupe). Sources: Eventbrite category + nearby-city pages, Meetup faith/keyword finds, Allevents city pages (Brum + WM + nearby Midlands), Ticketmaster, cathedral, Luma, Visit Birmingham, A Church Near You when parseable.
3. **Probe then seed** — `npx tsx scripts/seed-discovery-pack.ts` keeps only URLs that return ≥1 event; writes Settings Priority URLs (cap **100**); turns all five type toggles on.
4. **Parsers** — ICS, JSON-LD (incl. ItemList → item), microdata, same-host `.ics` discovery.
5. **Category from aggregator URL** — path / `keywords=` beats bare host default for Eventbrite, Meetup, Allevents.
6. **Dedupe** — first live `sourceKey` wins; fixtures still overwrite.
7. **Caps** — 1 MiB body · 300 events/URL · **2500**/run · **100** Priority URLs · default pause **1500ms** (`SCRAPE_PAUSE_MS`).
8. **Coverage** — this week (Mon–Sun) + whole calendar month day×type on admin Scraper page and `npm run scrape`.

## Install / refresh on a box

```bash
npx tsx scripts/seed-discovery-pack.ts   # probe + write Settings
SCRAPE_FIXTURES=0 npm run scrape         # live harvest + month table
```

Empty Priority URLs also get the frozen pack automatically (`ensureFrozenDiscoveryPack`). Re-apply with `FORCE_DISCOVERY_PACK=1`.

## Out of scope

Open crawl of the whole internet · shipping `videos/` · changing org whitelist/Publish rules without ask.
