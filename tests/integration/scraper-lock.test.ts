import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { claimScrapeLock, releaseScrapeLock, SCRAPE_LOCK_ID } from "@/lib/scraper/lock";

const url = process.env.TEST_DATABASE_URL;
const prisma = url ? new PrismaClient({ datasourceUrl: url }) : null;

describe.skipIf(!prisma)("scrape lock", () => {
  const db = prisma!;

  afterAll(async () => {
    await releaseScrapeLock(db);
    await db.$disconnect();
  });

  it("returns 409 on a second claim while the lock is held", async () => {
    await db.scrapeLock.deleteMany({ where: { id: SCRAPE_LOCK_ID } });
    await claimScrapeLock(db);
    await expect(claimScrapeLock(db)).rejects.toMatchObject({
      message: "A scraper run is already in progress.",
      status: 409
    });
    await releaseScrapeLock(db);
    await claimScrapeLock(db);
    await releaseScrapeLock(db);
  });
});
