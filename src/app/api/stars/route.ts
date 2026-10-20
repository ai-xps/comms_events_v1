import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { dropEndedStars } from "@/lib/stars";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const eventId = String(body?.eventId ?? "");
  await dropEndedStars();
  const existing = await prisma.star.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } }
  });
  if (existing) {
    await prisma.star.delete({ where: { id: existing.id } });
    return NextResponse.json({ starred: false });
  }
  await prisma.star.create({ data: { userId: user.id, eventId } });
  return NextResponse.json({ starred: true });
}
