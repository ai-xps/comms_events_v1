import type { PrismaClient } from "@prisma/client";

let pragmasApplied = false;

/** WAL + busy_timeout so Attend/scrape writers queue instead of failing fast (R4, R7). */
export async function ensureSqlitePragmas(client: PrismaClient): Promise<void> {
  if (pragmasApplied) return;
  await client.$queryRawUnsafe("PRAGMA journal_mode=WAL");
  await client.$queryRawUnsafe("PRAGMA busy_timeout=5000");
  pragmasApplied = true;
}
