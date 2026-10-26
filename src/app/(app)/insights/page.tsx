import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { insightsScope } from "@/lib/policy";
import { parseInsightsParams, insightsHref } from "@/lib/insights/period";
import { loadRawInsights } from "@/lib/insights/load";
import { aggregateInsights, pctLabel } from "@/lib/insights/aggregate";
import { shareSummary } from "@/lib/insights/share";
import { CATEGORIES } from "@/lib/constants";
import {
  ChartCard,
  FunnelList,
  Heatmap,
  KpiStrip,
  LineBars,
  NamedBars,
  Stacked
} from "@/components/insights/Charts";
import { ExportShare } from "@/components/insights/ExportShare";
import { formatDate } from "@/lib/time";

export default async function InsightsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const requested = parseInsightsParams(params);
  const scope = insightsScope(user, requested.cellId);
  if (!scope) {
    return (
      <main className="stack">
        <h1>Insights</h1>
        <p>Insights is for admins and cell leaders.</p>
        <p>
          <Link href="/calendar">Back to calendar</Link>
        </p>
      </main>
    );
  }
  const filters = { ...requested, cellId: scope.kind === "cell" ? scope.cellId : requested.cellId };
  const [raw, settings, cells] = await Promise.all([
    loadRawInsights(scope, filters),
    getSettings(),
    user.role === "admin" ? prisma.cell.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([])
  ]);
  const data = aggregateInsights(raw, filters, scope);
  const origin = process.env.APP_ORIGIN ?? "http://localhost:3000";
  const text = shareSummary(data, origin, filters);
  const query: Record<string, string> = {
    period: filters.preset,
    category: filters.category,
    format: filters.format,
    cell: filters.cellId ?? ""
  };

  return (
    <main className="stack">
      <div className="page-head insights-head">
        <h1>Insights</h1>
        <p className="lede">
          {scope.kind === "region" ? `${settings.locationLabel} region` : "Your cell"} · {formatDate(filters.from)} to{" "}
          {formatDate(new Date(filters.to.getTime() - 1))}. Charts are totals. Groups of fewer than three people are
          hidden.
        </p>
      </div>

      <form className="insights-toolbar" method="get">
        <label>
          Period
          <select name="period" defaultValue={filters.preset}>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="year">This year</option>
            <option value="custom">Custom dates</option>
          </select>
        </label>
        <label>
          Type
          <select name="category" defaultValue={filters.category}>
            <option value="">All types</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Format
          <select name="format" defaultValue={filters.format}>
            <option value="">Any format</option>
            <option value="inperson">In person</option>
            <option value="online">Online</option>
          </select>
        </label>
        {user.role === "admin" ? (
          <label>
            Cell
            <select name="cell" defaultValue={filters.cellId ?? ""}>
              <option value="">All cells</option>
              {cells.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {filters.preset === "custom" ? (
          <>
            <label>
              From
              <input type="date" name="from" defaultValue={filters.from.toISOString().slice(0, 10)} />
            </label>
            <label>
              To
              <input type="date" name="to" defaultValue={new Date(filters.to.getTime() - 1).toISOString().slice(0, 10)} />
            </label>
          </>
        ) : null}
        <button type="submit">Apply</button>
      </form>

      <KpiStrip {...data.kpis} />

      <h2 className="insights-section-title">Activity</h2>
      <ChartCard
        title="Attend clicks each week"
        summary="Solid line is this period. Dashed line is the same length of time before it."
        table={<WeekTable weeks={data.weeks} />}
      >
        <LineBars weeks={data.weeks} previous={data.previousWeeks} />
      </ChartCard>

      <ChartCard
        title="Attendance outcomes"
        summary="Attended, didn't attend, and still unconfirmed, by the week the event started."
        table={<WeekTable weeks={data.weeks} outcomes />}
      >
        <Stacked weeks={data.weeks} />
      </ChartCard>

      <h2 className="insights-section-title">Who and where</h2>
      <ChartCard
        title="By event type"
        summary="Attend clicks in this period, coloured as on the calendar."
        table={<CountTable rows={data.byCategory} />}
      >
        <NamedBars rows={data.byCategory} colours={settings.colours} />
      </ChartCard>

      <ChartCard
        title="Online and in person"
        summary="Attend clicks split by format."
        table={<CountTable rows={data.byFormat} />}
      >
        <NamedBars rows={data.byFormat} />
      </ChartCard>

      {scope.kind === "region" ? (
        <ChartCard
          title="By cell"
          summary="A cell with fewer than three people is shown as fewer than 3, so no one can be singled out."
          table={<CountTable rows={data.byCell} />}
        >
          <NamedBars rows={data.byCell} />
        </ChartCard>
      ) : null}

      <ChartCard
        title="When events happen"
        summary="Published events in this period, by weekday and time of day (Europe/London)."
        table={<HeatTable cells={data.heatmap} />}
      >
        <Heatmap cells={data.heatmap} />
      </ChartCard>

      <h2 className="insights-section-title">Pipeline and capacity</h2>
      <ChartCard
        title="Review pipeline"
        summary="Scraped events created in this period, and where they ended up. Failed feeds on a run are listed below."
        table={
          <CountTable
            rows={[
              { key: "s", label: "Scraped", count: data.funnel.scraped },
              { key: "p", label: "Pending", count: data.funnel.pending },
              { key: "u", label: "Published", count: data.funnel.published },
              { key: "d", label: "Discarded", count: data.funnel.discarded }
            ]}
          />
        }
      >
        <FunnelList {...data.funnel} />
        {data.scraperRuns.length ? (
          <ul className="muted">
            {data.scraperRuns.slice(0, 5).map((run) => (
              <li key={run.startedAt}>
                {run.trigger.toLowerCase()} · created {run.createdCount} · {run.status}
                {run.failedFeeds ? ` · ${run.failedFeeds} feed${run.failedFeeds === 1 ? "" : "s"} failed` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </ChartCard>

      <section className="card">
        <h2>Busiest events</h2>
        <p className="muted">Fill is bookings ÷ capacity for that event (— if no cap).</p>
        {data.topEvents.length === 0 ? (
          <p className="muted">No published events in this period.</p>
        ) : (
          <div className="table-wrap">
            <table className="data stack-sm">
              <thead>
                <tr>
                  <th>Event</th>
                  <th className="num">Bookings</th>
                  <th className="num">Fill</th>
                  <th className="num">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {data.topEvents.map((e) => (
                  <tr key={e.id}>
                    <td data-label="Event">
                      <Link href={`/events/${e.id}`}>{e.title}</Link>
                    </td>
                    <td className="num" data-label="Bookings">
                      {e.bookings}
                      {e.capacity != null ? ` / ${e.capacity}` : ""}
                    </td>
                    <td className="num" data-label="Fill">
                      {pctLabel(e.fillPct)}
                    </td>
                    <td className="num" data-label="Attendance">
                      {pctLabel(e.attendancePct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ExportShare data={data} text={text} query={query} />
      <p className="muted">
        Bookmark this view: <Link href={insightsHref(filters)}>current filters</Link>.
      </p>
    </main>
  );
}

function WeekTable({ weeks, outcomes }: { weeks: { weekStart: string; attendClicks: number; attended: number; absent: number; unconfirmed: number }[]; outcomes?: boolean }) {
  return (
    <div className="table-wrap">
      <table className="data stack-sm">
        <thead>
          <tr>
            <th>Week starting</th>
            {outcomes ? (
              <>
                <th className="num">Attended</th>
                <th className="num">Didn't attend</th>
                <th className="num">Unconfirmed</th>
              </>
            ) : (
              <th className="num">Attend clicks</th>
            )}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.weekStart}>
              <td data-label="Week">{w.weekStart}</td>
              {outcomes ? (
                <>
                  <td className="num">{w.attended}</td>
                  <td className="num">{w.absent}</td>
                  <td className="num">{w.unconfirmed}</td>
                </>
              ) : (
                <td className="num">{w.attendClicks}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CountTable({ rows }: { rows: { key: string; label: string; count: number; suppressed?: boolean }[] }) {
  return (
    <div className="table-wrap">
      <table className="data stack-sm">
        <thead>
          <tr>
            <th>Group</th>
            <th className="num">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.suppressed ? `${r.label} (fewer than 3 people)` : r.label}</td>
              <td className="num">{r.suppressed ? "<3" : r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeatTable({ cells }: { cells: { weekday: number; hourBucket: number; count: number }[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["00–03", "04–07", "08–11", "12–15", "16–19", "20–23"];
  return (
    <div className="table-wrap">
      <table className="data stack-sm">
        <thead>
          <tr>
            <th>Day</th>
            <th>Hours</th>
            <th className="num">Events</th>
          </tr>
        </thead>
        <tbody>
          {cells
            .filter((c) => c.count)
            .map((c) => (
              <tr key={`${c.weekday}-${c.hourBucket}`}>
                <td>{days[c.weekday]}</td>
                <td>{hours[c.hourBucket]}</td>
                <td className="num">{c.count}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
