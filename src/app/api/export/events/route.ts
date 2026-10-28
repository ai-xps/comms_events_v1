import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { addDaysKey, parseDayKey } from "@/lib/calendar";
import { londonDate } from "@/lib/time";
import { eventsForRange, eventsToCsv, eventsToExcel, logEventsExport } from "@/lib/export-events";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { from?: string; to?: string; format?: string };
  const fromKey = parseDayKey(body.from);
  const toKey = parseDayKey(body.to);
  if (!fromKey || !toKey) {
    return NextResponse.json({ error: "Choose a start and end date." }, { status: 400 });
  }
  const from = londonDate(fromKey.year, fromKey.month, fromKey.day, 0, 0);
  const after = addDaysKey(toKey, 1);
  const to = londonDate(after.year, after.month, after.day, 0, 0);
  const format = body.format === "xlsx" ? "xlsx" : "csv";
  try {
    const rows = await eventsForRange(user, from, to);
    await logEventsExport(user, format, from, to, rows.length);
    if (format === "csv") {
      return new NextResponse(eventsToCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="gather-events.csv"'
        }
      });
    }
    const buffer = await eventsToExcel(rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="gather-events.xlsx"'
      }
    });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Export failed." }, { status });
  }
}
