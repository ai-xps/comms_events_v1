import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";

export default async function PendingPage() {
  await requireUser(["admin", "cell leader"]);
  const events = await prisma.event.findMany({
    where: { status: "PENDING" },
    orderBy: { startsAt: "asc" }
  });
  return (
    <main>
      <div className="page-head">
        <h1>Pending review</h1>
        <p className="lede">Scraped events waiting for a cell leader or admin. Sorted by day and time.</p>
      </div>
      {events.length === 0 ? <p className="muted">The queue is empty.</p> : null}
      <div className="list">
        {events.map((event) => (
          <Link key={event.id} className="card" href={`/events/${event.id}/edit`}>
            <h2>{event.title}</h2>
            <p className="muted">
              {event.organisationName} · {event.category} · {formatDateTime(event.startsAt)}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
