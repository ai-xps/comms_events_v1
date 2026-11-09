import { CATEGORIES } from "@/lib/constants";
import { dayKeyOf, formatDayKey, mondayOf } from "@/lib/calendar";
import { londonParts, londonWeekday } from "@/lib/time";
import type { InsightsScope } from "@/lib/policy";
import type {
  Funnel,
  HeatCell,
  InsightsData,
  InsightsFilters,
  Kpis,
  NamedCount,
  RawBooking,
  RawEvent,
  RawInsights,
  TopEvent,
  WeekPoint
} from "./types";

const MIN_GROUP = 3;
const HOUR_BUCKETS = 6;

function rate(num: number, den: number): number | null {
  if (den <= 0) return null;
  return Math.round((num / den) * 1000) / 1000;
}

function weekStartOf(date: Date): string {
  return formatDayKey(mondayOf(dayKeyOf(date)));
}

function inWindow(date: Date, from: Date, to: Date): boolean {
  return date >= from && date < to;
}

function emptyWeeks(from: Date, to: Date): WeekPoint[] {
  const weeks: WeekPoint[] = [];
  let key = mondayOf(dayKeyOf(from));
  const last = mondayOf(dayKeyOf(new Date(to.getTime() - 1)));
  while (key.year < last.year || (key.year === last.year && (key.month < last.month || (key.month === last.month && key.day <= last.day)))) {
    weeks.push({ weekStart: formatDayKey(key), attendClicks: 0, attended: 0, absent: 0, unconfirmed: 0 });
    const next = new Date(Date.UTC(key.year, key.month - 1, key.day + 7));
    key = { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() };
  }
  return weeks;
}

function eventMatches(event: RawEvent, filters: InsightsFilters): boolean {
  if (filters.category && event.category !== filters.category) return false;
  if (filters.format === "online" && !event.online) return false;
  if (filters.format === "inperson" && event.online) return false;
  return true;
}

function kpisFor(published: RawEvent[], bookings: RawBooking[], members: RawInsights["members"], stars: number, now: Date): Kpis {
  const past = published.filter((e) => e.endsAt < now);
  const pastIds = new Set(past.map((e) => e.id));
  const pastBookings = bookings.filter((b) => pastIds.has(b.eventId));
  const attended = pastBookings.filter((b) => b.attendance === "ATTENDED").length;
  const absent = pastBookings.filter((b) => b.attendance === "ABSENT").length;
  const confirmed = attended + absent;
  const withCapacity = published.filter((e) => e.capacity && e.capacity > 0);
  const fillSum = withCapacity.reduce((sum, e) => {
    const n = bookings.filter((b) => b.eventId === e.id).length;
    return sum + n / (e.capacity as number);
  }, 0);
  const delegates = bookings.filter((b) => b.bookedById !== b.userId).length;
  return {
    eventsPublished: published.length,
    attendClicks: bookings.length,
    activeMembers: members.filter((m) => m.active).length,
    attendanceRate: rate(attended, confirmed),
    confirmationRate: rate(confirmed, pastBookings.length),
    noShowRate: rate(absent, confirmed),
    fillRate: withCapacity.length ? Math.round((fillSum / withCapacity.length) * 1000) / 1000 : null,
    delegateShare: rate(delegates, bookings.length),
    stars
  };
}

function weekSeries(from: Date, to: Date, published: RawEvent[], bookings: RawBooking[]): WeekPoint[] {
  const weeks = emptyWeeks(from, to);
  const index = new Map(weeks.map((w) => [w.weekStart, w]));
  for (const b of bookings) {
    const w = index.get(weekStartOf(b.bookedAt));
    if (w) w.attendClicks += 1;
  }
  const byEvent = new Map(published.map((e) => [e.id, e]));
  for (const b of bookings) {
    const event = byEvent.get(b.eventId);
    if (!event) continue;
    const w = index.get(weekStartOf(event.startsAt));
    if (!w) continue;
    if (b.attendance === "ATTENDED") w.attended += 1;
    else if (b.attendance === "ABSENT") w.absent += 1;
    else w.unconfirmed += 1;
  }
  return weeks;
}

function funnelFor(events: RawEvent[], from: Date, to: Date): Funnel {
  const created = events.filter((e) => inWindow(e.createdAt, from, to) && e.sourceKey);
  return {
    scraped: created.length,
    pending: created.filter((e) => e.status === "PENDING").length,
    published: created.filter((e) => e.status === "PUBLISHED").length,
    discarded: created.filter((e) => e.status === "DISCARDED").length
  };
}

