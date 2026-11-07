import { CATEGORIES, type Category } from "@/lib/constants";
import { dayKeyOf, parseDayKey, addDaysKey, formatDayKey } from "@/lib/calendar";
import { londonDate } from "@/lib/time";
import type { InsightsFilters, InsightsFormat, PeriodPreset } from "./types";

const MS_DAY = 24 * 60 * 60 * 1000;

export function parseInsightsParams(
  params: Record<string, string | undefined>,
  now = new Date()
): InsightsFilters {
  const preset: PeriodPreset =
    params.period === "90" || params.period === "year" || params.period === "custom" ? params.period : "30";
  const category = CATEGORIES.includes(params.category as Category) ? (params.category as Category) : "";
  const format: InsightsFormat = params.format === "online" || params.format === "inperson" ? params.format : "";
  const cellId = params.cell && params.cell.length > 8 ? params.cell : null;

  const today = dayKeyOf(now);
  let from: Date;
  let to: Date;
  if (preset === "custom") {
    const fromKey = parseDayKey(params.from) ?? addDaysKey(today, -30);
    const toKey = parseDayKey(params.to) ?? today;
    from = londonDate(fromKey.year, fromKey.month, fromKey.day, 0, 0);
    const toExclusive = addDaysKey(toKey, 1);
    to = londonDate(toExclusive.year, toExclusive.month, toExclusive.day, 0, 0);
    if (to <= from) {
      to = londonDate(today.year, today.month, today.day, 0, 0);
      to = new Date(to.getTime() + MS_DAY);
      from = new Date(to.getTime() - 30 * MS_DAY);
    }
  } else if (preset === "year") {
    from = londonDate(today.year, 1, 1, 0, 0);
    to = now;
  } else {
    const days = preset === "90" ? 90 : 30;
    to = now;
    from = new Date(now.getTime() - days * MS_DAY);
  }
  return { from, to, preset, category, format, cellId };
}

export function previousWindow(from: Date, to: Date): { from: Date; to: Date } {
  const span = Math.max(to.getTime() - from.getTime(), MS_DAY);
  return { from: new Date(from.getTime() - span), to: from };
}

export function insightsHref(filters: InsightsFilters, extra: Record<string, string> = {}): string {
  const sp = new URLSearchParams();
  sp.set("period", filters.preset);
  if (filters.category) sp.set("category", filters.category);
  if (filters.format) sp.set("format", filters.format);
  if (filters.cellId) sp.set("cell", filters.cellId);
  if (filters.preset === "custom") {
    sp.set("from", formatDayKey(dayKeyOf(filters.from)));
    sp.set("to", formatDayKey(addDaysKey(dayKeyOf(filters.to), -1)));
  }
  for (const [k, v] of Object.entries(extra)) {
    if (v) sp.set(k, v);
    else sp.delete(k);
  }
  const q = sp.toString();
  return q ? `/insights?${q}` : "/insights";
}
