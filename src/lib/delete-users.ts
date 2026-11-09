import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { writeAudit } from "./audit";
import { LIMITS } from "./security";

/** Same cascade as single-person delete: bookings, stars; null event/audit links; then user row. */
export async function purgeUserInTx(tx: Prisma.TransactionClient, id: string) {
  await tx.booking.deleteMany({ where: { OR: [{ userId: id }, { bookedById: id }] } });
  await tx.star.deleteMany({ where: { userId: id } });
  await tx.event.updateMany({ where: { createdById: id }, data: { createdById: null } });
  await tx.event.updateMany({ where: { reviewedById: id }, data: { reviewedById: null } });
  await tx.auditLog.updateMany({ where: { actorId: id }, data: { actorId: null } });
  await tx.user.delete({ where: { id } });
}

/**
 * Drop the signed-in admin, blanks, and duplicates. Cap the list so one request cannot wipe the world by accident.
 */
export function selectIdsForBatchDelete(rawIds: unknown, actorId: string): {
  ids: string[];
  skippedSelf: boolean;
  truncated: boolean;
} {
  const seen = new Set<string>();
  const ids: string[] = [];
  let skippedSelf = false;
  let truncated = false;
  if (!Array.isArray(rawIds)) return { ids, skippedSelf, truncated };
  for (const value of rawIds) {
    const id = String(value ?? "").trim();
    if (!id) continue;
    if (id === actorId) {
      skippedSelf = true;
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    if (ids.length >= LIMITS.batchDeleteUsers) {
      truncated = true;
      break;
    }
    ids.push(id);
  }
  return { ids, skippedSelf, truncated };
}

export async function deleteUsersPermanently(opts: {
  ids: string[];
  actorId: string;
  actorName: string;
}): Promise<{ deleted: number; names: string[] }> {
  const users = await prisma.user.findMany({
    where: { id: { in: opts.ids } },
    select: { id: true, name: true }
  });
  if (users.length === 0) return { deleted: 0, names: [] };

  await prisma.$transaction(async (tx) => {
    for (const user of users) {
      await purgeUserInTx(tx, user.id);
    }
  });

  const names = users.map((u) => u.name);
  try {
    await writeAudit({
      actorId: opts.actorId,
      action: "users.batch_delete",
      entityType: "User",
      summary: `${opts.actorName} permanently deleted ${users.length} people: ${names.join(", ")}`
    });
  } catch (error) {
    console.error("users.batch_delete audit failed", error);
  }
  return { deleted: users.length, names };
}
