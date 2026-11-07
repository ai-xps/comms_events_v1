import { prisma } from "./db";
import { eventEnd } from "./time";

/**
 * Still worth reviewing: the event has not finished yet.
 * No end time → treat as three hours after start (same as the rest of Gather).
 */
export function pendingStillOpen(
  startsAt: Date,
  endsAt: Date | null | undefined,
  now = new Date()
): boolean {
  return eventEnd(startsAt, endsAt).getTime() >= now.getTime();
}

/**
 * Drop finished PENDING rows (status → DISCARDED) and return the ones still open, soonest first.
 */
export async function loadOpenPendingEvents(now = new Date()) {
  const pending = await prisma.event.findMany({
    where: { status: "PENDING" },
    orderBy: { startsAt: "asc" }
  });
  const open = pending.filter((e) => pendingStillOpen(e.startsAt, e.endsAt, now));
  const pastIds = pending.filter((e) => !pendingStillOpen(e.startsAt, e.endsAt, now)).map((e) => e.id);
  if (pastIds.length) {
    await prisma.event.updateMany({
      where: { id: { in: pastIds } },
      data: { status: "DISCARDED" }
    });
  }
  return open;
}
