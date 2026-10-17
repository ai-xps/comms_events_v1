import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser, canReview } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/time";
import { initialsFromName } from "@/lib/initials";
import { EventActions } from "@/components/EventActions";
import { EventMap } from "@/components/EventMap";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const settings = await getSettings();
  const event = await prisma.event.findUnique({
    where: { id },
    include: { bookings: { include: { user: { include: { cell: true } }, bookedBy: true } } }
  });
  if (!event) notFound();
  if (event.status !== "PUBLISHED" && !canReview(user)) notFound();

  const myBooking = event.bookings.find((b) => b.userId === user.id);
  const count = event.bookings.length;
  const full = event.capacity !== null && count >= event.capacity;
  const starred = !!(await prisma.star.findUnique({
    where: { userId_eventId: { userId: user.id, eventId: event.id } }
  }));
  const cellMembers =
    user.role === "cell leader" && user.cellId
      ? await prisma.user.findMany({
          where: { cellId: user.cellId, active: true },
          orderBy: { name: "asc" }
        })
      : [];

  const visibleBookings =
    user.role === "admin"
      ? event.bookings
      : user.role === "cell leader"
        ? event.bookings.filter((b) => b.user.cellId === user.cellId)
        : [];

  return (
    <main className="stack">
      <p>
        <Link href="/calendar">Back to calendar</Link>
      </p>
      <div className="page-head">
        <h1>{event.title}</h1>
        <p className="lede">
          <span className="swatch" style={{ background: settings.colours[event.category as keyof typeof settings.colours] }} />{" "}
          {event.category} · {event.online ? "Online" : "In person"} · {formatDateTime(event.startsAt)}–
          {formatDateTime(event.endsAt)}
        </p>
      </div>
      <section className="card stack">
        <p>
          <strong>Organisation.</strong> {event.organisationName}
        </p>
        {event.placeName ? (
          <p>
            <strong>Place.</strong> {event.placeName}
          </p>
        ) : null}
        {event.externalUrl ? (
          <p>
            <strong>Event Link.</strong>{" "}
            <a href={event.externalUrl} target="_blank" rel="noreferrer">
              Register there if they ask, and still click Attend here
            </a>
          </p>
        ) : null}
        {event.notes ? <p>{event.notes}</p> : null}
        <p>
          <strong>Planning to go.</strong> {count}
          {event.capacity !== null ? ` of ${event.capacity}` : ""}
          {full ? " — this event is full." : ""}
        </p>
        {user.role === "member" && settings.memberAttendeeView === "COUNT_AND_INITIALS" ? (
          <p className="muted">
            Initials: {event.bookings.map((b) => initialsFromName(b.user.name)).join(", ") || "nobody yet"}
          </p>
        ) : null}
        {user.role === "member" && settings.memberAttendeeView === "COUNT_AND_NAME_CELL" ? (
          event.bookings.length ? (
            <ul className="attendee-list">
              {event.bookings.map((b) => (
                <li key={b.id}>
                  {b.user.name} <span className="muted">· {b.user.cellNumber}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Nobody has booked yet.</p>
          )
        ) : null}
        <EventActions
          eventId={event.id}
          booked={!!myBooking}
          full={full && !myBooking}
          starred={starred}
          canCancel={!!myBooking && event.startsAt > new Date()}
          members={cellMembers.map((m) => ({ id: m.id, name: m.name }))}
          canDelegate={user.role === "cell leader"}
          canEdit={canReview(user)}
        />
      </section>
      {event.lat != null && event.lng != null ? (
        <section className="card map-card">
          <h2 className="map-heading">Map</h2>
          <EventMap lat={event.lat} lng={event.lng} title={event.title} />
        </section>
      ) : (
        <p className="muted">No map pin for this event.</p>
      )}
      {visibleBookings.length ? (
        <section>
          <h2>{user.role === "admin" ? "Everyone who has booked" : "Your cell"}</h2>
          <div className="table-wrap">
            <table className="data stack-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Cell number</th>
                  <th>Cell</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((b) => (
                  <tr key={b.id}>
                    <td data-label="Name">{b.user.name}</td>
                    <td data-label="Cell number">{b.user.cellNumber}</td>
                    <td data-label="Cell">{b.user.cell?.name}</td>
                    <td data-label="Attendance">{b.attendance.toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
