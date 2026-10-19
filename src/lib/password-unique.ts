import { prisma } from "./db";
import { verifyPassword } from "./password";

/**
 * Passwords must be unique so shared cell numbers can pick the right person.
 * Demo-sized user lists only — bcrypt-compare against each hash.
 */
export async function passwordInUse(
  plain: string,
  exceptUserId?: string
): Promise<boolean> {
  const users = await prisma.user.findMany({
    select: { id: true, passwordHash: true }
  });
  for (const user of users) {
    if (exceptUserId && user.id === exceptUserId) continue;
    if (await verifyPassword(plain, user.passwordHash)) return true;
  }
  return false;
}
