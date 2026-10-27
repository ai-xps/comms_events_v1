import Link from "next/link";
import { categoryAccentStyle } from "@/lib/category-art";
import {
  dayKeyOf,
  formatDayKey,
  formatDayLabel,
  sameDayKey,
  type DayKey
} from "@/lib/calendar";
import { formatTime, londonParts } from "@/lib/time";

const HOUR_START = 6;
const HOUR_END = 22;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const PX_PER_HOUR = 52;
const GRID_HEIGHT = HOURS.length * PX_PER_HOUR;

type GridEvent = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  category: string;
  placeName: string | null;
  online: boolean;
};

type LaidOut = GridEvent & {
  top: number;
  height: number;
  col: number;
  colCount: number;
  starred: boolean;
};

function minutesFromMidnight(date: Date): number {
  const p = londonParts(date);
  return p.hour * 60 + p.minute;
}

function layoutDay(events: (GridEvent & { starred: boolean })[]): LaidOut[] {
  const windowStart = HOUR_START * 60;
  const windowEnd = HOUR_END * 60;
  const prepared = events
    .map((event) => {
      const startMin = Math.max(windowStart, minutesFromMidnight(event.startsAt));
      const endRaw = minutesFromMidnight(event.endsAt);
      const endMin = Math.min(windowEnd, Math.max(startMin + 30, endRaw > startMin ? endRaw : startMin + 60));
      const top = ((startMin - windowStart) / 60) * PX_PER_HOUR;
      const height = Math.max(22, ((endMin - startMin) / 60) * PX_PER_HOUR);
      return { event, startMin, endMin, top, height };
    })
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  const colEnds: number[] = [];
  const withCols = prepared.map((item) => {
    let col = colEnds.findIndex((end) => end <= item.startMin);
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(item.endMin);
    } else {
      colEnds[col] = item.endMin;
    }
    return { ...item, col };
  });
  const colCount = Math.max(1, colEnds.length);
  return withCols.map(({ event, top, height, col }) => ({
    ...event,
    top,
    height,
    col,
    colCount,
    starred: event.starred
  }));
}

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function WeekTimeGrid({
  days,
  today,
  events,
  colours,
  canAdd,
  starredIds
}: {
  days: DayKey[];
  today: DayKey;
  events: GridEvent[];
  colours: Record<string, string>;
  canAdd?: boolean;
  starredIds?: Set<string>;
}) {
  const weekdayShort = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "Europe/London"
  });

  return (
    <div className="week-time-grid card" role="grid" aria-label="Week timetable">
      <div className="week-time-head" style={{ ["--week-cols" as string]: days.length }}>
        <div className="week-time-gutter" aria-hidden="true" />
        {days.map((day) => {
          const isToday = sameDayKey(day, today);
          const noon = new Date(Date.UTC(day.year, day.month - 1, day.day, 12));
          return (
            <div
              key={formatDayKey(day)}
              className="week-time-dayhead"
              aria-current={isToday ? "date" : undefined}
              data-today={isToday ? "true" : undefined}
            >
              <span className="week-time-weekday">{weekdayShort.format(noon)}</span>
              <span className="week-time-daynum">{day.day}</span>
              {canAdd ? (
                <Link className="day-add week-time-add" href={`/events/new?d=${formatDayKey(day)}`} aria-label={`Add event on ${formatDayLabel(day)}`}>
                  Add
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="week-time-scroll">
        <div className="week-time-body" style={{ ["--week-cols" as string]: days.length, height: GRID_HEIGHT }}>
          <div className="week-time-gutter" aria-hidden="true">
            {HOURS.map((hour) => (
              <div key={hour} className="week-time-hour" style={{ height: PX_PER_HOUR }}>
                <span>{hourLabel(hour)}</span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayEvents = events
              .filter((e) => sameDayKey(dayKeyOf(e.startsAt), day))
              .map((e) => ({ ...e, starred: Boolean(starredIds?.has(e.id)) }));
            const laid = layoutDay(dayEvents);
            const isToday = sameDayKey(day, today);
            return (
              <div
                key={formatDayKey(day)}
                className="week-time-col"
                data-today={isToday ? "true" : undefined}
              >
                {HOURS.map((hour) => (
                  <div key={hour} className="week-time-slot" style={{ height: PX_PER_HOUR }} />
                ))}
                {laid.map((event) => {
                  const colour = colours[event.category];
                  const widthPct = 100 / event.colCount;
                  const leftPct = event.col * widthPct;
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="week-time-event"
                      title={`${formatTime(event.startsAt)}–${formatTime(event.endsAt)} ${event.title}`}
                      style={{
                        ...categoryAccentStyle(colour),
                        top: event.top,
                        height: event.height,
                        left: `calc(${leftPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                        background: "var(--cat-soft)",
                        borderLeftColor: "var(--cat-edge)"
                      }}
                    >
                      <span className="week-time-event-title">
                        {event.starred ? "★ " : ""}
                        {event.title}
                      </span>
                      <span className="week-time-event-time">
                        {formatTime(event.startsAt)}
                        {event.online ? " · Online" : event.placeName ? ` · ${event.placeName}` : ""}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {events.length === 0 ? (
        <p className="muted week-time-empty">No events in this range. Try All types.</p>
      ) : null}
    </div>
  );
}
