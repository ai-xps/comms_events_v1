import { prisma } from "./db";
import { writeAudit } from "./audit";
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
  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: opts.eventId } });
    if (!event || event.status !== "PUBLISHED") {
      throw new BookingError("That event is not on the calendar.");
    }
    const target = await tx.user.findUnique({ where: { id: opts.userId } });
    if (!target || !target.active) {
      throw new BookingError("That member was not found.");
    }
    if (opts.actor.role === "member" && opts.actor.id !== opts.userId) {
      throw new BookingError("You can only book yourself.", 403);
    }
    if (opts.actor.role === "cell leader") {
      if (!opts.actor.cellId || target.cellId !== opts.actor.cellId) {
        throw new BookingError("You can only book members of your own cell.", 403);
      }
    }
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
    if (opts.actor.role === "member") {
      if (opts.actor.id !== opts.userId) throw new BookingError("You can only cancel your own booking.", 403);
      if (event.startsAt <= new Date()) {
        throw new BookingError("This event has already started.");
      }
    } else if (opts.actor.role === "cell leader") {
      if (!opts.actor.cellId || booking.user.cellId !== opts.actor.cellId) {
        throw new BookingError("You can only cancel bookings for your own cell.", 403);
      }
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
