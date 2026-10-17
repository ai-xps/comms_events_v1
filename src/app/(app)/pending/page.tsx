import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";
import { isUpdatedScrapedRow } from "@/lib/scraper/apply";

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
        {events.map((event) => {
          const updated = isUpdatedScrapedRow(event.createdAt, event.updatedAt);
          return (
            <Link key={event.id} className="card" href={`/events/${event.id}/edit`}>
              <p className="muted">{updated ? "Updated" : "New"}</p>
              <h2>{event.title}</h2>
              <p className="muted">
                {event.organisationName} · {event.category} · {formatDateTime(event.startsAt)}
              </p>
              {event.externalUrl ? <p className="muted">Event Link. {event.externalUrl}</p> : null}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
