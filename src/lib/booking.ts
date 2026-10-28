import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { writeAudit } from "./audit";
import { canBookFor, canCancelBooking } from "./policy";
import type { SessionUser } from "./session";

export class BookingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function attendEvent(opts: {
  eventId: string;
  userId: string;
  actor: SessionUser;
}) {
  const result = await prisma
    .$transaction(async (tx) => {
      // SQLite has no FOR UPDATE. No-op write takes a write lock before we read capacity (R7).
      const locked = await tx.$executeRaw`
        UPDATE "Event" SET "title" = "title" WHERE id = ${opts.eventId}
      `;
      if (locked === 0) {
        throw new BookingError("That event is not on the calendar.");
      }
      const event = await tx.event.findUnique({ where: { id: opts.eventId } });
      if (!event || event.status !== "PUBLISHED") {
        throw new BookingError("That event is not on the calendar.");
      }
      const target = await tx.user.findUnique({ where: { id: opts.userId } });
      if (!target || !target.active) {
        throw new BookingError("That member was not found.");
      }
      const decision = canBookFor(opts.actor, target);
      if (!decision.ok) throw new BookingError(decision.reason, decision.status);
      const existing = await tx.booking.findUnique({
        where: { eventId_userId: { eventId: opts.eventId, userId: opts.userId } }
      });
      if (existing) return { booking: existing, created: false, title: event.title, targetName: target.name };
      if (event.capacity !== null) {
        const count = await tx.booking.count({ where: { eventId: opts.eventId } });
        if (count >= event.capacity) {
          throw new BookingError("This event is full.");
        }
      }
      const booking = await tx.booking.create({
        data: {
          eventId: opts.eventId,
          userId: opts.userId,
          bookedById: opts.actor.id,
          attendance: "UNCONFIRMED"
        }
      });
      return { booking, created: true, title: event.title, targetName: target.name };
    })
    .catch(async (error) => {
      // A double-click can race on the unique (eventId, userId) index; the place is already held.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const booking = await prisma.booking.findUniqueOrThrow({
          where: { eventId_userId: { eventId: opts.eventId, userId: opts.userId } }
        });
        return { booking, created: false, title: "", targetName: "" };
      }
      throw error;
    });
  if (result.created) {
    await writeAudit({
      actorId: opts.actor.id,
      action: "booking.create",
      entityType: "Booking",
      entityId: result.booking.id,
      summary: `${opts.actor.name} booked ${result.targetName} onto ${result.title}`
    });
  }
  return result.booking;
}

export async function cancelBooking(opts: {
  eventId: string;
  userId: string;
  actor: SessionUser;
}) {
  const cancelled = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: opts.eventId } });
    if (!event) throw new BookingError("That event was not found.");
    const booking = await tx.booking.findUnique({
      where: { eventId_userId: { eventId: opts.eventId, userId: opts.userId } },
      include: { user: true }
    });
    if (!booking) throw new BookingError("There is no booking to cancel.");
    const decision = canCancelBooking(
      opts.actor,
      { userId: booking.userId, userCellId: booking.user.cellId },
      event.startsAt <= new Date()
    );
    if (!decision.ok) {
      const ownStarted = opts.actor.role === "member" && opts.actor.id === opts.userId;
      throw new BookingError(decision.reason, ownStarted ? 400 : decision.status);
    }
    await tx.booking.delete({ where: { id: booking.id } });
    return { ok: true, bookingId: booking.id, name: booking.user.name, title: event.title };
  });
  await writeAudit({
    actorId: opts.actor.id,
    action: "booking.cancel",
    entityType: "Booking",
    entityId: cancelled.bookingId,
    summary: `${opts.actor.name} cancelled ${cancelled.name} on ${cancelled.title}`
  });
  return { ok: true };
}
