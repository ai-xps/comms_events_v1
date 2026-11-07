"use client";

import { useState } from "react";
import { pctLabel } from "@/lib/insights/aggregate";
import type { HeatCell, NamedCount, WeekPoint } from "@/lib/insights/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["00–03", "04–07", "08–11", "12–15", "16–19", "20–23"];

/** Short readable week label from ISO date YYYY-MM-DD (e.g. 12 Mar). */
function weekBarLabel(weekStart: string): string {
  const d = new Date(`${weekStart}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return weekStart.slice(5);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function ChartCard({
  title,
  summary,
  children,
  table
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  table: React.ReactNode;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className="card chart-card">
      <div className="chart-head">
        <h2>{title}</h2>
        <button type="button" className="ghost" onClick={() => setAsTable((v) => !v)}>
          {asTable ? "Show chart" : "Show as table"}
        </button>
      </div>
      <p className="muted">{summary}</p>
      {asTable ? table : children}
    </section>
  );
}

export function LineBars({
  weeks,
  previous
}: {
  weeks: WeekPoint[];
  previous: WeekPoint[];
}) {
  const max = Math.max(1, ...weeks.map((w) => w.attendClicks), ...previous.map((w) => w.attendClicks));
  const width = 560;
  const height = 200;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const x = (i: number, n: number) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / max) * innerH;
  const line = (pts: WeekPoint[]) =>
    pts.map((w, i) => `${i === 0 ? "M" : "L"} ${x(i, pts.length)} ${y(w.attendClicks)}`).join(" ");
  const ticks = [0, Math.round(max / 2), max];
  return (
    <div className="chart-with-legend" data-testid="insights-line-legend">
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Attend clicks each week">
        <text x={4} y={padT + 4} className="chart-axis-label" fontSize="10" fill="currentColor">
          Attend clicks
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke="#e8e0e2" strokeWidth="1" />
            <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#6b5a5e">
              {t}
            </text>
          </g>
        ))}
        <path d={line(previous)} fill="none" stroke="#9a9094" strokeDasharray="4 4" strokeWidth="2" />
        <path d={line(weeks)} fill="none" stroke="#a8434d" strokeWidth="2.5" />
        {weeks.map((w, i) => (
          <g key={w.weekStart}>
            <circle cx={x(i, weeks.length)} cy={y(w.attendClicks)} r="3.5" fill="#a8434d" />
            <text x={x(i, weeks.length)} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b5a5e">
              {weekBarLabel(w.weekStart)}
            </text>
          </g>
        ))}
      </svg>
      <ul className="chart-legend" aria-label="Line colours">
        <li>
          <span className="legend-swatch legend-solid" aria-hidden="true" /> This period
        </li>
        <li>
          <span className="legend-swatch legend-dashed" aria-hidden="true" /> Previous period
        </li>
      </ul>
    </div>
  );
}

export function Stacked({ weeks }: { weeks: WeekPoint[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.attended + w.absent + w.unconfirmed));
  return (
    <div className="chart-with-legend" data-testid="insights-stack-legend">
      <p className="muted chart-scale-note">Bar height scale: 0 … {max} people</p>
      <div className="bar-row" role="img" aria-label="Attendance outcomes each week">
        {weeks.map((w) => {
          const total = w.attended + w.absent + w.unconfirmed;
          const h = (n: number) => `${(n / max) * 100}%`;
          return (
            <div key={w.weekStart} className="bar-col">
              <div className="bar-stack">
                <span className="seg attended" style={{ height: h(w.attended) }} />
                <span className="seg absent" style={{ height: h(w.absent) }} />
                <span className="seg unconfirmed" style={{ height: h(w.unconfirmed) }} />
              </div>
              <span className="bar-label">{weekBarLabel(w.weekStart)}</span>
              <span className="sr-only">{total} confirmed or waiting</span>
            </div>
          );
        })}
      </div>
      <ul className="chart-legend" aria-label="Attendance colours">
        <li>
          <span className="legend-swatch legend-attended" aria-hidden="true" /> Attended
        </li>
        <li>
          <span className="legend-swatch legend-absent" aria-hidden="true" /> Didn’t
        </li>
        <li>
          <span className="legend-swatch legend-unconfirmed" aria-hidden="true" /> Unconfirmed
        </li>
      </ul>
    </div>
  );
}

export function NamedBars({ rows, colours }: { rows: NamedCount[]; colours?: Record<string, string> }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="chart-with-legend">
      <p className="muted chart-scale-note">Counts — longest bar = {max}</p>
      <ul className="named-bars">
        {rows.map((r) => (
          <li key={r.key}>
            <span>
              {colours ? <span className="swatch" style={{ background: colours[r.key] ?? "#a8434d" }} /> : null}
              {r.suppressed ? `${r.label} (fewer than 3 people)` : r.label}
            </span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(r.count / max) * 100}%` }} />
            </span>
            <span className="num">{r.suppressed ? "<3" : r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Heatmap({ cells }: { cells: HeatCell[] }) {
  const max = Math.max(1, ...cells.map((c) => c.count));
  return (
    <div className="chart-with-legend" data-testid="insights-heat-legend">
      <div className="heat-grid" role="img" aria-label="Events by day and time">
        <span />
        {HOURS.map((h) => (
          <span key={h} className="heat-h">
            {h}
          </span>
        ))}
        {DAYS.map((day, weekday) => (
          <HeatRow key={day} day={day} weekday={weekday} cells={cells} max={max} />
        ))}
      </div>
      <p className="muted chart-scale-note" aria-label="Heatmap scale">
        Wash key: fewer → more (max {max})
      </p>
    </div>
  );
}

function HeatRow({
  day,
  weekday,
  cells,
  max
}: {
  day: string;
  weekday: number;
  cells: HeatCell[];
  max: number;
}) {
  return (
    <>
      <span className="heat-d">{day}</span>
      {HOURS.map((_, hourBucket) => {
        const count = cells.find((c) => c.weekday === weekday && c.hourBucket === hourBucket)?.count ?? 0;
        const t = count / max;
        return (
          <span
            key={hourBucket}
            className="heat-cell"
            title={`${day} ${HOURS[hourBucket]}: ${count}`}
            style={{ background: `rgba(168, 67, 77, ${0.08 + t * 0.8})` }}
          >
            <span className="sr-only">{count}</span>
          </span>
        );
      })}
    </>
  );
}

export function FunnelList({
  scraped,
  pending,
  published,
  discarded
}: {
  scraped: number;
  pending: number;
  published: number;
  discarded: number;
}) {
  const rows = [
    ["Scraped", scraped],
    ["Pending", pending],
    ["Published", published],
    ["Discarded", discarded]
  ] as const;
  const max = Math.max(1, scraped);
  return (
    <ul className="named-bars">
      {rows.map(([label, count]) => (
        <li key={label}>
          <span>{label}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </span>
          <span className="num">{count}</span>
        </li>
      ))}
    </ul>
  );
}

export function KpiStrip(
  kpis: {
    eventsPublished: number;
    attendClicks: number;
    activeMembers: number;
    attendanceRate: number | null;
    confirmationRate: number | null;
    noShowRate: number | null;
    fillRate: number | null;
    delegateShare: number | null;
    stars: number;
  }
) {
  const groups: {
    title: string;
    hint: string;
    items: [string, string][];
  }[] = [
    {
      title: "Reach",
      hint: "How wide Gather stretched in this period.",
      items: [
        ["Published events", String(kpis.eventsPublished)],
        ["Attend clicks", String(kpis.attendClicks)],
        ["Active members", String(kpis.activeMembers)],
        ["Stars", String(kpis.stars)]
      ]
    },
    {
      title: "Showing up",
      hint: "After people booked — did they go?",
      items: [
        ["Attendance", pctLabel(kpis.attendanceRate)],
        ["Confirmed", pctLabel(kpis.confirmationRate)],
        ["No-shows", pctLabel(kpis.noShowRate)]
      ]
    },
    {
      title: "Room & sharing",
      hint: "How full capped events were, and booking for someone else.",
      items: [
        ["Average fill", pctLabel(kpis.fillRate)],
        ["Booked for others", pctLabel(kpis.delegateShare)]
      ]
    }
  ];

  return (
    <div className="kpi-board" aria-label="Insight totals">
      {groups.map((group) => (
        <section key={group.title} className="kpi-group card">
          <header className="kpi-group-head">
            <h2>{group.title}</h2>
            <p className="muted">{group.hint}</p>
          </header>
          <ul className="kpi-grid">
            {group.items.map(([label, value]) => (
              <li key={label} className="kpi-tile">
                <p className="kpi-label">{label}</p>
                <p className="kpi-value">{value}</p>
                {label === "Average fill" ? (
                  <p className="muted kpi-tile-hint">
                    Bookings ÷ capacity, averaged over events with a cap.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
