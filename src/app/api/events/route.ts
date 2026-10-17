import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canReview } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { fromDatetimeLocalValue } from "@/lib/time";
import { CATEGORIES, type Category } from "@/lib/constants";
import { createWeeklySeries } from "@/lib/series";
import { writeAudit } from "@/lib/audit";
import { eventInputProblem } from "@/lib/security";

function parseEvent(body: Record<string, unknown>) {
  const category = String(body.category ?? "");
  if (!CATEGORIES.includes(category as Category)) throw new Error("Choose a valid event type.");
  const startsAt = fromDatetimeLocalValue(String(body.startsAt));
  const endsAt = fromDatetimeLocalValue(String(body.endsAt));
  const capacityRaw = String(body.capacity ?? "").trim();
  const problem = eventInputProblem({
    title: String(body.title ?? ""),
    notes: String(body.notes ?? ""),
    externalUrl: String(body.externalUrl ?? "").trim(),
    capacity: capacityRaw === "" ? null : Number(capacityRaw),
    startsAt,
    endsAt
  });
  if (problem) throw new Error(problem);
  return {
    title: String(body.title ?? "").trim(),
    organisationName: String(body.organisationName ?? "").trim(),
    category: category as Category,
    startsAt,
    endsAt,
    online: body.online === true || body.online === "on",
    placeName: String(body.placeName ?? "").trim() || null,
    lat: String(body.lat ?? "") ? Number(body.lat) : null,
    lng: String(body.lng ?? "") ? Number(body.lng) : null,
    externalUrl: String(body.externalUrl ?? "").trim() || null,
    notes: String(body.notes ?? "").trim() || null,
    capacity: capacityRaw === "" ? null : Number(capacityRaw),
    recurrence: String(body.recurrence ?? "NONE")
  };
}

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || !canReview(user)) {
    return NextResponse.json({ error: "You cannot add events." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const parsed = parseEvent(body);
    if (!parsed.title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (parsed.recurrence === "WEEKLY") {
      const seriesId = await createWeeklySeries({ actor: user, ...parsed, status: "PUBLISHED" });
      const first = await prisma.event.findFirst({ where: { seriesId }, orderBy: { startsAt: "asc" } });
      return NextResponse.json({ ok: true, id: first?.id });
    }
    const event = await prisma.event.create({
      data: {
        ...parsed,
        recurrence: "NONE",
        status: "PUBLISHED",
        createdById: user.id,
        lat: Number.isFinite(parsed.lat) ? parsed.lat : null,
        lng: Number.isFinite(parsed.lng) ? parsed.lng : null
      }
    });
    await writeAudit({
      actorId: user.id,
      action: "event.create",
      entityType: "Event",
      entityId: event.id,
      summary: `${user.name} created ${event.title}`
    });
    return NextResponse.json({ ok: true, id: event.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save." }, { status: 400 });
  }
}
