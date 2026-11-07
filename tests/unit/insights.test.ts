import { describe, expect, it } from "vitest";
import { aggregateInsights, pctLabel } from "@/lib/insights/aggregate";
import { parseInsightsParams, previousWindow } from "@/lib/insights/period";
import { summaryLines, tablesFor } from "@/lib/insights/format";
import { shareSummary, shareTargets } from "@/lib/insights/share";
import type { RawInsights } from "@/lib/insights/types";

const from = new Date("2026-10-01T00:00:00Z");
const to = new Date("2026-10-31T00:00:00Z");
const now = new Date("2026-10-20T12:00:00Z");

const raw: RawInsights = {
  events: [
    {
      id: "e1",
      title: "Choir",
      category: "Christian",
      online: false,
      startsAt: new Date("2026-10-10T18:00:00Z"),
      endsAt: new Date("2026-10-10T20:00:00Z"),
      capacity: 10,
      status: "PUBLISHED",
      createdAt: new Date("2026-10-02T10:00:00Z"),
      sourceKey: "choir-1"
    },
    {
      id: "e2",
      title: "Meetup",
      category: "Meetup",
      online: true,
      startsAt: new Date("2026-10-12T18:00:00Z"),
      endsAt: new Date("2026-10-12T19:00:00Z"),
      capacity: null,
      status: "PUBLISHED",
      createdAt: new Date("2026-10-03T10:00:00Z"),
      sourceKey: "meetup-1"
    },
    {
      id: "e3",
      title: "Pending talk",
      category: "Professional",
      online: false,
      startsAt: new Date("2026-10-20T18:00:00Z"),
      endsAt: new Date("2026-10-20T19:00:00Z"),
      capacity: 5,
      status: "PENDING",
      createdAt: new Date("2026-10-04T10:00:00Z"),
      sourceKey: "talk-1"
    }
  ],
  bookings: [
    {
      eventId: "e1",
      userId: "u1",
      bookedById: "l1",
      bookedAt: new Date("2026-10-05T10:00:00Z"),
      attendance: "ATTENDED",
      userCellId: "c1",
      cellName: "North"
    },
    {
      eventId: "e1",
      userId: "u2",
      bookedById: "u2",
      bookedAt: new Date("2026-10-06T10:00:00Z"),
      attendance: "ABSENT",
      userCellId: "c1",
      cellName: "North"
    },
    {
      eventId: "e2",
      userId: "u3",
      bookedById: "u3",
      bookedAt: new Date("2026-10-07T10:00:00Z"),
      attendance: "UNCONFIRMED",
      userCellId: "c2",
      cellName: "South"
    }
  ],
  stars: [{ eventId: "e1" }, { eventId: "e2" }],
  runs: [
    {
      startedAt: new Date("2026-10-08T04:00:00Z"),
      trigger: "SCHEDULED",
      createdCount: 3,
      publishedCount: 1,
      discardedByRule: 0,
      leftPending: 2,
      status: "ok"
    }
  ],
  members: [
    { id: "u1", active: true, cellId: "c1" },
    { id: "u2", active: true, cellId: "c1" },
    { id: "u3", active: true, cellId: "c2" },
    { id: "u4", active: false, cellId: "c2" }
  ]
};

const filters = {
  from,
  to,
  preset: "30" as const,
  category: "" as const,
  format: "" as const,
  cellId: null
};

describe("aggregateInsights", () => {
  const data = aggregateInsights(raw, filters, { kind: "region" }, now);

  it("counts published events, clicks, members and stars", () => {
    expect(data.kpis.eventsPublished).toBe(2);
    expect(data.kpis.attendClicks).toBe(3);
    expect(data.kpis.activeMembers).toBe(3);
    expect(data.kpis.stars).toBe(2);
  });

  it("computes attendance, confirmation, no-show, fill and delegate share", () => {
    // e1 has ended: 1 attended, 1 absent. e2 has also ended by 20 Oct.
    expect(data.kpis.attendanceRate).toBe(0.5);
    expect(data.kpis.noShowRate).toBe(0.5);
    expect(data.kpis.confirmationRate).toBeCloseTo(2 / 3);
    expect(data.kpis.fillRate).toBe(0.2);
    expect(data.kpis.delegateShare).toBeCloseTo(1 / 3);
  });

  it("splits by type and format", () => {
    expect(data.byCategory.find((r) => r.key === "Christian")?.count).toBe(2);
    expect(data.byCategory.find((r) => r.key === "Meetup")?.count).toBe(1);
    expect(data.byFormat.find((r) => r.key === "online")?.count).toBe(1);
    expect(data.byFormat.find((r) => r.key === "inperson")?.count).toBe(2);
  });

  it("suppresses a cell with fewer than three people", () => {
    expect(data.byCell.every((r) => r.suppressed)).toBe(true);
  });

  it("builds the review funnel from scraped events created in the window", () => {
    expect(data.funnel).toEqual({ scraped: 3, pending: 1, published: 2, discarded: 0 });
  });

  it("lists the busiest events first", () => {
    expect(data.topEvents[0].id).toBe("e1");
    expect(data.topEvents[0].bookings).toBe(2);
  });
});

describe("period and share", () => {
  it("defaults to the last 30 days", () => {
    const nowDate = new Date("2026-10-17T12:00:00Z");
    const parsed = parseInsightsParams({}, nowDate);
    expect(parsed.preset).toBe("30");
    expect(parsed.to.getTime() - parsed.from.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("builds a previous window of the same length", () => {
    const prev = previousWindow(from, to);
    expect(prev.to).toEqual(from);
    expect(prev.to.getTime() - prev.from.getTime()).toBe(to.getTime() - from.getTime());
  });

  it("share text has totals and a link, never a name or cell number", () => {
    const data = aggregateInsights(raw, filters, { kind: "region" }, now);
    const text = shareSummary(data, "https://example.com", filters);
    expect(text).toContain("https://example.com/insights");
    expect(text).toContain("3 Attend clicks");
    expect(text).not.toMatch(/Hannah|07000000004|u1/);
    expect(shareTargets(text).map((t) => t.id)).toEqual(["whatsapp", "email", "teams", "telegram", "copy", "device"]);
  });

  it("export tables include the summary measures", () => {
    const data = aggregateInsights(raw, filters, { kind: "region" }, now);
    const tables = tablesFor(data, "summary");
    expect(tables[0].rows[1][1]).toBe(3);
    expect(summaryLines(data)[0]).toMatch(/^Generated /);
    expect(tablesFor(data, "weekly")[0].name).toBe("Weekly trend");
    expect(tablesFor(data, "byType")[0].name).toBe("By event type");
    expect(tablesFor(data, "byCell")[0].name).toBe("By cell");
    expect(tablesFor(data, "perEvent")[0].name).toBe("Per-event attendance");
    expect(tablesFor(data, "attendees")[0].name).toBe("Attendee list");
    expect(tablesFor(data, "everything").length).toBeGreaterThan(3);
  });
});

describe("pctLabel", () => {
  it("renders a dash when there is no denominator", () => {
    expect(pctLabel(null)).toBe("—");
    expect(pctLabel(0.5)).toBe("50%");
  });
});
