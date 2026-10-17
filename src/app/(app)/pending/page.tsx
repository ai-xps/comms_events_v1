import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime, formatDate } from "@/lib/time";
import { isUpdatedScrapedRow } from "@/lib/scraper/apply";
import { dayKeyOf, formatDayKey } from "@/lib/calendar";

export default async function PendingPage() {
  await requireUser(["admin", "cell leader"]);
  const events = await prisma.event.findMany({
    where: { status: "PENDING" },
    orderBy: { startsAt: "asc" }
  });
  const groups: { key: string; label: string; events: typeof events }[] = [];
  for (const event of events) {
    const key = formatDayKey(dayKeyOf(event.startsAt));
    const last = groups[groups.length - 1];
    if (!last || last.key !== key) {
      groups.push({ key, label: formatDate(event.startsAt), events: [event] });
    } else {
      last.events.push(event);
    }
  }
  return (
    <main>
      <div className="page-head">
        <h1>Pending review</h1>
        <p className="lede">Scraped events waiting for a cell leader or admin, grouped by day.</p>
      </div>
      {events.length === 0 ? (
        <p className="muted">Nothing waiting. Run now on scraper settings if you are admin.</p>
      ) : null}
      {groups.map((group) => (
        <section key={group.key} className="pending-day">
          <h2 className="pending-day-heading">{group.label}</h2>
          <div className="pending-tiles">
            {group.events.map((event) => {
              const updated = isUpdatedScrapedRow(event.createdAt, event.updatedAt);
              return (
                <Link key={event.id} className="card pending-tile" href={`/events/${event.id}/edit`}>
                  <p className="muted">{updated ? "Updated" : "New"}</p>
                  <h3>{event.title}</h3>
                  <p className="muted">
                    {event.organisationName} · {event.category} · {formatDateTime(event.startsAt)}
                  </p>
                  {event.externalUrl ? <p className="muted">Event Link. {event.externalUrl}</p> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
