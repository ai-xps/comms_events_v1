import Link from "next/link";
import { GatherMark } from "@/components/GatherMark";
import { requireUser, canReview } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CATEGORIES } from "@/lib/constants";
import { dayKeyOf, parseCalendarParams, rangeFor, type CalendarParams } from "@/lib/calendar";
import { EventsMap } from "@/components/EventsMap";
import { FilterBar } from "@/components/calendar/FilterBar";
import { RangeNav } from "@/components/calendar/RangeNav";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { WeekTimeGrid } from "@/components/calendar/WeekTimeGrid";

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
      category: state.categories.length ? { in: state.categories } : { in: enabledCategories },
      ...(state.format === "online" ? { online: true } : {}),
      ...(state.format === "inperson" ? { online: false } : {})
    },
    orderBy: { startsAt: "asc" }
  });

  const stars = await prisma.star.findMany({
    where: { userId: user.id, event: { status: "PUBLISHED", startsAt: { gte: new Date() } } },
    include: { event: true }
  });
  const starredIds = new Set(stars.map((s) => s.eventId));

  const pins = events
    .filter((e): e is typeof e & { lat: number; lng: number } => !e.online && e.lat != null && e.lng != null)
    .map((e) => ({ id: e.id, title: e.title, lat: e.lat, lng: e.lng }));

  return (
    <main className="calendar-page">
      <div className="page-head calendar-head">
        <div className="calendar-head-row">
          <div className="calendar-head-brand">
            <GatherMark size="md" />
            <div>
              <h1>Calendar</h1>
              <p className="lede">
                Upcoming {settings.locationLabel} events — filter, then open one to Attend.
              </p>
            </div>
          </div>
          {canReview(user) ? (
            <Link className="button calendar-add" href="/events/new">
              Add event
            </Link>
          ) : null}
        </div>
      </div>

      {stars.length ? (
        <section className="card starred-strip" aria-label="Saved events">
          <h2>Saved ★</h2>
          <p className="muted starred-strip-lede">Events you starred — open one to Attend.</p>
          <div className="list">
            {stars.map((star) => (
              <Link key={star.id} href={`/events/${star.event.id}`}>
                {star.event.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card calendar-stage">
        <FilterBar state={state} categories={enabledCategories} colours={settings.colours} />
        <RangeNav state={state} today={today} />

        {state.view === "month" ? (
          <MonthGrid
            state={state}
            days={range.days}
            today={today}
            events={events}
            colours={settings.colours}
            canAdd={canReview(user)}
            starredIds={starredIds}
          />
        ) : (
          <WeekTimeGrid
            days={range.days}
            today={today}
            canAdd={canReview(user)}
            starredIds={starredIds}
            colours={settings.colours}
            events={events.map((e) => ({
              id: e.id,
              title: e.title,
              startsAt: e.startsAt,
              endsAt: e.endsAt,
              category: e.category,
              placeName: e.placeName,
              online: e.online
            }))}
          />
        )}
      </section>

      <section className="card map-card">
        <h2 className="map-heading">Map</h2>
        <EventsMap pins={pins} />
      </section>
    </main>
  );
}
