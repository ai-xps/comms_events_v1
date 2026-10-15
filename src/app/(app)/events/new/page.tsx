import { requireUser } from "@/lib/auth";
import { EventForm } from "@/components/EventForm";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export default async function NewEventPage() {
  await requireUser(["admin", "cell leader"]);
  const orgs = await prisma.organisation.findMany({ orderBy: { name: "asc" } });
  const settings = await getSettings();
  return (
    <main>
      <h1>Add event</h1>
      <p className="lede">Create a one-off or a weekly series of 12 occurrences.</p>
      <EventForm organisations={orgs} colours={settings.colours} />
    </main>
  );
}
