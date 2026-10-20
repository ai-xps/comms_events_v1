import { prisma } from "./db";
import { addDays } from "./time";
import { writeAudit } from "./audit";
import type { SessionUser } from "./session";
import type { Category } from "./constants";

export async function createWeeklySeries(input: {
  actor: SessionUser;
  title: string;
  organisationName: string;
  organisationId?: string | null;
  category: Category;
  startsAt: Date;
  endsAt: Date;
  online: boolean;
  placeName?: string | null;
  lat?: number | null;
  lng?: number | null;
  externalUrl?: string | null;
  notes?: string | null;
  capacity?: number | null;
  status?: "PENDING" | "PUBLISHED";
}) {
  const seriesId = crypto.randomUUID();
  const duration = input.endsAt.getTime() - input.startsAt.getTime();
  const rows = Array.from({ length: 12 }, (_, i) => {
    const startsAt = addDays(input.startsAt, i * 7);
    return {
      seriesId,
      title: input.title,
      organisationName: input.organisationName,
      organisationId: input.organisationId ?? null,
      category: input.category,
      startsAt,
      endsAt: new Date(startsAt.getTime() + duration),
      online: input.online,
      placeName: input.placeName ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      externalUrl: input.externalUrl ?? null,
      notes: input.notes ?? null,
      capacity: input.capacity ?? null,
      status: input.status ?? "PUBLISHED",
      recurrence: "WEEKLY",
      createdById: input.actor.id
    };
  });
  await prisma.event.createMany({ data: rows });
  await writeAudit({
    actorId: input.actor.id,
    action: "event.series.create",
    entityType: "Event",
    entityId: seriesId,
    summary: `${input.actor.name} created weekly series ${input.title}`
  });
  return seriesId;
}

export async function deleteOccurrence(opts: {
  eventId: string;
  mode: "this" | "future";
  actor: SessionUser;
}) {
  const event = await prisma.event.findUnique({ where: { id: opts.eventId } });
  if (!event) throw new Error("Event not found");
  if (opts.mode === "this" || !event.seriesId) {
    await prisma.event.delete({ where: { id: event.id } });
  } else {
    await prisma.event.deleteMany({
      where: {
        seriesId: event.seriesId,
        startsAt: { gte: event.startsAt }
      }
    });
  }
  await writeAudit({
    actorId: opts.actor.id,
    action: "event.delete",
    entityType: "Event",
    entityId: event.id,
    summary: `${opts.actor.name} deleted ${opts.mode === "future" ? "this and future occurrences of" : "occurrence of"} ${event.title}`
  });
}
