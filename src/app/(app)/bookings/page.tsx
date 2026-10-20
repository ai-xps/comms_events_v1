import Link from "next/link";
import { CategoryThumb } from "@/components/CategoryThumb";
import { requireUser } from "@/lib/auth";
import { categoryAccentStyle } from "@/lib/category-art";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/time";

export default async function BookingsPage() {
  const user = await requireUser();
  const settings = await getSettings();
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { event: true },
    orderBy: { event: { startsAt: "asc" } }
  });
  return (
    <main>
      <div className="page-head">
        <h1>My bookings</h1>
        <p className="lede">Events you have clicked Attend on. Confirming you went happens after the event.</p>
      </div>
      {bookings.length === 0 ? <p className="muted">You have not booked anything yet.</p> : null}
      <div className="list">
        {bookings.map((b) => (
          <Link
            key={b.id}
            className="card event-card"
            href={`/events/${b.eventId}`}
            style={categoryAccentStyle(settings.colours[b.event.category as keyof typeof settings.colours])}
          >
            <CategoryThumb category={b.event.category} size="md" />
            <span className="event-card-body">
              <span className="event-card-meta">
                <span
                  className="swatch"
                  style={{ background: settings.colours[b.event.category as keyof typeof settings.colours] }}
                />
                {b.event.category}
              </span>
              <span className="event-title">{b.event.title}</span>
              <span className="muted">
                {formatDateTime(b.event.startsAt)} · {b.attendance.toLowerCase()}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
