import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

const url = process.env.TEST_DATABASE_URL;
const prisma = url ? new PrismaClient({ datasourceUrl: url }) : null;

/**
 * Discard on pending only sets Event.status. Organisation status must stay put —
 * that is the UI contract “Discard ≠ blacklist”.
 */
describe.skipIf(!prisma)("discard leaves organisation alone", () => {
  const db = prisma!;
  let orgId = "";
  let eventId = "";

  beforeAll(async () => {
    const org = await db.organisation.create({
      data: {
        name: "Discard Test Org",
        nameKey: "discard-test-org",
        status: "WHITELIST"
      }
    });
    const event = await db.event.create({
      data: {
        title: "Pending to discard",
        organisationName: org.name,
        organisationId: org.id,
        category: "Meetup",
        startsAt: new Date(Date.now() + 86400000),
        endsAt: new Date(Date.now() + 90000000),
        status: "PENDING"
      }
    });
    orgId = org.id;
    eventId = event.id;
  });

  afterAll(async () => {
    await db.event.deleteMany({ where: { id: eventId } });
    await db.organisation.deleteMany({ where: { id: orgId } });
    await db.$disconnect();
  });

  it("setting DISCARDED does not change organisation status", async () => {
    // Mirrors the pending Discard PATCH: status only on the event row.
    await db.event.update({
      where: { id: eventId },
      data: { status: "DISCARDED" }
    });

    const [event, org] = await Promise.all([
      db.event.findUniqueOrThrow({ where: { id: eventId } }),
      db.organisation.findUniqueOrThrow({ where: { id: orgId } })
    ]);
    expect(event.status).toBe("DISCARDED");
    expect(org.status).toBe("WHITELIST");
  });
});
