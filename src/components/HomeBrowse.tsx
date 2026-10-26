import Link from "next/link";
import { KindChooser } from "@/components/KindChooser";
import { parseTypesParam, type CalendarFormat } from "@/lib/calendar";
import { CATEGORIES, type Category } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatTime, londonParts } from "@/lib/time";

const LIST_CAP = 50;

const monthShort = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "Europe/London"
});
const weekdayShort = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "Europe/London"
});

function browseHref(types: Category[], format: CalendarFormat): string {
  const sp = new URLSearchParams();
  if (types.length) sp.set("types", types.join(","));
  if (format) sp.set("format", format);
  const q = sp.toString();
  return q ? `/?${q}` : "/";
}

/** Signed-in Home: pick a kind, then browse upcoming events. */
export async function HomeBrowse({
  userId,
  typesParam,
  formatParam
}: {
  userId: string;
  typesParam?: string;
  formatParam?: string;
}) {
  const categories = parseTypesParam(typesParam);
  const format: CalendarFormat =
    formatParam === "online" || formatParam === "inperson" ? formatParam : "";
  const selected = categories.length === 1 ? categories[0] : null;

  if (!categories.length) {
    return (
      <main className="search-page">
        <div className="page-head">
          <h1>Home</h1>
          <p className="lede kind-question" id="kind-question">
            What kind of event are you looking for?
          </p>
        </div>
        <KindChooser signedIn selected={null} />
      </main>
    );
  }

  const settings = await getSettings();
  const enabled = CATEGORIES.filter((c) => settings.enabled[c]);
  const allowed = categories.filter((c) => enabled.includes(c));
  const kindOff = categories.length > 0 && allowed.length === 0;

  const events =
    allowed.length === 0
      ? []
      : await prisma.event.findMany({
          where: {
            status: "PUBLISHED",
            startsAt: { gte: new Date() },
            category: { in: allowed },
            ...(format === "online" ? { online: true } : {}),
            ...(format === "inperson" ? { online: false } : {})
          },
          orderBy: { startsAt: "asc" },
          take: LIST_CAP
        });

  const eventIds = events.map((e) => e.id);
  const stars =
    eventIds.length === 0
      ? []
      : await prisma.star.findMany({
          where: { userId, eventId: { in: eventIds } },
          select: { eventId: true }
        });
  const starred = new Set(stars.map((s) => s.eventId));

  const title = categories.length === 1 ? `${categories[0]} events` : "Events";
  const hitCap = events.length === LIST_CAP;

  return (
    <main className="search-page">
      <div className="page-head">
        <p>
          <Link href="/">Back to kinds</Link>
        </p>
        <h1>{title}</h1>
        <p className="lede">Tap a row to open the event. Attend is on the next screen.</p>
      </div>

      <div className="format-pills" role="group" aria-label="Online or in person">
        <Link
          className="chip"
          href={browseHref(categories, "")}
          aria-current={format === "" ? "true" : undefined}
          data-on={format === "" ? "true" : undefined}
        >
          All
        </Link>
        <Link
          className="chip"
          href={browseHref(categories, "online")}
          aria-current={format === "online" ? "true" : undefined}
          data-on={format === "online" ? "true" : undefined}
        >
          Online
        </Link>
        <Link
          className="chip"
          href={browseHref(categories, "inperson")}
          aria-current={format === "inperson" ? "true" : undefined}
          data-on={format === "inperson" ? "true" : undefined}
        >
          In person
        </Link>
      </div>

      {kindOff ? (
        <p className="muted">
          This kind is turned off for the calendar.{" "}
          <Link href="/">Choose another kind</Link>
          {" or "}
          <Link href="/calendar">open the calendar</Link>.
        </p>
      ) : events.length === 0 ? (
        <p className="muted">
          No upcoming events of this kind.{" "}
          <Link href="/">Try another kind</Link>
          {" or "}
          <Link href="/calendar">see the month</Link>.
        </p>
      ) : (
        <ul className="event-row-list">
          {events.map((event) => {
            const parts = londonParts(event.startsAt);
            return (
              <li key={event.id}>
                <Link className="event-row card" href={`/events/${event.id}`} title={event.title}>
                  <span className="event-date-block" aria-hidden="true">
                    <span className="event-date-month">{monthShort.format(event.startsAt)}</span>
                    <span className="event-date-day">{parts.day}</span>
                    <span className="event-date-weekday">{weekdayShort.format(event.startsAt)}</span>
                  </span>
                  <span className="event-row-body">
                    <span className="event-title">{event.title}</span>
                    <span className="muted">
                      {formatTime(event.startsAt)}
                      {" · "}
                      {event.online ? "Online" : event.placeName || "In person"}
                    </span>
                  </span>
                  {starred.has(event.id) ? (
                    <span className="event-row-star" title="Starred" aria-label="Starred">
                      ★
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {hitCap ? (
        <p className="muted search-kinds-foot">
          Showing the next {LIST_CAP}.{" "}
          <Link href="/calendar">See more on the calendar</Link>.
        </p>
      ) : null}

      {selected && !kindOff ? (
        <p className="muted search-kinds-foot">
          Looking for something else?{" "}
          <Link href="/">Choose another kind</Link>
        </p>
      ) : null}
    </main>
  );
}
