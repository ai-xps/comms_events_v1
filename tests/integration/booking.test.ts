import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password";

const url = process.env.TEST_DATABASE_URL;
const prisma = url ? new PrismaClient({ datasourceUrl: url }) : null;

describe.skipIf(!prisma)("booking integrity", () => {
  const db = prisma!;
  let eventId = "";
  let userA = "";
  let userB = "";
  let leaderId = "";

  beforeAll(async () => {
    const hash = await hashPassword("TestPass12");
    const cell = await db.cell.upsert({
      where: { name: "Test cell" },
      update: {},
      create: { name: "Test cell" }
    });
    const other = await db.cell.upsert({
      where: { name: "Other cell" },
      update: {},
      create: { name: "Other cell" }
    });
    const a = await db.user.create({
      data: { name: "A", cellNumber: "07100000001", passwordHash: hash, role: "member", cellId: cell.id }
    });
    const b = await db.user.create({
      data: { name: "B", cellNumber: "07100000002", passwordHash: hash, role: "member", cellId: cell.id }
    });
    const outsider = await db.user.create({
      data: { name: "C", cellNumber: "07100000003", passwordHash: hash, role: "member", cellId: other.id }
    });
    const leader = await db.user.create({
      data: { name: "L", cellNumber: "07100000004", passwordHash: hash, role: "cell leader", cellId: cell.id }
    });
    const event = await db.event.create({
      data: {
        title: "One place left",
        organisationName: "Test",
        category: "Meetup",
        startsAt: new Date(Date.now() + 86400000),
        endsAt: new Date(Date.now() + 90000000),
        status: "PUBLISHED",
        capacity: 1
      }
    });
    eventId = event.id;
    userA = a.id;
    userB = b.id;
    leaderId = leader.id;
    void outsider;
  });

  afterAll(async () => {
    await db.booking.deleteMany({ where: { eventId } });
    await db.event.deleteMany({ where: { id: eventId } });
    await db.user.deleteMany({ where: { cellNumber: { startsWith: "0710000000" } } });
    await db.$disconnect();
  });

  it("lets only one of two simultaneous bookings take the last place", async () => {
    const { attendEvent } = await import("@/lib/booking");
    const a = await db.user.findUniqueOrThrow({ where: { id: userA } });
    const b = await db.user.findUniqueOrThrow({ where: { id: userB } });
    const actorA = { id: userA, name: "A", cellNumber: "07100000001", role: "member" as const, cellId: a.cellId };
    const actorB = { id: userB, name: "B", cellNumber: "07100000002", role: "member" as const, cellId: b.cellId };

    const results = await Promise.allSettled([
      attendEvent({ eventId, userId: userA, actor: actorA }),
      attendEvent({ eventId, userId: userB, actor: actorB })
    ]);
    const ok = results.filter((r) => r.status === "fulfilled");
    const blocked = results.filter((r) => r.status === "rejected");
    expect(ok).toHaveLength(1);
    expect(blocked).toHaveLength(1);
    expect(await db.booking.count({ where: { eventId } })).toBe(1);
  });

  it("stops a member booking someone else", async () => {
    const { attendEvent, BookingError } = await import("@/lib/booking");
    const a = await db.user.findUniqueOrThrow({ where: { id: userA } });
    const actor = { id: userA, name: "A", cellNumber: a.cellNumber, role: "member" as const, cellId: a.cellId };
    await expect(attendEvent({ eventId, userId: userB, actor })).rejects.toBeInstanceOf(BookingError);
  });

  it("stops a cell leader booking another cell", async () => {
    const { attendEvent, BookingError } = await import("@/lib/booking");
    const leader = await db.user.findUniqueOrThrow({ where: { id: leaderId } });
    const outsider = await db.user.findFirstOrThrow({ where: { cellNumber: "07100000003" } });
    const actor = {
      id: leader.id,
      name: leader.name,
      cellNumber: leader.cellNumber,
      role: "cell leader" as const,
      cellId: leader.cellId
    };
    await expect(attendEvent({ eventId, userId: outsider.id, actor })).rejects.toBeInstanceOf(BookingError);
  });
});
