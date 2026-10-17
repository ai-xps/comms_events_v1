import Link from "next/link";
import { requireUser, canReview } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CATEGORIES } from "@/lib/constants";
import { dayKeyOf, parseCalendarParams, rangeFor, type CalendarParams } from "@/lib/calendar";
import { EventsMap } from "@/components/EventsMap";
import { FilterBar } from "@/components/calendar/FilterBar";
import { RangeNav } from "@/components/calendar/RangeNav";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { DatedList } from "@/components/calendar/DatedList";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<CalendarParams> }) {
  const user = await requireUser();
  const settings = await getSettings();
  const today = dayKeyOf(new Date());
  const state = parseCalendarParams(await searchParams, today);
  const range = rangeFor(state.view, state.anchor);
  const enabledCategories = CATEGORIES.filter((c) => settings.enabled[c]);

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startsAt: { gte: range.from, lt: range.to },
      category: state.category ? state.category : { in: enabledCategories },
      ...(state.format === "online" ? { online: true } : {}),
      ...(state.format === "inperson" ? { online: false } : {})
    },
    orderBy: { startsAt: "asc" }
  });

  const stars = await prisma.star.findMany({
    where: { userId: user.id, event: { status: "PUBLISHED", startsAt: { gte: new Date() } } },
    include: { event: true }
  });

  const pins = events
    .filter((e): e is typeof e & { lat: number; lng: number } => !e.online && e.lat != null && e.lng != null)
    .map((e) => ({ id: e.id, title: e.title, lat: e.lat, lng: e.lng }));

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

      <FilterBar state={state} categories={enabledCategories} colours={settings.colours} />
      <RangeNav state={state} today={today} />

      {state.view === "month" ? (
        <MonthGrid state={state} days={range.days} today={today} events={events} colours={settings.colours} />
      ) : (
        <DatedList
          days={range.days}
          today={today}
          events={events.map((e) => ({
            id: e.id,
            title: e.title,
            startsAt: e.startsAt,
            category: e.category,
            placeName: e.placeName,
            online: e.online,
            sourceKey: e.sourceKey
          }))}
          colours={settings.colours}
        />
      )}

      <section className="card map-card">
        <h2 className="map-heading">Map</h2>
        <EventsMap pins={pins} />
      </section>
    </main>
  );
}
