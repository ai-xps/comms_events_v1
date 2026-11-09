import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings, persistCleanPriorityUrls } from "@/lib/settings";
import { ALLOWED_HOSTS } from "@/lib/scraper/allowlist";
import { buildCoverageReport, type CoverageDay, type CoverageWindow } from "@/lib/scraper/coverage-report";
import { droppedPriorityUrlMessage } from "@/lib/scraper/priority-copy";
import { ScraperForm } from "@/components/ScraperForm";
import { addDays, formatDateTime, londonDate, londonParts } from "@/lib/time";
import { CATEGORIES, type Category } from "@/lib/constants";
import type { SourceResult } from "@/lib/scraper/live-adapter";
import type { ScrapedEvent } from "@/lib/scraper/types";

function safeSources(raw: string): SourceResult[] {
  try {
    const parsed = JSON.parse(raw || "[]") as SourceResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function loadCoverageEvents(): Promise<ScrapedEvent[]> {
  const now = new Date();
  const parts = londonParts(now);
  const today = londonDate(parts.year, parts.month, parts.day, 0, 0);
  const monthStart = londonDate(parts.year, parts.month, 1, 0, 0);
  const from = addDays(monthStart, -14);
  const to = addDays(today, 8);
  const rows = await prisma.event.findMany({
    where: { startsAt: { gte: from, lt: to } },
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

function categorySummary(window: CoverageWindow): string {
  return CATEGORIES.map((c) => `${c} ${window.byCategory[c]}`).join(" · ");
}

function DayTable({ days, showEmpty }: { days: CoverageDay[]; showEmpty: boolean }) {
  const rows = showEmpty ? days : days.filter((d) => d.total > 0);
  if (!rows.length) return <p className="muted">No events in this window.</p>;
  return (
    <div className="table-wrap">
      <table className="data stack-sm">
        <thead>
          <tr>
            <th>Day</th>
            <th>Total</th>
            <th>By type</th>
            <th>Sources</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((day) => (
            <tr key={day.dayKey}>
              <td className="date" data-label="Day">
                {day.label}
              </td>
              <td className="num" data-label="Total">
                {day.total}
              </td>
              <td data-label="By type">
                {CATEGORIES.filter((c) => day.byCategory[c] > 0)
                  .map((c) => `${c} ${day.byCategory[c]}`)
                  .join(" · ") || "—"}
              </td>
              <td data-label="Sources">
                {day.bySource.length === 0
                  ? "—"
                  : day.bySource.map((s) => `${s.source} (${s.count})`).join("; ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ScraperPage() {
  const user = await requireUser(["admin"]);
  const cleaned = await persistCleanPriorityUrls(user.id);
  const settings = await getSettings();
  const orgs = await prisma.organisation.findMany({ orderBy: { name: "asc" } });
  const runs = await prisma.scraperRun.findMany({ orderBy: { startedAt: "desc" }, take: 8 });
  const droppedNotice = droppedPriorityUrlMessage(cleaned.dropped);
  const coverage = buildCoverageReport(await loadCoverageEvents());

  return (
    <main className="stack">
      <div className="page-head">
        <h1>Scraper settings</h1>
        <p className="lede">
          Daily run at 05:00 Europe/London via cron. Run now saves the priority list, then fetches it. Demo events
          run unless SCRAPE_FIXTURES=0. A second run of those demo events updates them in place, so pending can look
          unchanged. A live feed is fetched only from an allowlisted https address.
        </p>
        {cleaned.urls.length === 0 ? (
          <p className="muted" data-testid="priority-empty">
            No Priority URLs saved — the harvest uses the built-in demo fixtures only. Add allowlisted https ICS or
            JSON-LD feeds above (cathedral what&apos;s-on, Meetup Birmingham find, and other hosts on the list).
          </p>
        ) : null}
      </div>
      <ScraperForm
        settings={settings}
        organisations={orgs}
        allowedHosts={[...ALLOWED_HOSTS].sort()}
        notice={droppedNotice}
      />

      <section className="stack" data-testid="scraper-coverage">
        <h2>Coverage</h2>
        <p className="muted">
          Events already in the database by start day (Europe/London). Live scrapes and demo fixtures both count.
        </p>

        <h3>This week (Mon–Sun) — {coverage.thisWeek.total} events</h3>
        <p className="muted">{categorySummary(coverage.thisWeek)}</p>
        <DayTable days={coverage.thisWeek.days} showEmpty />

        <h3>
          This month — {coverage.thisMonth.label} — {coverage.thisMonth.total} events
        </h3>
        <p className="muted">{categorySummary(coverage.thisMonth)}</p>
        <DayTable days={coverage.thisMonth.days} showEmpty />

        <h3>Next 7 days — {coverage.nextWeek.total} events</h3>
        <DayTable days={coverage.nextWeek.days} showEmpty={false} />
      </section>

      <section>
        <h2>Recent runs</h2>
        {runs.length === 0 ? <p className="muted">No runs yet.</p> : null}
        <div className="table-wrap">
          <table className="data stack-sm">
            <thead>
              <tr>
                <th>When</th>
                <th>Trigger</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Skipped</th>
                <th>Feeds</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const sources = safeSources(run.sourceResults);
                const failed = sources.filter((s) => !s.ok).length;
                return (
                  <tr key={run.id}>
                    <td className="date" data-label="When">
                      {formatDateTime(run.startedAt)}
                    </td>
                    <td data-label="Trigger">{run.trigger.toLowerCase()}</td>
                    <td data-label="Status">{run.status}</td>
                    <td className="num" data-label="Created">
                      {run.createdCount}
                    </td>
                    <td className="num" data-label="Updated">
                      {run.updatedCount}
                    </td>
                    <td className="num" data-label="Skipped">
                      {run.skippedHumanEdited}
                    </td>
                    <td data-label="Feeds">
                      {sources.length === 0 ? (
                        "Demo harvest only"
                      ) : (
                        <ul className="stack-sm scrape-feed-list">
                          {failed ? (
                            <li className="muted">
                              {sources.length - failed} ok, {failed} failed
                            </li>
                          ) : null}
                          {sources.map((source) => (
                            <li key={`${run.id}-${source.url}`}>
                              <span className="muted">
                                {source.ok ? `${source.eventCount} events` : source.error ?? "failed"}
                              </span>
                              {" · "}
                              <a href={source.url} target="_blank" rel="noreferrer">
                                {(() => {
                                  try {
                                    return new URL(source.url).hostname.replace(/^www\./, "");
                                  } catch {
                                    return source.url;
                                  }
                                })()}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
