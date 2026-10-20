import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password";
import { decodeSession, encodeSession } from "@/lib/session";

const url = process.env.TEST_DATABASE_URL;
const prisma = url ? new PrismaClient({ datasourceUrl: url }) : null;

describe.skipIf(!prisma)("session revocation", () => {
  const db = prisma!;
  let userId = "";

  beforeAll(async () => {
    process.env.SESSION_SECRET ??= "ci-only-session-secret-not-used-anywhere-else-0123456789";
    const user = await db.user.create({
      data: {
        name: "Session Tester",
        cellNumber: "07100000009",
        passwordHash: await hashPassword("TestPass12"),
        role: "member"
      }
    });
    userId = user.id;
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  });

  it("rejects a token after sessionVersion is bumped", async () => {
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    const token = encodeSession({
      id: user.id,
      name: user.name,
      cellNumber: user.cellNumber,
      role: "member",
      cellId: user.cellId,
      sv: user.sessionVersion
    });
    expect(decodeSession(token)?.id).toBe(user.id);
    await db.user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } });
    const later = await db.user.findUniqueOrThrow({ where: { id: userId } });
    const claims = decodeSession(token);
    expect(claims?.sv).not.toBe(later.sessionVersion);
  });
});
