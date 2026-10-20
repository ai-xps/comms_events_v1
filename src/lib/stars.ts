import { prisma } from "./db";
import { eventEnd, nowUtc } from "./time";

export async function dropEndedStars() {
  const stars = await prisma.star.findMany({ include: { event: true } });
  const now = nowUtc();
  const expired = stars.filter((star) => eventEnd(star.event.startsAt, star.event.endsAt) < now);
  if (expired.length === 0) return;
  await prisma.star.deleteMany({
    where: { id: { in: expired.map((s) => s.id) } }
  });
}
