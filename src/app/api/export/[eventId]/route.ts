import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { bookingsForExport, logExport, toCsv, toExcel } from "@/lib/export-bookings";

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (user.role === "member") {
    return NextResponse.json({ error: "Members cannot export." }, { status: 403 });
  }
  const { eventId } = await params;
  const format = request.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  try {
    const { event, rows } = await bookingsForExport(eventId, user);
    await logExport(user, eventId, format);
    if (format === "csv") {
      return new NextResponse(toCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slug(event.title)}.csv"`
        }
      });
    }
    const buffer = await toExcel(rows);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${slug(event.title)}.xlsx"`
      }
    });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Export failed." }, { status });
  }
}

function slug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "event";
}
