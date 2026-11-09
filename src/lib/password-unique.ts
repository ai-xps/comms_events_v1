import { prisma } from "./db";
import { verifyPassword } from "./password";

/**
 * Among people who share this cell number, passwords must be unique
 * so login can tell them apart. Different cell numbers may reuse a password.
 */
export async function passwordInUse(
  plain: string,
  cellNumber: string,
  exceptUserId?: string
): Promise<boolean> {
  const users = await prisma.user.findMany({
    where: { cellNumber },
    select: { id: true, passwordHash: true }
  });
  for (const user of users) {
    if (exceptUserId && user.id === exceptUserId) continue;
    if (await verifyPassword(plain, user.passwordHash)) return true;
  }
  return false;
}
