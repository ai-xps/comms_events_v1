import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can change settings." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const enabled = (body.enabled ?? {}) as Record<string, boolean>;
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      locationLabel: String(body.locationLabel ?? "Birmingham"),
      memberAttendeeView: body.memberAttendeeView === "COUNT_AND_INITIALS" ? "COUNT_AND_INITIALS" : "COUNT",
      christianEnabled: !!enabled.Christian,
      networkingEnabled: !!enabled.Networking,
      professionalEnabled: !!enabled.Professional,
      studentEnabled: !!enabled.Student,
      meetupEnabled: !!enabled.Meetup,
      categoryColours: JSON.stringify(body.colours ?? {}),
      priorityUrls: JSON.stringify(Array.isArray(body.priorityUrls) ? body.priorityUrls : [])
    },
    create: {
      id: "default",
      locationLabel: String(body.locationLabel ?? "Birmingham"),
      memberAttendeeView: "COUNT",
      categoryColours: JSON.stringify(body.colours ?? {}),
      priorityUrls: JSON.stringify([])
    }
  });
  return NextResponse.json({ ok: true });
}
