import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canReview } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { fromDatetimeLocalValue } from "@/lib/time";
import { writeAudit } from "@/lib/audit";
import { deleteOccurrence } from "@/lib/series";
import { CATEGORIES, type Category } from "@/lib/constants";
import { eventInputProblem } from "@/lib/security";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || !canReview(user)) {
    return NextResponse.json({ error: "You cannot edit events." }, { status: 403 });
  }
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, include: { _count: { select: { bookings: true } } } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const capacityRaw = String(body.capacity ?? "").trim();
  const capacity = capacityRaw === "" ? null : Number(capacityRaw);
  if (capacity !== null && capacity < event._count.bookings) {
    return NextResponse.json({ error: "Capacity cannot be below the current booking count." }, { status: 400 });
  }
  const category = String(body.category ?? event.category);
  if (!CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: "Choose a valid event type." }, { status: 400 });
  }
  const nextStatus =
    body.status === "PUBLISHED" || body.status === "DISCARDED" ? String(body.status) : event.status;
  const statusChanging = nextStatus !== event.status;
  const title = String(body.title ?? event.title).trim();
  const notes = body.notes !== undefined ? String(body.notes).trim() || null : event.notes;
  const externalUrl = body.externalUrl !== undefined ? String(body.externalUrl).trim() || null : event.externalUrl;
  const startsAt = body.startsAt ? fromDatetimeLocalValue(String(body.startsAt)) : event.startsAt;
  const endsAt = body.endsAt ? fromDatetimeLocalValue(String(body.endsAt)) : event.endsAt;
  const lat = body.lat !== undefined && String(body.lat) ? Number(body.lat) : event.lat;
  const lng = body.lng !== undefined && String(body.lng) ? Number(body.lng) : event.lng;
  const problem =
    (title ? null : "Title is required.") ??
    eventInputProblem({ title, notes: notes ?? "", externalUrl: externalUrl ?? "", capacity, startsAt, endsAt });
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  const updated = await prisma.event.update({
    where: { id },
    data: {
      title,
      organisationName: String(body.organisationName ?? event.organisationName),
      category,
      startsAt,
      endsAt,
      online: body.online === true || body.online === "on" || (body.online === undefined && event.online),
      placeName: body.placeName !== undefined ? String(body.placeName) || null : event.placeName,
      lat: Number.isFinite(lat) ? lat : event.lat,
      lng: Number.isFinite(lng) ? lng : event.lng,
      externalUrl,
      notes,
      capacity,
      status: nextStatus,
      reviewedById: statusChanging ? user.id : event.reviewedById,
      // Publish/discard is not a freeze; only a later Save stamps humanEditedAt.
      humanEditedAt: statusChanging ? event.humanEditedAt : new Date()
    }
  });
  if (nextStatus !== event.status) {
    await writeAudit({
      actorId: user.id,
      action: nextStatus === "PUBLISHED" ? "event.publish" : "event.discard",
      entityType: "Event",
      entityId: event.id,
      summary: `${user.name} set ${event.title} to ${nextStatus}`
    });
  }
  return NextResponse.json({ ok: true, id: updated.id });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || !canReview(user)) {
    return NextResponse.json({ error: "You cannot delete events." }, { status: 403 });
  }
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const mode = body.mode === "future" ? "future" : "this";
  await deleteOccurrence({ eventId: id, mode, actor: user });
  return NextResponse.json({ ok: true });
}
