import { buildCoverageReport, formatCoverageReport } from "../src/lib/scraper/coverage-report";
import { runScraper } from "../src/lib/scraper/run";
import { prisma } from "../src/lib/db";
import { addDays, londonDate, londonParts } from "../src/lib/time";
import type { ScrapedEvent } from "../src/lib/scraper/types";
import type { Category } from "../src/lib/constants";

async function loadReportEvents(): Promise<ScrapedEvent[]> {
  const now = new Date();
  const parts = londonParts(now);
  const today = londonDate(parts.year, parts.month, parts.day, 0, 0);
  const monthStart = londonDate(parts.year, parts.month, 1, 0, 0);
  // Cover last 7, this week (may start previous month), and full month → next week end.
  const from = addDays(monthStart, -14);
  const to = addDays(today, 8);
  const rows = await prisma.event.findMany({
    where: {
      startsAt: { gte: from, lt: to }
    },
    orderBy: { startsAt: "asc" }
  });
  return rows.map((row) => {
    const fromNotes = row.notes?.match(/^Source feed:\s*(.+)$/m)?.[1]?.trim() ?? null;
    return {
      sourceKey: row.sourceKey ?? `db:${row.id}`,
      title: row.title,
      organisationName: row.organisationName,
      category: row.category as Category,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      online: row.online,
      placeName: row.placeName,
      lat: row.lat,
      lng: row.lng,
      externalUrl: row.externalUrl,
      notes: row.notes,
      fetchedFrom: fromNotes,
      needsTypeReview: false
    };
  });
}

async function main() {
  const result = await runScraper({ trigger: "SCHEDULED" });
  console.log("\n=== Scraper run result ===\n");
  console.log(JSON.stringify(result, null, 2));

  console.log("\n=== Per-source fetch results ===\n");
  if (!result.sources.length) {
    console.log("(no live Priority URLs fetched — fixtures / demo only)");
  } else {
    for (const source of result.sources) {
      const status = source.ok ? `ok · ${source.eventCount} events` : `FAIL · ${source.error ?? "error"}`;
      console.log(`- ${source.url}\n  ${status}`);
    }
  }
  if (result.droppedDisabledCategory > 0) {
    console.log(
      `\nNote: ${result.droppedDisabledCategory} event(s) dropped because a type toggle is off.`
    );
  }

  const events = await loadReportEvents();
  const report = buildCoverageReport(events);
  console.log("\n=== Coverage (this week + this month + last/next 7) ===\n");
  console.log(formatCoverageReport(report));

  const liveCount = await prisma.event.count({ where: { sourceKey: { startsWith: "live:" } } });
  console.log(`\nDB holds ${liveCount} live:* events (all time). Window rows loaded: ${events.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
