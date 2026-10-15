import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";

export default async function ReportsPage() {
  await requireUser(["admin", "cell leader"]);
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
        <p className="lede">Export one occurrence at a time. Cell leaders only see their own cell in the file.</p>
      </div>
      <div className="table-wrap">
        <table className="data stack-sm">
          <thead>
            <tr>
              <th>Event</th>
              <th>When</th>
              <th>Booked</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td data-label="Event">
                  <Link href={`/events/${event.id}`}>{event.title}</Link>
                </td>
                <td className="date" data-label="When">
                  {formatDateTime(event.startsAt)}
                </td>
                <td className="num" data-label="Booked">
                  {event._count.bookings}
                </td>
                <td data-label="Export">
                  <a href={`/api/export/${event.id}?format=csv`}>CSV</a>
                  {" · "}
                  <a href={`/api/export/${event.id}?format=xlsx`}>Excel</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
