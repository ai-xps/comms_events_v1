import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CATEGORIES, type Category } from "@/lib/constants";
import {
  addDays,
  formatTime,
  londonDate,
  londonParts,
  monthGrid,
  sameLondonDay,
  startOfWeekMonday
} from "@/lib/time";
import { canReview } from "@/lib/auth";
import { EventsMap } from "@/components/EventsMap";

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string; category?: string; format?: string; y?: string; m?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const settings = await getSettings();
  const view = params.view === "week" || params.view === "day" ? params.view : "month";
  const category = CATEGORIES.includes(params.category as Category)
    ? (params.category as Category)
    : "";
  const format = params.format === "online" || params.format === "inperson" ? params.format : "";
  const now = londonParts(new Date());
  const year = Number(params.y) || now.year;
  const month = Number(params.m) || now.month;
  const first = londonDate(year, month, 1, 0, 0);
  const from = view === "day" ? first : view === "week" ? startOfWeekMonday(first) : monthGrid(year, month)[0][0];
  const to =
    view === "day"
      ? addDays(from, 1)
      : view === "week"
        ? addDays(from, 7)
        : addDays(monthGrid(year, month)[5][6], 1);

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startsAt: { gte: from, lt: to },
      category: category
        ? category
        : { in: CATEGORIES.filter((c) => settings.enabled[c]) },
      ...(format === "online" ? { online: true } : {}),
      ...(format === "inperson" ? { online: false } : {})
    },
    orderBy: { startsAt: "asc" }
  });

  const stars = await prisma.star.findMany({
    where: { userId: user.id, event: { status: "PUBLISHED", startsAt: { gte: new Date() } } },
    include: { event: true }
  });

  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const qs = (extra: Record<string, string>) => {
    const sp = new URLSearchParams();
    sp.set("view", view);
    if (category) sp.set("category", category);
    if (format) sp.set("format", format);
    sp.set("y", String(extra.y ?? year));
    sp.set("m", String(extra.m ?? month));
    return `?${sp.toString()}`;
  };

  return (
    <main>
      <div className="page-head">
        <h1>Calendar</h1>
        <p className="lede">
          Upcoming {settings.locationLabel} events. Filter by type, then open an event to click Attend.
        </p>
        {canReview(user) ? (
          <p>
            <Link className="button secondary" href="/events/new">
              Add event
            </Link>
          </p>
        ) : null}
      </div>

      {stars.length ? (
        <section className="card starred-strip">
          <h2>Starred</h2>
          <div className="list">
            {stars.map((star) => (
              <Link key={star.id} href={`/events/${star.event.id}`}>
                {star.event.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="filters" role="group" aria-label="Event type">
        <FilterChip href={qs({})} pressed={!category} label="All types" />
        {CATEGORIES.filter((c) => settings.enabled[c]).map((c) => (
          <a
            key={c}
            className="chip"
            href={`?view=${view}&category=${encodeURIComponent(c)}&format=${format}&y=${year}&m=${month}`}
            aria-pressed={category === c}
          >
            <span className="swatch" style={{ background: settings.colours[c] }} />
            {c}
          </a>
        ))}
      </div>
      <div className="filters" role="group" aria-label="Online or in person">
        <FilterChip href={`?view=${view}&category=${category}&y=${year}&m=${month}`} pressed={!format} label="Any format" />
        <FilterChip
          href={`?view=${view}&category=${category}&format=inperson&y=${year}&m=${month}`}
          pressed={format === "inperson"}
          label="In person"
        />
        <FilterChip
          href={`?view=${view}&category=${category}&format=online&y=${year}&m=${month}`}
          pressed={format === "online"}
          label="Online"
        />
      </div>
      <div className="row" style={{ marginBottom: "var(--space-4)" }}>
        <Link className="chip" href={`?view=month&category=${category}&format=${format}&y=${year}&m=${month}`} aria-pressed={view === "month"}>
          Month
        </Link>
        <Link className="chip" href={`?view=week&category=${category}&format=${format}&y=${year}&m=${month}`} aria-pressed={view === "week"}>
          Week
        </Link>
        <Link className="chip" href={`?view=day&category=${category}&format=${format}&y=${year}&m=${month}`} aria-pressed={view === "day"}>
          Day
        </Link>
        <Link className="button ghost" href={qs({ y: String(prevMonth.y), m: String(prevMonth.m) })}>
          Previous
        </Link>
        <Link className="button ghost" href={qs({ y: String(nextMonth.y), m: String(nextMonth.m) })}>
          Next
        </Link>
      </div>

      {view === "month" ? (
        <MonthTable year={year} month={month} events={events} colours={settings.colours} />
      ) : (
        <DatedList events={events} colours={settings.colours} caption={view === "week" ? "Week view" : "Day view"} />
      )}

      <section className="card map-card">
        <h2 className="map-heading">Map</h2>
        <EventsMap
          pins={events
            .filter((e): e is typeof e & { lat: number; lng: number } => e.lat != null && e.lng != null)
            .map((e) => ({ id: e.id, title: e.title, lat: e.lat, lng: e.lng }))}
        />
      </section>
    </main>
  );
}

function FilterChip({ href, pressed, label }: { href: string; pressed: boolean; label: string }) {
  return (
    <a className="chip" href={href} aria-pressed={pressed}>
      {label}
    </a>
  );
}

function MonthTable({
  year,
  month,
  events,
  colours
}: {
  year: number;
  month: number;
  events: { id: string; title: string; startsAt: Date; category: string }[];
  colours: Record<string, string>;
}) {
  const weeks = monthGrid(year, month);
  const label = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Europe/London" }).format(
    londonDate(year, month, 1, 12, 0)
  );
  return (
    <table className="calendar">
      <caption>{label}</caption>
      <thead>
        <tr>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <th key={d} scope="col">
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, i) => (
          <tr key={i}>
            {week.map((day) => {
              const parts = londonParts(day);
              const daysEvents = events.filter((e) => sameLondonDay(e.startsAt, day));
              return (
                <td key={day.toISOString()}>
                  <div className="daynum">{parts.day}</div>
                  {daysEvents.map((event) => {
                    const labelText = `${formatTime(event.startsAt)} ${event.title}`;
                    return (
                      <Link
                        key={event.id}
                        className="event-link"
                        href={`/events/${event.id}`}
                        title={labelText}
                        style={{ ["--cat" as string]: colours[event.category] }}
                      >
                        <span className="sr-only">{event.category}: </span>
                        {labelText}
                      </Link>
                    );
                  })}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DatedList({
  events,
  colours,
  caption
}: {
  events: { id: string; title: string; startsAt: Date; category: string; placeName: string | null; online: boolean }[];
  colours: Record<string, string>;
  caption: string;
}) {
  const groups = new Map<string, typeof events>();
  for (const event of events) {
    const key = event.startsAt.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/London"
    });
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }

  return (
    <section>
      <h2>{caption}</h2>
      {events.length === 0 ? <p className="muted">No events in this view.</p> : null}
      <div className="dated-list">
        {[...groups.entries()].map(([dateLabel, dayEvents]) => (
          <div key={dateLabel} className="dated-group">
            <h3>{dateLabel}</h3>
            <div className="list">
              {dayEvents.map((event) => (
                <Link key={event.id} className="card" href={`/events/${event.id}`}>
                  <span className="swatch" style={{ background: colours[event.category] }} /> {event.category}
                  <h3>{event.title}</h3>
                  <p className="muted">
                    {formatTime(event.startsAt)} · {event.online ? "Online" : event.placeName}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
