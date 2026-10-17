import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { parseMemberAttendeeView } from "@/lib/constants";
import { writeAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can change settings." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const enabled = (body.enabled ?? {}) as Record<string, boolean>;
  const memberAttendeeView = parseMemberAttendeeView(body.memberAttendeeView);
  const previous = await prisma.settings.findUnique({ where: { id: "default" } });
  const previousView = parseMemberAttendeeView(previous?.memberAttendeeView);
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      locationLabel: String(body.locationLabel ?? "Birmingham"),
      memberAttendeeView,
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
      memberAttendeeView,
      categoryColours: JSON.stringify(body.colours ?? {}),
      priorityUrls: JSON.stringify([])
    }
  });
  if (memberAttendeeView !== previousView) {
    await writeAudit({
      actorId: user.id,
      action: "settings.memberAttendeeView",
      entityType: "Settings",
      entityId: "default",
      summary: `${user.name} changed what members see for attendees from ${previousView} to ${memberAttendeeView}`
    });
  }
  return NextResponse.json({ ok: true });
}
