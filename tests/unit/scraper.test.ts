import { describe, expect, it } from "vitest";
import { scrapeDecision, isUpdatedScrapedRow } from "@/lib/scraper/apply";
import { scrapeUrlAllowed } from "@/lib/scraper/allowlist";
import { inferCategory, TYPE_REVIEW_NOTE } from "@/lib/scraper/categorise";
import { fixtureEvents } from "@/lib/scraper/fixtures";
import { parseIcsDate, parseIcsEvents } from "@/lib/scraper/ics";
import { eventsFromJsonLd, extractJsonLdScripts } from "@/lib/scraper/jsonld";
import { fetchLiveEvents, type FetchLike } from "@/lib/scraper/live-adapter";
import { londonParts } from "@/lib/time";

describe("fixture harvest", () => {
  const events = fixtureEvents();

  it("uses fixture- keys, unique, and real Event Links except one blank", () => {
    const keys = events.map((e) => e.sourceKey);
    expect(keys.every((k) => k.startsWith("fixture-"))).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
    const blank = events.filter((e) => !e.externalUrl);
    expect(blank).toHaveLength(1);
    expect(blank[0].sourceKey).toBe("fixture-poetry-tbc");
    expect(events.filter((e) => e.externalUrl).every((e) => e.externalUrl?.startsWith("https://"))).toBe(true);
  });

  it("includes a duplicate title from two organisations and a weekly prayer series", () => {
    const openMic = events.filter((e) => e.title === "Open mic night");
    expect(openMic.map((e) => e.organisationName).sort()).toEqual([
      "Birmingham City University",
      "Birmingham Tech Meetup"
    ]);
    const prayers = events.filter((e) => e.sourceKey.startsWith("fixture-carrs-lane-prayer-"));
    expect(prayers).toHaveLength(4);
    const days = prayers.map((e) => londonParts(e.startsAt).day);
    expect(new Set(days).size).toBe(4);
  });
});

describe("scrapeDecision", () => {
  it("never undeletes a discarded event", () => {
    expect(scrapeDecision("DISCARDED", "WHITELIST")).toEqual({ action: "skip-discarded" });
  });

  it("updates published and pending in place", () => {
    expect(scrapeDecision("PUBLISHED", "STANDARD")).toEqual({ action: "update" });
    expect(scrapeDecision("PENDING", "WHITELIST")).toEqual({ action: "update" });
  });

  it("applies org rules only on insert", () => {
    expect(scrapeDecision(null, "WHITELIST")).toEqual({ action: "create", status: "PUBLISHED" });
    expect(scrapeDecision(null, "BLACKLIST")).toEqual({ action: "create", status: "DISCARDED" });
    expect(scrapeDecision(undefined, "STANDARD")).toEqual({ action: "create", status: "PENDING" });
  });

  it("marks a row updated when timestamps differ", () => {
    const created = new Date("2026-10-17T10:00:00Z");
    expect(isUpdatedScrapedRow(created, created)).toBe(false);
    expect(isUpdatedScrapedRow(created, new Date("2026-10-17T10:01:00Z"))).toBe(true);
  });
});

describe("allowlist", () => {
  it("accepts cathedral https and a calendar file", () => {
    expect(scrapeUrlAllowed("https://birminghamcathedral.com/worship/").ok).toBe(true);
    expect(scrapeUrlAllowed("https://example.com/calendar.ics").ok).toBe(true);
  });

  it("rejects http off localhost and unknown html hosts", () => {
    expect(scrapeUrlAllowed("http://evil.example/x").ok).toBe(false);
    expect(scrapeUrlAllowed("https://evil.example/events").ok).toBe(false);
    expect(scrapeUrlAllowed("javascript:alert(1)").ok).toBe(false);
  });
});

describe("inferCategory", () => {
  it("uses the host when known and leaves a review note when not", () => {
    expect(inferCategory({ host: "birminghamcathedral.com", title: "Talk", organisationName: "X" })).toEqual({
      category: "Christian",
      inferred: true
    });
    const unknown = inferCategory({ host: "calendar.google.com", title: "Community gathering", organisationName: "Anon" });
    expect(unknown.inferred).toBe(false);
    expect(TYPE_REVIEW_NOTE.length).toBeGreaterThan(10);
    expect(inferCategory({ title: "University careers fair", organisationName: "UoB" }).category).toBe("Student");
  });
});