export function aggregateInsights(
  raw: RawInsights,
  filters: InsightsFilters,
  scope: InsightsScope,
  now = new Date()
): InsightsData {
  const publishedAll = raw.events.filter((e) => e.status === "PUBLISHED" && eventMatches(e, filters));
  const published = publishedAll.filter((e) => inWindow(e.startsAt, filters.from, filters.to));
  const publishedIds = new Set(published.map((e) => e.id));
  const bookings = raw.bookings.filter((b) => publishedIds.has(b.eventId));
  const stars = raw.stars.filter((s) => publishedIds.has(s.eventId)).length;

  const byCategory: NamedCount[] = CATEGORIES.map((c) => ({
    key: c,
    label: c,
    count: bookings.filter((b) => published.find((e) => e.id === b.eventId)?.category === c).length
  }));

  const byFormat: NamedCount[] = [
    {
      key: "inperson",
      label: "In person",
      count: bookings.filter((b) => published.find((e) => e.id === b.eventId)?.online === false).length
    },
    {
      key: "online",
      label: "Online",
      count: bookings.filter((b) => published.find((e) => e.id === b.eventId)?.online === true).length
    }
  ];

  const cellMap = new Map<string, { label: string; people: Set<string>; count: number }>();
  for (const b of bookings) {
    const key = b.userCellId ?? "none";
    const row = cellMap.get(key) ?? { label: b.cellName || "Unassigned", people: new Set<string>(), count: 0 };
    row.people.add(b.userId);
    row.count += 1;
    cellMap.set(key, row);
  }
  const byCell: NamedCount[] = [...cellMap.entries()].map(([key, row]) => {
    const small = row.people.size > 0 && row.people.size < MIN_GROUP;
    return { key, label: row.label, count: small ? 0 : row.count, suppressed: small };
  });

  const heatmap: HeatCell[] = [];
  const heat = new Map<string, number>();
  for (const e of published) {
    const p = londonParts(e.startsAt);
    const weekday = (londonWeekday(e.startsAt) + 6) % 7;
    const hourBucket = Math.min(HOUR_BUCKETS - 1, Math.floor(p.hour / 4));
    const k = `${weekday}:${hourBucket}`;
    heat.set(k, (heat.get(k) ?? 0) + 1);
  }
  for (let weekday = 0; weekday < 7; weekday += 1) {
    for (let hourBucket = 0; hourBucket < HOUR_BUCKETS; hourBucket += 1) {
      heatmap.push({ weekday, hourBucket, count: heat.get(`${weekday}:${hourBucket}`) ?? 0 });
    }
  }

  const topEvents: TopEvent[] = published
    .map((e) => {
      const eventBookings = bookings.filter((b) => b.eventId === e.id);
      const confirmed = eventBookings.filter((b) => b.attendance === "ATTENDED" || b.attendance === "ABSENT");
      const attended = eventBookings.filter((b) => b.attendance === "ATTENDED").length;
      return {
        id: e.id,
        title: e.title,
        startsAt: e.startsAt.toISOString(),
        bookings: eventBookings.length,
        capacity: e.capacity,
        fillPct: e.capacity && e.capacity > 0 ? rate(eventBookings.length, e.capacity) : null,
        attendancePct: rate(attended, confirmed.length)
      };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10);

  const prevSpan = filters.to.getTime() - filters.from.getTime();
  const prevFrom = new Date(filters.from.getTime() - prevSpan);
  const prevPublished = publishedAll.filter((e) => inWindow(e.startsAt, prevFrom, filters.from));
  const prevIds = new Set(prevPublished.map((e) => e.id));
  const prevBookings = raw.bookings.filter((b) => prevIds.has(b.eventId));

  return {
    generatedAt: now.toISOString(),
    schemaVersion: 1,
    scope,
    filters: {
      from: filters.from.toISOString(),
      to: filters.to.toISOString(),
      preset: filters.preset,
      category: filters.category,
      format: filters.format,
      cellId: filters.cellId
    },
    kpis: kpisFor(published, bookings, raw.members, stars, now),
    weeks: weekSeries(filters.from, filters.to, published, bookings),
    previousWeeks: weekSeries(prevFrom, filters.from, prevPublished, prevBookings),
    byCategory,
    byFormat,
    byCell,
    heatmap,
    funnel: funnelFor(raw.events.filter((e) => eventMatches(e, filters)), filters.from, filters.to),
    scraperRuns: raw.runs
      .filter((r) => inWindow(r.startedAt, filters.from, filters.to))
      .map((r) => ({
        startedAt: r.startedAt.toISOString(),
        trigger: r.trigger,
        createdCount: r.createdCount,
        status: r.status,
        failedFeeds: failedFeedCount(r.sourceResults)
      })),
    topEvents
  };
}

function failedFeedCount(raw?: string): number {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as { ok?: boolean }[];
    return Array.isArray(parsed) ? parsed.filter((row) => row && row.ok === false).length : 0;
  } catch {
    return 0;
  }
}

export function pctLabel(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 100)}%`;
}
