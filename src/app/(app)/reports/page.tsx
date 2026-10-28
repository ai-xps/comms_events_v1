import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";
import { addDaysKey, dayKeyOf, formatDayKey } from "@/lib/calendar";
import { ReportsExport } from "@/components/ReportsExport";

export default async function ReportsPage() {
  await requireUser(["admin", "cell leader"]);
  const today = dayKeyOf(new Date());
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: { _count: { select: { bookings: true } } },
    orderBy: { startsAt: "desc" },
    take: 80
  });
  return (
    <main>
      <div className="page-head">
        <h1>Reports</h1>
        <p className="lede">
          Download event and attendee files. For charts and insight datasets, use{" "}
          <Link href="/insights">Insights</Link>. Cell leaders only see their own cell in attendee files.
        </p>
      </div>
      <ReportsExport defaultFrom={formatDayKey(today)} defaultTo={formatDayKey(addDaysKey(today, 30))} />
      <div className="table-wrap">
        <table className="data stack-sm">
          <thead>
            <tr>
              <th>Event</th>
              <th>When</th>
              <th>Booked</th>
              <th>Fill</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const booked = event._count.bookings;
              const cap = event.capacity;
              const fill =
                cap != null && cap > 0 ? `${Math.round((booked / cap) * 100)}%` : null;
              return (
                <tr key={event.id}>
                  <td data-label="Event">
                    <Link href={`/events/${event.id}`}>{event.title}</Link>
                  </td>
                  <td className="date" data-label="When">
                    {formatDateTime(event.startsAt)}
                  </td>
                  <td className="num" data-label="Booked">
                    {booked}
                    {cap != null ? ` / ${cap}` : ""}
                  </td>
                  <td className="num" data-label="Fill">
                    {fill ?? "—"}
                  </td>
                  <td data-label="Export">
                    <a href={`/api/export/${event.id}?format=csv`}>CSV</a>
                    {" · "}
                    <a href={`/api/export/${event.id}?format=xlsx`}>Excel</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
