import { CATEGORIES, type Category } from "./constants";
import { londonDate, londonParts } from "./time";

export type CalendarView = "month" | "week" | "day";
export type CalendarFormat = "" | "online" | "inperson";

/** A calendar date with no time or zone attached. Month is 1–12. */
export type DayKey = { year: number; month: number; day: number };

export type CalendarState = {
  view: CalendarView;
  category: Category | "";
  format: CalendarFormat;
  anchor: DayKey;
};

export type CalendarParams = {
  view?: string;
  category?: string;
  format?: string;
  d?: string;
  y?: string;
  m?: string;
};

const MIN_YEAR = 2020;
const MAX_YEAR = 2100;

function utcNoon(key: DayKey): Date {
  return new Date(Date.UTC(key.year, key.month - 1, key.day, 12));
}

function fromUtc(date: Date): DayKey {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function isValidDayKey(key: DayKey): boolean {
  if (![key.year, key.month, key.day].every(Number.isInteger)) return false;
  if (key.year < MIN_YEAR || key.year > MAX_YEAR) return false;
  const round = fromUtc(utcNoon(key));
  return round.year === key.year && round.month === key.month && round.day === key.day;
}

export function addDaysKey(key: DayKey, days: number): DayKey {
  const date = utcNoon(key);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtc(date);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayMondayFirst(key: DayKey): number {
  return (utcNoon(key).getUTCDay() + 6) % 7;
}

export function mondayOf(key: DayKey): DayKey {
  return addDaysKey(key, -weekdayMondayFirst(key));
}

export function sameDayKey(a: DayKey, b: DayKey): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function formatDayKey(key: DayKey): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${key.year}-${pad(key.month)}-${pad(key.day)}`;
}

export function dayKeyOf(date: Date): DayKey {
  const p = londonParts(date);
  return { year: p.year, month: p.month, day: p.day };
}

export function parseDayKey(value: string | undefined): DayKey | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const key = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return isValidDayKey(key) ? key : null;
}

/**
 * Turns untrusted search params into a calendar state. Anything invalid falls back to today,
 * so a hand-edited URL can never produce an unbounded query or a server error.
 */
export function parseCalendarParams(params: CalendarParams, today: DayKey): CalendarState {
  const view: CalendarView = params.view === "week" || params.view === "day" ? params.view : "month";
  const category = CATEGORIES.includes(params.category as Category) ? (params.category as Category) : "";
  const format: CalendarFormat = params.format === "online" || params.format === "inperson" ? params.format : "";

  let anchor = parseDayKey(params.d);
  if (!anchor && params.y !== undefined && params.m !== undefined) {
    const year = Number(params.y);
    const month = Number(params.m);
    const legacy = { year, month, day: 1 };
    if (isValidDayKey(legacy)) {
      anchor = year === today.year && month === today.month ? today : legacy;
    }
  }
  return { view, category, format, anchor: anchor ?? today };
}

export type CalendarRange = { from: Date; to: Date; days: DayKey[] };

/** Range boundaries are London midnights, so days stay correct across clock changes. */
export function rangeFor(view: CalendarView, anchor: DayKey): CalendarRange {
  let first: DayKey;
  let count: number;
  if (view === "day") {
    first = anchor;
    count = 1;
  } else if (view === "week") {
    first = mondayOf(anchor);
    count = 7;
  } else {
    first = mondayOf({ year: anchor.year, month: anchor.month, day: 1 });
    count = 42;
  }
  const days = Array.from({ length: count }, (_, i) => addDaysKey(first, i));
  const after = addDaysKey(first, count);
  return {
    from: londonDate(first.year, first.month, first.day, 0, 0),
    to: londonDate(after.year, after.month, after.day, 0, 0),
    days
  };
}

export function stepAnchor(view: CalendarView, anchor: DayKey, direction: 1 | -1): DayKey {
  if (view === "day") return addDaysKey(anchor, direction);
  if (view === "week") return addDaysKey(anchor, 7 * direction);
  const index = anchor.year * 12 + (anchor.month - 1) + direction;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return { year, month, day: Math.min(anchor.day, daysInMonth(year, month)) };
}

export type CalendarOverrides = Partial<CalendarState>;

/** Builds a calendar link. An empty category or format in the overrides removes that filter. */
export function calendarHref(state: CalendarState, overrides: CalendarOverrides = {}): string {
  const next = { ...state, ...overrides };
  const sp = new URLSearchParams();
  sp.set("view", next.view);
  if (next.category) sp.set("category", next.category);
  if (next.format) sp.set("format", next.format);
  sp.set("d", formatDayKey(next.anchor));
  return `/calendar?${sp.toString()}`;
}

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const weekdayName = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });

export function formatDayLabel(key: DayKey): string {
  const date = utcNoon(key);
  return `${weekdayName.format(date)} ${dayMonthYear.format(date)}`;
}

export function rangeLabel(view: CalendarView, anchor: DayKey): string {
  if (view === "day") return formatDayLabel(anchor);
  if (view === "month") return monthYear.format(utcNoon(anchor));
  const start = mondayOf(anchor);
  const end = addDaysKey(start, 6);
  if (start.year === end.year && start.month === end.month) {
    return `${start.day} to ${dayMonthYear.format(utcNoon(end))}`;
  }
  return `${dayMonthYear.format(utcNoon(start))} to ${dayMonthYear.format(utcNoon(end))}`;
}
