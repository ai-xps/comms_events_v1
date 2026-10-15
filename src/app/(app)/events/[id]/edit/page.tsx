import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EventForm } from "@/components/EventForm";
import { getSettings } from "@/lib/settings";
import { toDatetimeLocalValue } from "@/lib/time";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["admin", "cell leader"]);
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();
  const orgs = await prisma.organisation.findMany({ orderBy: { name: "asc" } });
  const settings = await getSettings();
  return (
    <main>
      <h1>{event.status === "PENDING" ? "Review event" : "Edit event"}</h1>
      <EventForm
        organisations={orgs}
        colours={settings.colours}
        event={{
          id: event.id,
          title: event.title,
          organisationName: event.organisationName,
          organisationId: event.organisationId,
          category: event.category,
          startsAt: toDatetimeLocalValue(event.startsAt),
          endsAt: toDatetimeLocalValue(event.endsAt),
          online: event.online,
          placeName: event.placeName ?? "",
          lat: event.lat,
          lng: event.lng,
          externalUrl: event.externalUrl ?? "",
          notes: event.notes ?? "",
          capacity: event.capacity,
          status: event.status,
          recurrence: event.recurrence,
          seriesId: event.seriesId
        }}
      />
    </main>
  );
}
