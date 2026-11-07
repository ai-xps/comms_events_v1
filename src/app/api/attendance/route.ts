import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const bookingId = String(body?.bookingId ?? "");
  const attendance = String(body?.attendance ?? "");
  if (attendance !== "ATTENDED" && attendance !== "ABSENT") {
    return NextResponse.json({ error: "Choose Attended or Didn’t attend." }, { status: 400 });
  }
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, event: true }
  });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (user.role === "member" && booking.userId !== user.id) {
    return NextResponse.json({ error: "You can only confirm your own attendance." }, { status: 403 });
  }
  if (user.role === "cell leader" && booking.user.cellId !== user.cellId) {
    return NextResponse.json({ error: "You can only mark attendance for your own cell." }, { status: 403 });
  }
  await prisma.booking.update({ where: { id: bookingId }, data: { attendance } });
  await writeAudit({
    actorId: user.id,
    action: "attendance.mark",
    entityType: "Booking",
    entityId: bookingId,
    summary: `${user.name} marked ${booking.user.name} as ${attendance} for ${booking.event.title}`
  });
  return NextResponse.json({ ok: true });
}
