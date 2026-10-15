import ExcelJS from "exceljs";
import { prisma } from "./db";
import { writeAudit } from "./audit";
import { formatDateTime } from "./time";
import type { SessionUser } from "./session";

const COLUMNS = ["name", "cell number", "cell", "booked at", "attendance", "booked by"] as const;

export async function bookingsForExport(eventId: string, actor: SessionUser) {
  if (actor.role === "member") {
    const error = new Error("Members cannot export.");
    (error as Error & { status?: number }).status = 403;
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
    .filter((b) => actor.role === "admin" || b.user.cellId === actor.cellId)
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

export function toCsv(rows: Awaited<ReturnType<typeof bookingsForExport>>["rows"]): string {
  const header = COLUMNS.join(",");
  const body = rows.map((r) =>
    [r.name, r.cellNumber, r.cell, r.bookedAt, r.attendance, r.bookedBy]
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(",")
  );
  return [header, ...body].join("\n");
}

export async function toExcel(rows: Awaited<ReturnType<typeof bookingsForExport>>["rows"]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendees");
  sheet.addRow([...COLUMNS]);
  rows.forEach((r) => {
    sheet.addRow([r.name, r.cellNumber, r.cell, r.bookedAt, r.attendance, r.bookedBy]);
  });
  return workbook.xlsx.writeBuffer();
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
