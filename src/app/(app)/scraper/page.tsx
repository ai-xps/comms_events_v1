import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ScraperForm } from "@/components/ScraperForm";
import { formatDateTime } from "@/lib/time";
import type { SourceResult } from "@/lib/scraper/live-adapter";

function safeSources(raw: string): SourceResult[] {
  try {
    const parsed = JSON.parse(raw || "[]") as SourceResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function ScraperPage() {
  await requireUser(["admin"]);
  const settings = await getSettings();
  const orgs = await prisma.organisation.findMany({ orderBy: { name: "asc" } });
  const runs = await prisma.scraperRun.findMany({ orderBy: { startedAt: "desc" }, take: 8 });
  return (
    <main className="stack">
      <div className="page-head">
        <h1>Scraper settings</h1>
        <p className="lede">
          Daily run at 05:00 Europe/London via cron. Use Run now after you change these settings. Demo events run
          unless SCRAPE_FIXTURES=0. Priority URLs are fetched only if they are https ICS or JSON-LD on the allowlist.
        </p>
      </div>
      <ScraperForm settings={settings} organisations={orgs} />
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
                    {sources.length === 0
                      ? "Demo harvest only"
                      : failed
                        ? `${sources.length - failed} ok, ${failed} failed`
                        : `${sources.length} ok`}
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
