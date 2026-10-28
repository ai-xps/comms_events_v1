import type { PrismaClient } from "@prisma/client";

export const SCRAPE_LOCK_ID = "scrape";
export const SCRAPE_LOCK_MS = 5 * 60 * 1000;

export function scrapeLockUntil(now = Date.now()): Date {
  return new Date(now + SCRAPE_LOCK_MS);
}

/** True when a claim attempt acquired the lock (kept for unit tests). */
export function scrapeLockAcquired(returned: { id: string }[] | null | undefined): boolean {
  return Array.isArray(returned) && returned.length > 0;
}

async function db(client?: PrismaClient): Promise<PrismaClient> {
  return client ?? (await import("../db")).prisma;
}

/**
 * One atomic claim. Expired locks are reused. A held lock throws 409 so the caller
 * must not release someone else's run. SQLite-safe (no Postgres ON CONFLICT RETURNING).
 */
export async function claimScrapeLock(client?: PrismaClient): Promise<void> {
  const prisma = await db(client);
  const now = new Date();
  const heldUntil = scrapeLockUntil(now.getTime());

  const acquired = await prisma.$transaction(async (tx) => {
    const existing = await tx.scrapeLock.findUnique({ where: { id: SCRAPE_LOCK_ID } });
    if (!existing) {
      await tx.scrapeLock.create({
        data: { id: SCRAPE_LOCK_ID, heldUntil }
      });
      return true;
    }
    if (existing.heldUntil > now) {
      return false;
    }
    await tx.scrapeLock.update({
      where: { id: SCRAPE_LOCK_ID },
      data: { heldUntil }
    });
    return true;
  });

  if (!acquired) {
    const error = new Error("A scraper run is already in progress.");
    (error as Error & { status?: number }).status = 409;
    throw error;
  }
}

export async function releaseScrapeLock(client?: PrismaClient): Promise<void> {
  const prisma = await db(client);
  await prisma.scrapeLock.deleteMany({ where: { id: SCRAPE_LOCK_ID } });
}