const ICS = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:eucharist-1
SUMMARY:Sung Eucharist
DTSTART;TZID=Europe/London:20261019T110000
DTEND;TZID=Europe/London:20261019T121500
LOCATION:Colmore Row
URL:https://birminghamcathedral.com/worship/regular-worship/
END:VEVENT
END:VCALENDAR`;

describe("ICS", () => {
  it("parses a London wall-clock start", () => {
    const start = parseIcsDate("20261019T110000");
    expect(start).not.toBeNull();
    expect(londonParts(start as Date)).toMatchObject({ year: 2026, month: 10, day: 19, hour: 11, minute: 0 });
  });

  it("maps VEVENT into a scraped event with a stable key", () => {
    const [event] = parseIcsEvents(ICS, "https://birminghamcathedral.com/calendar.ics");
    expect(event.sourceKey).toBe("live:birminghamcathedral.com:eucharist-1");
    expect(event.title).toBe("Sung Eucharist");
    expect(event.placeName).toBe("Colmore Row");
    expect(event.externalUrl).toContain("https://");
  });
});

describe("JSON-LD", () => {
  it("reads Event blocks from a script tag", () => {
    const html = `<script type="application/ld+json">{"@type":"Event","name":"Careers fair","startDate":"2026-10-20T10:00:00+01:00","url":"https://www.birmingham.ac.uk/study/student-experience/careers"}</script>`;
    const [payload] = extractJsonLdScripts(html);
    const [event] = eventsFromJsonLd(payload, "https://www.birmingham.ac.uk/events");
    expect(event.title).toBe("Careers fair");
    expect(event.externalUrl).toContain("birmingham.ac.uk");
  });

  it("walks @graph, skips broken scripts and events without a start", () => {
    const html = `<script type="application/ld+json">not-json</script>
<script type="application/ld+json">{"@graph":[{"@type":["Event","Thing"],"name":"Panel","startDate":"2026-10-21T16:00:00Z","organizer":{"name":"Aston SU"},"eventAttendanceMode":"https://schema.org/OnlineEventAttendanceMode","location":{"name":"Online"}}]}</script>`;
    const blocks = extractJsonLdScripts(html);
    expect(blocks).toHaveLength(1);
    const [event] = eventsFromJsonLd(blocks[0], "https://www.astonsu.com/events/");
    expect(event.title).toBe("Panel");
    expect(event.organisationName).toBe("Aston SU");
    expect(event.online).toBe(true);
    expect(eventsFromJsonLd({ "@type": "Event", name: "No date" }, "https://www.astonsu.com/events/")).toHaveLength(0);
  });
});

describe("ICS extras", () => {
  it("unfolds lines and skips a vevent with no start", () => {
    const folded = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:fold-1
SUMMARY:A long
  title
DTSTART:20261022T180000Z
DTEND:20261022T190000Z
END:VEVENT
BEGIN:VEVENT
UID:no-start
SUMMARY:Missing
END:VEVENT
END:VCALENDAR`;
    const parsed = parseIcsEvents(folded, "not a url");
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("A long title");
    expect(parsed[0].sourceKey.startsWith("live:ics:")).toBe(true);
  });
});

describe("live adapter", () => {
  it("records a failed feed without dropping a good ICS", async () => {
    const fetchFn: FetchLike = async (input) => {
      if (input.endsWith("/robots.txt")) {
        return { ok: true, status: 200, headers: { get: () => "text/plain" }, text: async () => "User-agent: *\nAllow: /\n" };
      }
      if (input.includes("calendar.ics")) {
        return { ok: true, status: 200, headers: { get: () => "text/calendar" }, text: async () => ICS };
      }
      return { ok: false, status: 500, headers: { get: () => "" }, text: async () => "nope" };
    };
    const harvest = await fetchLiveEvents(
      ["https://birminghamcathedral.com/calendar.ics", "https://www.meetup.com/find/?broken=1"],
      { fetchFn, pauseMs: 0 }
    );
    expect(harvest.events.some((e) => e.title === "Sung Eucharist")).toBe(true);
    expect(harvest.sources).toHaveLength(2);
    expect(harvest.sources.filter((s) => s.ok).length).toBe(1);
    expect(harvest.sources.some((s) => s.ok === false)).toBe(true);
  });

  it("does not fetch a host off the allowlist", async () => {
    const harvest = await fetchLiveEvents(["https://evil.example/events"], { fetchFn: async () => {
      throw new Error("should not fetch");
    }, pauseMs: 0 });
    expect(harvest.events).toHaveLength(0);
    expect(harvest.sources[0]?.error).toMatch(/allowlist/i);
  });
});
