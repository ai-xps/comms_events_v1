/**
 * Probe the Birmingham discovery pack and seed Settings.priorityUrls with feeds
 * that return ≥1 parseable event. Enables all five type toggles.
 *
 * Usage: npx tsx scripts/seed-discovery-pack.ts
 */
import { DEFAULT_COLOURS } from "../src/lib/constants";
import { MAX_PRIORITY_URLS, scrapeUrlAllowed } from "../src/lib/scraper/allowlist";
import { DISCOVERY_PACK } from "../src/lib/scraper/discovery-pack";
import { fetchLiveEvents } from "../src/lib/scraper/live-adapter";
import { prisma } from "../src/lib/db";

async function main() {
  const candidates = DISCOVERY_PACK.filter((row) => scrapeUrlAllowed(row.url).ok);
  const pauseMs = Number(process.env.SCRAPE_PAUSE_MS ?? "900") || 900;
  console.log(`Probing ${candidates.length} discovery URLs (pause ${pauseMs}ms)…\n`);

  const working: string[] = [];
  const failures: { url: string; label: string; error: string }[] = [];

  // Probe one-by-one so a slow host does not block the whole pack report.
  for (const row of candidates) {
    const harvest = await fetchLiveEvents([row.url], { pauseMs });
    const source = harvest.sources[0];
    if (source?.ok && source.eventCount > 0) {
      working.push(row.url);
      console.log(`OK  ${source.eventCount.toString().padStart(3)}  ${row.label}\n    ${row.url}`);
    } else {
      const error = source?.error ?? "No events";
      failures.push({ url: row.url, label: row.label, error });
      console.log(`--  ${row.label}: ${error}\n    ${row.url}`);
    }
    if (working.length >= MAX_PRIORITY_URLS) break;
  }

  const enabled = {
    priorityUrls: JSON.stringify(working),
    christianEnabled: true,
    networkingEnabled: true,
    professionalEnabled: true,
    studentEnabled: true,
    meetupEnabled: true
  };
  const existing = await prisma.settings.findUnique({ where: { id: "default" } });
  if (existing) {
    await prisma.settings.update({ where: { id: "default" }, data: enabled });
  } else {
    await prisma.settings.create({
      data: {
        id: "default",
        categoryColours: JSON.stringify(DEFAULT_COLOURS),
        ...enabled
      }
    });
  }

  console.log(`\nSeeded ${working.length} Priority URL(s). Failures: ${failures.length}.`);
  console.log("All five type toggles enabled.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
