import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { CATEGORIES, DEFAULT_COLOURS, parseMemberAttendeeView } from "@/lib/constants";
import { isHexColour } from "@/lib/security";
import { parsePriorityUrls } from "@/lib/scraper/allowlist";
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
  const submittedColours = (body.colours ?? {}) as Record<string, unknown>;
  const colours = Object.fromEntries(
    CATEGORIES.map((c) => [c, isHexColour(submittedColours[c]) ? submittedColours[c] : DEFAULT_COLOURS[c]])
  );
  const parsedUrls = parsePriorityUrls(Array.isArray(body.priorityUrls) ? body.priorityUrls : []);
  const priorityUrls = parsedUrls.urls;
  const locationLabel = String(body.locationLabel ?? "Birmingham").trim().slice(0, 80) || "Birmingham";
  const previous = await prisma.settings.findUnique({ where: { id: "default" } });
  const previousView = parseMemberAttendeeView(previous?.memberAttendeeView);
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      locationLabel,
      memberAttendeeView,
      christianEnabled: !!enabled.Christian,
      networkingEnabled: !!enabled.Networking,
      professionalEnabled: !!enabled.Professional,
      studentEnabled: !!enabled.Student,
      meetupEnabled: !!enabled.Meetup,
      categoryColours: JSON.stringify(colours),
      priorityUrls: JSON.stringify(priorityUrls)
    },
    create: {
      id: "default",
      locationLabel,
      memberAttendeeView,
      categoryColours: JSON.stringify(colours),
      priorityUrls: JSON.stringify(priorityUrls)
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
  if (parsedUrls.rejected.length) {
    await writeAudit({
      actorId: user.id,
      action: "settings.priorityUrls.dropped",
      entityType: "Settings",
      entityId: "default",
      summary: `${user.name} saved settings; left out ${parsedUrls.rejected.length} Priority URL(s) not on the allowlist: ${parsedUrls.rejected
        .map((item) => item.url)
        .join(", ")}`
    });
  }
  return NextResponse.json({ ok: true, dropped: parsedUrls.rejected });
}
