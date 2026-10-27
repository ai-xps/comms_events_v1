import Link from "next/link";
import { KindChooser } from "@/components/KindChooser";
import { addDaysKey, dayKeyOf, formatDayKey } from "@/lib/calendar";
import { prisma } from "@/lib/db";
import { formatDateTime, formatTime, londonDate, londonParts } from "@/lib/time";

const monthShort = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "Europe/London"
});
const weekdayShort = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "Europe/London"
});

/** Signed-in Home dashboard: coming up, confirm attendance, new since last login. */
export async function HomeDashboard({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const now = new Date();
  const today = dayKeyOf(now);
  const dayAfterTomorrow = addDaysKey(today, 2);
  const rangeFrom = londonDate(today.year, today.month, today.day, 0, 0);
  const rangeTo = londonDate(dayAfterTomorrow.year, dayAfterTomorrow.month, dayAfterTomorrow.day, 0, 0);

  const myBookings = await prisma.booking.findMany({
    where: {
      userId,
      event: { status: "PUBLISHED", startsAt: { gte: rangeFrom, lt: rangeTo } }
    },
    include: { event: true },
    orderBy: { event: { startsAt: "asc" } }
  });

  const stars = await prisma.star.findMany({
    where: {
      userId,
      event: { status: "PUBLISHED", startsAt: { gte: rangeFrom, lt: rangeTo } }
    },
    include: { event: true }
  });

  type Row = {
    id: string;
    title: string;
    startsAt: Date;
    online: boolean;
    placeName: string | null;
    kind: "booked" | "starred";
  };
  const upcomingMap = new Map<string, Row>();
  for (const b of myBookings) {
    upcomingMap.set(b.event.id, {
      id: b.event.id,
      title: b.event.title,
      startsAt: b.event.startsAt,
      online: b.event.online,
      placeName: b.event.placeName,
      kind: "booked"
    });
  }
  for (const s of stars) {
    if (!upcomingMap.has(s.event.id)) {
      upcomingMap.set(s.event.id, {
        id: s.event.id,
        title: s.event.title,
        startsAt: s.event.startsAt,
        online: s.event.online,
        placeName: s.event.placeName,
        kind: "starred"
      });
    }
  }
  const upcoming = [...upcomingMap.values()].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const toConfirm = await prisma.booking.findMany({
    where: {
      userId,
      attendance: "UNCONFIRMED",
      event: { status: "PUBLISHED", endsAt: { lt: now } }
    },
    include: { event: true },
    orderBy: { event: { startsAt: "desc" } },
    take: 10
  });

  const since = user.previousLoginAt;
  const newEvents = since
    ? await prisma.event.findMany({
        where: {
          status: "PUBLISHED",
          startsAt: { gte: now },
          OR: [{ createdAt: { gt: since } }, { startsAt: { gt: since } }]
        },
        orderBy: { startsAt: "asc" },
        take: 12
      })
    : [];

  return (
    <main className="home-dashboard" data-testid="home-dashboard">
      <div className="page-head">
        <h1>Home</h1>
        <p className="lede">
          {since
            ? `Welcome back, ${user.name.split(" ")[0]}. Here’s what’s on.`
            : `Welcome, ${user.name.split(" ")[0]} — here’s what’s on soon.`}
        </p>
      </div>

      <section className="card home-dash-section" aria-labelledby="home-upcoming" data-testid="home-upcoming">
        <h2 id="home-upcoming">Coming up</h2>
        <p className="muted">
          Today and tomorrow ({formatDayKey(today)} onward) — your Attend bookings and starred events.
        </p>
        {upcoming.length === 0 ? (
          <p className="muted">
            Nothing booked or starred for today or tomorrow. <Link href="/calendar">Open the calendar</Link>.
          </p>
        ) : (
          <ul className="event-row-list">
            {upcoming.map((event) => (
              <li key={event.id}>
                <Link className="event-row card" href={`/events/${event.id}`}>
                  <span className="event-date-block" aria-hidden="true">
                    <span className="event-date-month">{monthShort.format(event.startsAt)}</span>
                    <span className="event-date-day">{londonParts(event.startsAt).day}</span>
                    <span className="event-date-weekday">{weekdayShort.format(event.startsAt)}</span>
                  </span>
                  <span className="event-row-body">
                    <span className="event-title">{event.title}</span>
                    <span className="muted">
                      {formatTime(event.startsAt)}
                      {" · "}
                      {event.online ? "Online" : event.placeName || "In person"}
                      {event.kind === "starred" ? " · ★" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card home-dash-section" aria-labelledby="home-confirm" data-testid="home-confirm">
        <h2 id="home-confirm">Confirm attendance</h2>
        <p className="muted">Past events you Attended — tell us if you went.</p>
        {toConfirm.length === 0 ? (
          <p className="muted">Nothing waiting to confirm.</p>
        ) : (
          <ul className="list">
            {toConfirm.map((b) => (
              <li key={b.id}>
                <Link href={`/events/${b.event.id}`}>
                  {b.event.title}
                  <span className="muted"> · {formatDateTime(b.event.startsAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card home-dash-section" aria-labelledby="home-new" data-testid="home-new">
        <h2 id="home-new">New on the calendar</h2>
        {!since ? (
          <p className="muted">
            First visit this session — after you sign out and back in, new events will show here.
          </p>
        ) : newEvents.length === 0 ? (
          <p className="muted">No new upcoming events since you were last here.</p>
        ) : (
          <ul className="list">
            {newEvents.map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}`}>
                  {e.title}
                  <span className="muted"> · {formatDateTime(e.startsAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="home-dash-kinds" aria-labelledby="home-kinds">
        <h2 id="home-kinds">Browse by type</h2>
        <p className="lede kind-question" id="kind-question">
          What kind of event are you looking for?
        </p>
        <KindChooser signedIn selected={null} />
      </section>
    </main>
  );
}
