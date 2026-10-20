import { requireUser } from "@/lib/auth";
import { EventForm } from "@/components/EventForm";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { parseDayKey } from "@/lib/calendar";
import { londonDate, toDatetimeLocalValue } from "@/lib/time";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  await requireUser(["admin", "cell leader"]);
  const orgs = await prisma.organisation.findMany({ orderBy: { name: "asc" } });
  const settings = await getSettings();
  const day = parseDayKey((await searchParams).d);
  const start = day ? londonDate(day.year, day.month, day.day, 9, 0) : null;
  const end = day ? londonDate(day.year, day.month, day.day, 10, 0) : null;
  return (
    <main>
      <h1>Add event</h1>
      <p className="lede">Create a one-off or a weekly series of 12 occurrences. Place as text, then find it on the map or drop a pin.</p>
      <EventForm
        organisations={orgs}
        colours={settings.colours}
        defaultStartsAt={start ? toDatetimeLocalValue(start) : undefined}
        defaultEndsAt={end ? toDatetimeLocalValue(end) : undefined}
      />
    </main>
  );
}
