import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";

export default async function BookingsPage() {
  const user = await requireUser();
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
          <Link key={b.id} className="card" href={`/events/${b.eventId}`}>
            <h2>{b.event.title}</h2>
            <p className="muted">
              {formatDateTime(b.event.startsAt)} · {b.attendance.toLowerCase()}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
