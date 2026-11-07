import { prisma } from "./db";
import { writeAudit } from "./audit";
import { formatDateTime } from "./time";
import { toCsv as tableToCsv, toXlsx, type Table } from "./export-format";
import { canExportAttendees, canSeeAttendee } from "./policy";
import type { SessionUser } from "./session";

const COLUMNS = ["name", "cell number", "cell", "booked at", "attendance", "booked by"];

export async function bookingsForExport(eventId: string, actor: SessionUser) {
  const decision = canExportAttendees(actor);
  if (!decision.ok) {
    const error = new Error(decision.reason);
    (error as Error & { status?: number }).status = decision.status;
    throw error;
  }
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");
  const bookings = await prisma.booking.findMany({
    where: { eventId },
    include: { user: { include: { cell: true } }, bookedBy: true },
    orderBy: { bookedAt: "asc" }
  });
  const rows = bookings
    .filter((b) => canSeeAttendee(actor, b.user.cellId))
    .map((b) => ({
      name: b.user.name,
      cellNumber: b.user.cellNumber,
      cell: b.user.cell?.name ?? "",
      bookedAt: formatDateTime(b.bookedAt),
      attendance: b.attendance.toLowerCase(),
      bookedBy: b.bookedBy.name
    }));
  return { event, rows };
}

type Rows = Awaited<ReturnType<typeof bookingsForExport>>["rows"];

function asTable(rows: Rows): Table {
  return {
    name: "Attendees",
    columns: COLUMNS,
    rows: rows.map((r) => [r.name, r.cellNumber, r.cell, r.bookedAt, r.attendance, r.bookedBy])
  };
}

export function toCsv(rows: Rows): string {
  return tableToCsv(asTable(rows));
}

export async function toExcel(rows: Rows) {
  return toXlsx([asTable(rows)]);
}

export async function logExport(actor: SessionUser, eventId: string, format: string) {
  await writeAudit({
    actorId: actor.id,
    action: "booking.export",
    entityType: "Event",
    entityId: eventId,
    summary: `${actor.name} exported ${format} for event ${eventId}`
  });
}
