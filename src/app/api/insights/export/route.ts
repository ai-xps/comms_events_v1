import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { insightsScope } from "@/lib/policy";
import { writeAudit } from "@/lib/audit";
import { parseInsightsParams } from "@/lib/insights/period";
import { loadAttendeeRows, loadRawInsights } from "@/lib/insights/load";
import { aggregateInsights } from "@/lib/insights/aggregate";
import { summaryLines, tablesFor } from "@/lib/insights/format";
import { DATASETS, EXPORT_FORMATS, type Dataset, type ExportFormat } from "@/lib/insights/types";
import { toCsv, toJson, toTxt, toXlsx } from "@/lib/export-format";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const scope = insightsScope(user, body.cell);
  if (!scope) return NextResponse.json({ error: "You cannot export insights." }, { status: 403 });
  const dataset = DATASETS.includes(body.dataset as Dataset) ? (body.dataset as Dataset) : "summary";
  const format = EXPORT_FORMATS.includes(body.format as ExportFormat) ? (body.format as ExportFormat) : "csv";
  const filters = parseInsightsParams(body);
  const raw = await loadRawInsights(scope, filters);
  const data = aggregateInsights(raw, filters, scope);
  const eventIds = raw.events
    .filter((e) => e.status === "PUBLISHED" && e.startsAt >= filters.from && e.startsAt < filters.to)
    .map((e) => e.id);
  const attendeeRows =
    dataset === "attendees" || dataset === "everything"
      ? (await loadAttendeeRows(scope, eventIds)).map((r) => [
          r.event,
          r.when,
          r.name,
          r.cellNumber,
          r.cell,
          r.attendance,
          r.bookedBy
        ])
      : [];
  const tables = tablesFor(data, dataset, attendeeRows);
  const stamp = data.generatedAt.slice(0, 10);
  const filename = `gather-insights-${dataset}-${stamp}.${format}`;
  let buffer: Buffer;
  let type: string;
  if (format === "csv") {
    buffer = Buffer.from(toCsv(tables[0]), "utf8");
    type = "text/csv; charset=utf-8";
  } else if (format === "txt") {
    buffer = Buffer.from(toTxt("Gather insights", summaryLines(data), tables), "utf8");
    type = "text/plain; charset=utf-8";
  } else if (format === "json") {
    buffer = Buffer.from(
      toJson(
        {
          generatedAt: data.generatedAt,
          schemaVersion: data.schemaVersion,
          scope: data.scope,
          filters: data.filters
        },
        tables
      ),
      "utf8"
    );
    type = "application/json; charset=utf-8";
  } else {
    buffer = await toXlsx(tables);
    type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  await writeAudit({
    actorId: user.id,
    action: "insights.export",
    entityType: "Insights",
    summary: `${user.name} exported ${dataset} as ${format} (${scope.kind})`
  });
  return NextResponse.json({
    ok: true,
    filename,
    type,
    body: buffer.toString("base64")
  });
}
