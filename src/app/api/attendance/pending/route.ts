import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      attendance: "UNCONFIRMED",
      event: { startsAt: { lt: new Date() } }
    },
    include: { event: true },
    orderBy: { event: { startsAt: "desc" } }
  });
  return NextResponse.json({
    items: bookings.map((b) => ({
      id: b.id,
      eventId: b.eventId,
      title: b.event.title,
      when: formatDateTime(b.event.startsAt)
    }))
  });
}
