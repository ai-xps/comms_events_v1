import Link from "next/link";
import { CategoryThumb } from "@/components/CategoryThumb";
import { requireUser } from "@/lib/auth";
import { categoryAccentStyle } from "@/lib/category-art";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/time";

function BookingRow({
  booking,
  colour,
  count,
  starred
}: {
  booking: {
    id: string;
    attendance: string;
    eventId: string;
    event: {
      title: string;
      category: string;
      startsAt: Date;
      capacity: number | null;
    };
  };
  colour: string;
  count: number;
  starred: boolean;
}) {
  const { event } = booking;
  const full = event.capacity !== null && count >= event.capacity;
  const spots =
    event.capacity !== null
      ? full
        ? `${count} of ${event.capacity} — full`
        : `${count} of ${event.capacity}`
      : null;

  return (
    <Link
      className="card event-card"
      href={`/events/${booking.eventId}`}
      style={categoryAccentStyle(colour)}
    >
      <CategoryThumb category={event.category} size="md" />
      <span className="event-card-body">
        <span className="event-card-meta">
          <span className="swatch" style={{ background: colour }} />
          {event.category}
          {starred ? (
            <span className="event-row-star" title="Starred" aria-label="Starred">
              ★
            </span>
          ) : null}
        </span>
        <span className="event-title">{event.title}</span>
        <span className="muted">
          {formatDateTime(event.startsAt)} · {booking.attendance.toLowerCase()}
          {spots ? ` · ${spots}` : ""}
        </span>
      </span>
    </Link>
  );
}

export default async function BookingsPage() {
  const user = await requireUser();
  const settings = await getSettings();
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { event: true },
    orderBy: { event: { startsAt: "asc" } }
  });

  const eventIds = [...new Set(bookings.map((b) => b.eventId))];
  const [counts, stars] = await Promise.all([
    eventIds.length === 0
      ? Promise.resolve([] as { eventId: string; _count: { _all: number } }[])
      : prisma.booking.groupBy({
          by: ["eventId"],
          where: { eventId: { in: eventIds } },
          _count: { _all: true }
        }),
    eventIds.length === 0
      ? Promise.resolve([] as { eventId: string }[])
      : prisma.star.findMany({
          where: { userId: user.id, eventId: { in: eventIds } },
          select: { eventId: true }
        })
  ]);
  const countByEvent = new Map(counts.map((c) => [c.eventId, c._count._all]));
  const starred = new Set(stars.map((s) => s.eventId));

  const upcoming = bookings.filter((b) => b.event.startsAt >= now);
  const past = bookings.filter((b) => b.event.startsAt < now).reverse();

  return (
    <main>
      <div className="page-head">
        <h1>My bookings</h1>
        <p className="lede">Events you have clicked Attend on. Confirming you went happens after the event.</p>
      </div>
      {bookings.length === 0 ? <p className="muted">You have not booked anything yet.</p> : null}

      {upcoming.length ? (
        <section className="bookings-section">
          <h2 className="bookings-section-title">Upcoming</h2>
          <div className="list">
            {upcoming.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                colour={settings.colours[b.event.category as keyof typeof settings.colours]}
                count={countByEvent.get(b.eventId) ?? 0}
                starred={starred.has(b.eventId)}
              />
            ))}
          </div>
        </section>
      ) : bookings.length ? (
        <p className="muted">No upcoming bookings.</p>
      ) : null}

      {past.length ? (
        <section className="bookings-section">
          <h2 className="bookings-section-title">Past</h2>
          <div className="list">
            {past.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                colour={settings.colours[b.event.category as keyof typeof settings.colours]}
                count={countByEvent.get(b.eventId) ?? 0}
                starred={starred.has(b.eventId)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
