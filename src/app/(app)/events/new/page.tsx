import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { EventForm } from "@/components/EventForm";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { parseDayKey } from "@/lib/calendar";
import { londonDate, toDatetimeLocalValue } from "@/lib/time";

function parseTimeParam(value: string | undefined): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export default async function NewEventPage({
  searchParams
}: {
  searchParams: Promise<{ d?: string; t?: string }>
}) {
  await requireUser(["admin", "cell leader"]);
  const orgs = await prisma.organisation.findMany({ orderBy: { name: "asc" } });
  const settings = await getSettings();
  const params = await searchParams;
  const day = parseDayKey(params.d);
  const time = parseTimeParam(params.t);
  const hour = time?.hour ?? 9;
  const minute = time?.minute ?? 0;
  const endMinuteTotal = hour * 60 + minute + 60;
  const endHour = Math.floor(endMinuteTotal / 60) % 24;
  const endMinute = endMinuteTotal % 60;
  const start = day ? londonDate(day.year, day.month, day.day, hour, minute) : null;
  const end = day ? londonDate(day.year, day.month, day.day, endHour, endMinute) : null;
  return (
    <main>
      <p className="row" style={{ marginBottom: "0.75rem" }}>
        <Link className="button ghost" href="/calendar">
          ← Back to calendar
        </Link>
      </p>
      <h1>Add event</h1>
      <p className="lede">
        Create a one-off or a weekly series of 24 occurrences. Place as text, then find it on the map or drop a pin.
      </p>
      <EventForm
        organisations={orgs}
        colours={settings.colours}
        defaultStartsAt={start ? toDatetimeLocalValue(start) : undefined}
        defaultEndsAt={end ? toDatetimeLocalValue(end) : undefined}
      />
    </main>
  );
}
