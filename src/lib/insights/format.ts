import { pctLabel } from "./aggregate";
import type { InsightsData } from "./types";
import type { Table } from "@/lib/export-format";

export function summaryLines(data: InsightsData): string[] {
  const { kpis } = data;
  return [
    `Generated ${data.generatedAt}`,
    `Scope: ${data.scope.kind === "region" ? "region" : `cell ${data.scope.cellId}`}`,
    `Period: ${data.filters.from} to ${data.filters.to}`,
    `Published events: ${kpis.eventsPublished}`,
    `Attend clicks: ${kpis.attendClicks}`,
    `Active members: ${kpis.activeMembers}`,
    `Attendance rate: ${pctLabel(kpis.attendanceRate)}`,
    `Confirmation rate: ${pctLabel(kpis.confirmationRate)}`,
    `No-show rate: ${pctLabel(kpis.noShowRate)}`,
    `Average fill: ${pctLabel(kpis.fillRate)}`,
    `Booked by a cell leader for someone else: ${pctLabel(kpis.delegateShare)}`,
    `Stars: ${kpis.stars}`
  ];
}

export function tablesFor(data: InsightsData, dataset: string, attendeeRows: (string | number)[][] = []): Table[] {
  const summary: Table = {
    name: "Summary",
    columns: ["Measure", "Value"],
    rows: [
      ["Published events", data.kpis.eventsPublished],
      ["Attend clicks", data.kpis.attendClicks],
      ["Active members", data.kpis.activeMembers],
      ["Attendance rate", pctLabel(data.kpis.attendanceRate)],
      ["Confirmation rate", pctLabel(data.kpis.confirmationRate)],
      ["No-show rate", pctLabel(data.kpis.noShowRate)],
      ["Average fill", pctLabel(data.kpis.fillRate)],
      ["Delegate share", pctLabel(data.kpis.delegateShare)],
      ["Stars", data.kpis.stars]
    ]
  };
  const weekly: Table = {
    name: "Weekly trend",
    columns: ["Week starting", "Attend clicks", "Attended", "Didn't attend", "Unconfirmed"],
    rows: data.weeks.map((w) => [w.weekStart, w.attendClicks, w.attended, w.absent, w.unconfirmed])
  };
  const byType: Table = {
    name: "By event type",
    columns: ["Type", "Attend clicks"],
    rows: data.byCategory.map((r) => [r.label, r.count])
  };
  const byCell: Table = {
    name: "By cell",
    columns: ["Cell", "Attend clicks"],
    rows: data.byCell.map((r) => [r.suppressed ? `${r.label} (fewer than 3 people)` : r.label, r.suppressed ? "<3" : r.count])
  };
  const perEvent: Table = {
    name: "Per-event attendance",
    columns: ["Event", "Starts", "Bookings", "Capacity", "Fill", "Attendance"],
    rows: data.topEvents.map((e) => [
      e.title,
      e.startsAt,
      e.bookings,
      e.capacity ?? "",
      pctLabel(e.fillPct),
      pctLabel(e.attendancePct)
    ])
  };
  const attendees: Table = {
    name: "Attendee list",
    columns: ["Event", "When", "Name", "Cell number", "Cell", "Attendance", "Booked by"],
    rows: attendeeRows
  };
  const all = { summary, weekly, byType, byCell, perEvent, attendees };
  if (dataset === "everything") return Object.values(all);
  if (dataset === "weekly") return [weekly];
  if (dataset === "byType") return [byType];
  if (dataset === "byCell") return [byCell];
  if (dataset === "perEvent") return [perEvent];
  if (dataset === "attendees") return [attendees];
  return [summary];
}
