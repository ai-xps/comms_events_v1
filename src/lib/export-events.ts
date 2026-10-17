import { prisma } from "./db";
import { writeAudit } from "./audit";
import { formatDateTime } from "./time";
import { toCsv as tableToCsv, toXlsx, type Table } from "./export-format";
import type { SessionUser } from "./session";

const COLUMNS = [
  "title",
  "organisation",
  "type",
  "starts",
  "ends",
  "online",
  "place",
  "event link",
  "booked"
];

export function eventsTable(rows: {
  title: string;
  organisationName: string;
  category: string;
  startsAt: Date;
  endsAt: Date;
  online: boolean;
  placeName: string | null;
  externalUrl: string | null;
  bookings: number;
}[]): Table {
  return {
    name: "Events",
    columns: COLUMNS,
    rows: rows.map((r) => [
      r.title,
      r.organisationName,
      r.category,
      formatDateTime(r.startsAt),
      formatDateTime(r.endsAt),
      r.online ? "online" : "in person",
      r.placeName,
      r.externalUrl,
      r.bookings
    ])
  };
}

export async function eventsForRange(actor: SessionUser, from: Date, to: Date) {
  if (actor.role === "member") {
    const error = new Error("Members cannot export.");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
  if (!(from.getTime() < to.getTime())) {
    const error = new Error("The end date must be after the start date.");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: from, lt: to } },
    include: { _count: { select: { bookings: true } } },
    orderBy: { startsAt: "asc" }
  });
  return events.map((e) => ({
    title: e.title,
    organisationName: e.organisationName,
    category: e.category,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    online: e.online,
    placeName: e.placeName,
    externalUrl: e.externalUrl,
    bookings: e._count.bookings
  }));
}

export function eventsToCsv(rows: Awaited<ReturnType<typeof eventsForRange>>): string {
  return tableToCsv(eventsTable(rows));
}

export async function eventsToExcel(rows: Awaited<ReturnType<typeof eventsForRange>>) {
  return toXlsx([eventsTable(rows)]);
}

export async function logEventsExport(actor: SessionUser, format: string, from: Date, to: Date, count: number) {
  await writeAudit({
    actorId: actor.id,
    action: "events.export",
    entityType: "Event",
    summary: `${actor.name} exported ${count} events as ${format} from ${from.toISOString()} to ${to.toISOString()}`
  });
}
