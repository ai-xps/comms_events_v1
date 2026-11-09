import { CATEGORIES, type Category } from "../constants";
import { addDays, formatDate, londonDate, londonParts, startOfWeekMonday } from "../time";
import type { ScrapedEvent } from "./types";

export type CoverageDay = {
  /** YYYY-MM-DD in Europe/London */
  dayKey: string;
  label: string;
  total: number;
  bySource: { source: string; count: number; titles: string[] }[];
  byCategory: Record<Category, number>;
};

export type CoverageWindow = {
  from: string;
  to: string;
  days: CoverageDay[];
  total: number;
  byCategory: Record<Category, number>;
};

export type CoverageReport = {
  generatedAt: string;
  /** Rolling last 7 London days (yesterday-6 … yesterday relative framing kept as before). */
  lastWeek: CoverageWindow;
  /** Today through +6. */
  nextWeek: CoverageWindow;
  /** Calendar week Mon–Sun containing today (prompt-shaped “this week”). */
  thisWeek: CoverageWindow;
  /** Current calendar month, one row per day (empty days stay 0). */
  thisMonth: CoverageWindow & { year: number; month: number; label: string };
};

function emptyCategoryCounts(): Record<Category, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
}

function dayKeyLondon(date: Date): string {
  const p = londonParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function sourceLabel(event: Pick<ScrapedEvent, "sourceKey" | "fetchedFrom" | "organisationName">): string {
  if (event.fetchedFrom) {
    try {
      return new URL(event.fetchedFrom).hostname.replace(/^www\./, "");
    } catch {
      return event.fetchedFrom;
    }
  }
  if (event.sourceKey.startsWith("fixture-")) return "demo fixtures";
  const live = /^live:([^:]+):/.exec(event.sourceKey);
  if (live) return live[1]!.replace(/^www\./, "");
  return event.organisationName || "unknown";
}

function emptyDay(ref: Date): CoverageDay {
  return {
    dayKey: dayKeyLondon(ref),
    label: formatDate(ref),
    total: 0,
    bySource: [],
    byCategory: emptyCategoryCounts()
  };
}

function sumCategories(days: CoverageDay[]): Record<Category, number> {
  const totals = emptyCategoryCounts();
  for (const day of days) {
    for (const category of CATEGORIES) {
      totals[category] += day.byCategory[category];
    }
  }
  return totals;
}

function buildWindow(events: ScrapedEvent[], start: Date, dayCount: number): CoverageDay[] {
  const days: CoverageDay[] = [];
  for (let i = 0; i < dayCount; i++) {
    const dayStart = addDays(start, i);
    const p = londonParts(dayStart);
    const midnight = londonDate(p.year, p.month, p.day, 0, 0);
    days.push(emptyDay(midnight));
  }
  const index = new Map(days.map((d) => [d.dayKey, d]));

  for (const event of events) {
    const key = dayKeyLondon(event.startsAt);
    const bucket = index.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    bucket.byCategory[event.category] = (bucket.byCategory[event.category] ?? 0) + 1;
    const source = sourceLabel(event);
    let row = bucket.bySource.find((s) => s.source === source);
    if (!row) {
      row = { source, count: 0, titles: [] };
      bucket.bySource.push(row);
    }
    row.count += 1;
    if (row.titles.length < 8) row.titles.push(event.title);
  }

  for (const day of days) {
    day.bySource.sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));
  }
  return days;
}

function asWindow(days: CoverageDay[]): CoverageWindow {
  return {
    from: days[0]!.dayKey,
    to: days[days.length - 1]!.dayKey,
    days,
    total: days.reduce((n, d) => n + d.total, 0),
    byCategory: sumCategories(days)
  };
}

function daysInMonth(year: number, month: number): number {
  // month is 1–12; JS Date months are 0-based, day 0 = last day of previous month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Calendar coverage: last 7 days, next 7 days, this calendar week (Mon–Sun),
 * and every day of the current calendar month (Europe/London start dates).
 */
export function buildCoverageReport(events: ScrapedEvent[], now = new Date()): CoverageReport {
  const parts = londonParts(now);
  const today = londonDate(parts.year, parts.month, parts.day, 0, 0);
  const lastWeekStart = addDays(today, -7);
  const nextWeekStart = today;
  const thisWeekStart = startOfWeekMonday(today);
  const monthStart = londonDate(parts.year, parts.month, 1, 0, 0);
  const monthLength = daysInMonth(parts.year, parts.month);

  const lastWeekDays = buildWindow(events, lastWeekStart, 7);
  const nextWeekDays = buildWindow(events, nextWeekStart, 7);
  const thisWeekDays = buildWindow(events, thisWeekStart, 7);
  const monthDays = buildWindow(events, monthStart, monthLength);

  const monthFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    month: "long",
    year: "numeric"
  });

  return {
    generatedAt: now.toISOString(),
    lastWeek: asWindow(lastWeekDays),
    nextWeek: asWindow(nextWeekDays),
    thisWeek: asWindow(thisWeekDays),
    thisMonth: {
      ...asWindow(monthDays),
      year: parts.year,
      month: parts.month,
      label: monthFmt.format(today)
    }
  };
}

function formatCategoryLine(byCategory: Record<Category, number>): string {
  return CATEGORIES.map((c) => `${c} ${byCategory[c]}`).join(" · ");
}

function formatDayBlock(title: string, window: CoverageWindow, withCategories: boolean): string[] {
  const lines: string[] = [];
  lines.push(`${title} (${window.from} → ${window.to}) — ${window.total} events`);
  if (withCategories) {
    lines.push(`  by type: ${formatCategoryLine(window.byCategory)}`);
  }
  for (const day of window.days) {
    const catBits = withCategories
      ? ` [${CATEGORIES.filter((c) => day.byCategory[c] > 0)
          .map((c) => `${c}:${day.byCategory[c]}`)
          .join(", ") || "—"}]`
      : "";
    lines.push(`  ${day.label}: ${day.total}${catBits}`);
    for (const src of day.bySource) {
      lines.push(`    · ${src.source}: ${src.count} — ${src.titles.join("; ")}`);
    }
  }
  return lines;
}

/** Pretty console / log dump so a human can see capture + sources. */
export function formatCoverageReport(report: CoverageReport): string {
  const lines: string[] = [];
  lines.push(`Coverage report @ ${report.generatedAt}`);
  lines.push("");
  lines.push(...formatDayBlock("THIS WEEK (Mon–Sun)", report.thisWeek, true));
  lines.push("");
  lines.push(...formatDayBlock(`THIS MONTH — ${report.thisMonth.label}`, report.thisMonth, true));
  lines.push("");
  lines.push(...formatDayBlock("LAST 7 DAYS", report.lastWeek, false));
  lines.push("");
  lines.push(...formatDayBlock("NEXT 7 DAYS", report.nextWeek, true));
  return lines.join("\n");
}

/** Monday-based helper kept for tests / callers that want week alignment. */
export function weekStartingMonday(ref: Date): Date {
  return startOfWeekMonday(ref);
}
