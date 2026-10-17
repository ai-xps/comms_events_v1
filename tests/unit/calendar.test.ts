import { describe, expect, it } from "vitest";
import {
  addDaysKey,
  calendarHref,
  dayKeyOf,
  formatDayKey,
  parseCalendarParams,
  parseDayKey,
  parseTypesParam,
  rangeFor,
  rangeLabel,
  sameDayKey,
  stepAnchor,
  toggleCategory,
  weekdayMondayFirst,
  type CalendarState
} from "@/lib/calendar";

const today = { year: 2026, month: 10, day: 17 };

describe("parseCalendarParams", () => {
  it("defaults to month view on today", () => {
    expect(parseCalendarParams({}, today)).toEqual({ view: "month", categories: [], format: "", anchor: today });
  });

  it("accepts a valid anchor date and filters", () => {
    const state = parseCalendarParams({ view: "week", category: "Christian", format: "online", d: "2026-10-20" }, today);
    expect(state).toEqual({
      view: "week",
      categories: ["Christian"],
      format: "online",
      anchor: { year: 2026, month: 10, day: 20 }
    });
  });

  it.each([
    ["not a date", { d: "tomorrow" }],
    ["impossible day", { d: "2026-02-30" }],
    ["year out of range", { d: "1999-01-01" }],
    ["month 13 legacy", { y: "2026", m: "13" }],
    ["garbage legacy", { y: "abc", m: "1" }]
  ])("falls back to today for %s", (_label, params) => {
    expect(parseCalendarParams(params, today).anchor).toEqual(today);
  });

  it("ignores unknown view, category and format", () => {
    const state = parseCalendarParams({ view: "year", category: "Party", format: "hybrid" }, today);
    expect(state.view).toBe("month");
    expect(state.categories).toEqual([]);
    expect(state.format).toBe("");
  });

  it("keeps old y/m links working: current month anchors on today, other months on the 1st", () => {
    expect(parseCalendarParams({ y: "2026", m: "10" }, today).anchor).toEqual(today);
    expect(parseCalendarParams({ y: "2026", m: "11" }, today).anchor).toEqual({ year: 2026, month: 11, day: 1 });
  });
});

describe("rangeFor — regression: day and week views were pinned to the 1st of the month", () => {
  it("day view covers the anchor day, not the 1st", () => {
    const range = rangeFor("day", today);
    expect(range.days).toEqual([today]);
    expect(range.from.toISOString()).toBe("2026-10-16T23:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-10-17T23:00:00.000Z");
  });

  it("week view is Monday to Sunday around the anchor", () => {
    const range = rangeFor("week", today);
    expect(range.days[0]).toEqual({ year: 2026, month: 10, day: 12 });
    expect(range.days[6]).toEqual({ year: 2026, month: 10, day: 18 });
  });

  it("handles the clocks going back on Sunday 25 October 2026", () => {
    const week = rangeFor("week", { year: 2026, month: 10, day: 25 });
    expect(week.from.toISOString()).toBe("2026-10-18T23:00:00.000Z");
    expect(week.to.toISOString()).toBe("2026-10-26T00:00:00.000Z");
    const day = rangeFor("day", { year: 2026, month: 10, day: 25 });
    expect(day.to.getTime() - day.from.getTime()).toBe(25 * 60 * 60 * 1000);
  });

  it("month view is a six-week grid starting on a Monday", () => {
    const range = rangeFor("month", today);
    expect(range.days).toHaveLength(42);
    expect(range.days[0]).toEqual({ year: 2026, month: 9, day: 28 });
    expect(weekdayMondayFirst(range.days[0])).toBe(0);
  });
});

describe("stepAnchor", () => {
  it("steps by a day, a week, or a month", () => {
    expect(stepAnchor("day", today, 1)).toEqual({ year: 2026, month: 10, day: 18 });
    expect(stepAnchor("week", today, -1)).toEqual({ year: 2026, month: 10, day: 10 });
    expect(stepAnchor("month", today, 1)).toEqual({ year: 2026, month: 11, day: 17 });
  });

  it("crosses year ends and clamps short months", () => {
    expect(stepAnchor("day", { year: 2026, month: 12, day: 31 }, 1)).toEqual({ year: 2027, month: 1, day: 1 });
    expect(stepAnchor("month", { year: 2026, month: 1, day: 15 }, -1)).toEqual({ year: 2025, month: 12, day: 15 });
    expect(stepAnchor("month", { year: 2026, month: 1, day: 31 }, 1)).toEqual({ year: 2026, month: 2, day: 28 });
  });
});

describe("calendarHref — regression: 'All types' kept the selected type", () => {
  const state: CalendarState = {
    view: "week",
    categories: ["Christian"],
    format: "online",
    anchor: today
  };

  it("clearing types removes them but keeps the other filters", () => {
    expect(calendarHref(state, { categories: [] })).toBe("/calendar?view=week&format=online&d=2026-10-17");
  });

  it("clearing the format removes it but keeps the types", () => {
    expect(calendarHref(state, { format: "" })).toBe("/calendar?view=week&types=Christian&d=2026-10-17");
  });

  it("switching view keeps filters and date", () => {
    expect(calendarHref(state, { view: "day" })).toBe(
      "/calendar?view=day&types=Christian&format=online&d=2026-10-17"
    );
  });

  it("puts two types on the query and All types drops them", () => {
    const both = toggleCategory(["Christian"], "Networking");
    expect(both).toEqual(["Christian", "Networking"]);
    expect(toggleCategory(["Christian"], "Christian")).toEqual([]);
    expect(calendarHref(state, { categories: both })).toContain("types=Christian%2CNetworking");
    expect(parseTypesParam("Christian,Networking,Party")).toEqual(["Christian", "Networking"]);
    expect(parseCalendarParams({ types: "Christian,Networking" }, today).categories).toEqual([
      "Christian",
      "Networking"
    ]);
  });
});

describe("helpers", () => {
  it("formats and parses day keys", () => {
    expect(formatDayKey({ year: 2026, month: 3, day: 5 })).toBe("2026-03-05");
    expect(parseDayKey("2026-03-05")).toEqual({ year: 2026, month: 3, day: 5 });
    expect(parseDayKey(undefined)).toBeNull();
  });

  it("reads London dates from instants", () => {
    expect(dayKeyOf(new Date("2026-10-16T23:30:00Z"))).toEqual(today);
  });

  it("compares and adds days", () => {
    expect(sameDayKey(addDaysKey(today, 1), { year: 2026, month: 10, day: 18 })).toBe(true);
    expect(sameDayKey(today, { year: 2026, month: 10, day: 18 })).toBe(false);
  });

  it("labels ranges", () => {
    expect(rangeLabel("day", today)).toBe("Saturday 17 October 2026");
    expect(rangeLabel("week", today)).toBe("12 to 18 October 2026");
    expect(rangeLabel("week", { year: 2026, month: 10, day: 28 })).toBe("26 October 2026 to 1 November 2026");
    expect(rangeLabel("month", today)).toBe("October 2026");
  });
});
