import { prisma } from "@/lib/db";
import type { InsightsScope } from "@/lib/policy";
import type { InsightsFilters, RawInsights } from "./types";

export async function loadRawInsights(scope: InsightsScope, filters: InsightsFilters): Promise<RawInsights> {
  const cellFilter = scope.kind === "cell" ? scope.cellId : undefined;
  const [events, bookings, stars, runs, members] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startsAt: "asc" }
    }),
    prisma.booking.findMany({
      where: cellFilter ? { user: { cellId: cellFilter } } : undefined,
      include: { user: { include: { cell: true } } }
    }),
    prisma.star.findMany({
      where: cellFilter ? { user: { cellId: cellFilter } } : undefined,
      select: { eventId: true }
    }),
    prisma.scraperRun.findMany({
      where: { startedAt: { gte: filters.from, lt: filters.to } },
      orderBy: { startedAt: "desc" },
      take: 20
    }),
    prisma.user.findMany({
      where: cellFilter ? { cellId: cellFilter } : undefined,
      select: { id: true, active: true, cellId: true }
    })
  ]);

  return {
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      online: e.online,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      capacity: e.capacity,
      status: e.status,
      createdAt: e.createdAt,
      sourceKey: e.sourceKey
    })),
    bookings: bookings.map((b) => ({
      eventId: b.eventId,
      userId: b.userId,
      bookedById: b.bookedById,
      bookedAt: b.bookedAt,
      attendance: b.attendance,
      userCellId: b.user.cellId,
      cellName: b.user.cell?.name ?? "Unassigned"
    })),
    stars: stars.map((s) => ({ eventId: s.eventId })),
    runs: runs.map((r) => ({
      startedAt: r.startedAt,
      trigger: r.trigger,
      createdCount: r.createdCount,
      publishedCount: r.publishedCount,
      discardedByRule: r.discardedByRule,
      leftPending: r.leftPending,
      status: r.status
    })),
    members
  };
}

export async function loadAttendeeRows(scope: InsightsScope, eventIds: string[]) {
  if (eventIds.length === 0) return [];
  const rows = await prisma.booking.findMany({
    where: {
      eventId: { in: eventIds },
      ...(scope.kind === "cell" ? { user: { cellId: scope.cellId } } : {})
    },
    include: { user: { include: { cell: true } }, event: true, bookedBy: true },
    orderBy: [{ event: { startsAt: "asc" } }, { bookedAt: "asc" }]
  });
  return rows.map((b) => ({
    event: b.event.title,
    when: b.event.startsAt.toISOString(),
    name: b.user.name,
    cellNumber: b.user.cellNumber,
    cell: b.user.cell?.name ?? "",
    attendance: b.attendance.toLowerCase(),
    bookedBy: b.bookedBy.name
  }));
}
