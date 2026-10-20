import Link from "next/link";
import { CategoryThumb } from "@/components/CategoryThumb";
import { requireUser } from "@/lib/auth";
import { categoryAccentStyle } from "@/lib/category-art";
import { dayKeyOf, formatDayKey } from "@/lib/calendar";
import { prisma } from "@/lib/db";
import { isUpdatedScrapedRow } from "@/lib/scraper/apply";
import { getSettings } from "@/lib/settings";
import { formatDateTime, formatDate } from "@/lib/time";

function displayEventLink(url: string) {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

export default async function PendingPage() {
  await requireUser(["admin", "cell leader"]);
  const settings = await getSettings();
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
                <Link
                  key={event.id}
                  className="card pending-tile"
                  href={`/events/${event.id}/edit`}
                  style={categoryAccentStyle(settings.colours[event.category as keyof typeof settings.colours])}
                >
                  <div className="pending-tile-top">
                    <p className="pending-kicker muted">{updated ? "Updated" : "New"}</p>
                    <CategoryThumb category={event.category} size="md" />
                  </div>
                  <h3>{event.title}</h3>
                  <p className="pending-meta muted">
                    <span>
                      {event.organisationName} · {event.category}
                    </span>
                    <time dateTime={event.startsAt.toISOString()}>{formatDateTime(event.startsAt)}</time>
                  </p>
                  {event.externalUrl ? (
                    <p className="pending-ext" title={event.externalUrl}>
                      <span className="pending-ext-label">Event Link</span>
                      <span className="pending-ext-url">{displayEventLink(event.externalUrl)}</span>
                    </p>
                  ) : (
                    <p className="pending-ext pending-ext-empty" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
