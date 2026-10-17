import { describe, expect, it } from "vitest";
import { scrapeDecision, isUpdatedScrapedRow } from "@/lib/scraper/apply";
import { parsePriorityUrls, scrapeUrlAllowed } from "@/lib/scraper/allowlist";
import { droppedPriorityUrlMessage } from "@/lib/scraper/priority-copy";
import { inferCategory, TYPE_REVIEW_NOTE } from "@/lib/scraper/categorise";
import { fixtureEvents } from "@/lib/scraper/fixtures";
import { RUN_EVENT_CAP, selectHarvestEvents } from "@/lib/scraper/harvest";
import { parseIcsDate, parseIcsEvents } from "@/lib/scraper/ics";
import { eventsFromJsonLd, extractJsonLdScripts } from "@/lib/scraper/jsonld";
import { scrapeLockAcquired, scrapeLockUntil } from "@/lib/scraper/lock";
import { fetchLiveEvents, type FetchLike } from "@/lib/scraper/live-adapter";
import { londonParts } from "@/lib/time";
import type { ScrapedEvent } from "@/lib/scraper/types";
import type { Category } from "@/lib/constants";

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
    expect(scrapeDecision("DISCARDED", "STANDARD", { humanEditedAt: new Date() })).toEqual({
      action: "skip-discarded"
    });
  });

  it("updates published and pending in place", () => {
    expect(scrapeDecision("PUBLISHED", "STANDARD")).toEqual({ action: "update" });
    expect(scrapeDecision("PENDING", "WHITELIST")).toEqual({ action: "update" });
  });

  it("skips a human-edited published event and still updates pending without a freeze", () => {
    expect(scrapeDecision("PUBLISHED", "STANDARD", { humanEditedAt: new Date("2026-10-17T12:00:00Z") })).toEqual({
      action: "skip-human-edited"
    });
    expect(scrapeDecision("PENDING", "STANDARD")).toEqual({ action: "update" });
  });

  it("does not auto-publish unclassified events even on a whitelist org", () => {
    expect(scrapeDecision(null, "WHITELIST", { needsTypeReview: true })).toEqual({
      action: "create",
      status: "PENDING"
    });
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
  it("accepts cathedral https and a calendar file on an allowlisted host", () => {
    expect(scrapeUrlAllowed("https://birminghamcathedral.com/worship/").ok).toBe(true);
    expect(scrapeUrlAllowed("https://birminghamcathedral.com/calendar.ics").ok).toBe(true);
  });

  it("rejects a .ics path on an unknown host", () => {
    const result = scrapeUrlAllowed("https://evil.example/cal.ics");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/allowlist/i);
  });

  it("rejects loopback in production and private IPs always", () => {
    expect(scrapeUrlAllowed("https://127.0.0.1/foo.ics", "production").ok).toBe(false);
    expect(scrapeUrlAllowed("http://127.0.0.1/foo.ics", "development").ok).toBe(true);
    expect(scrapeUrlAllowed("http://dev.localhost/cal.ics", "development").ok).toBe(true);
    expect(scrapeUrlAllowed("https://10.0.0.8/cal.ics", "development").ok).toBe(false);
    expect(scrapeUrlAllowed("https://192.168.1.8/cal.ics").ok).toBe(false);
    expect(scrapeUrlAllowed("https://172.16.0.8/cal.ics").ok).toBe(false);
    expect(scrapeUrlAllowed("https://169.254.169.254/latest/meta-data", "development").ok).toBe(false);
    expect(scrapeUrlAllowed("https://[fd12::1]/cal.ics").ok).toBe(false);
    expect(scrapeUrlAllowed("https://[fe80::1]/cal.ics").ok).toBe(false);
    expect(scrapeUrlAllowed("https://[fc00::1]/cal.ics").ok).toBe(false);
    expect(scrapeUrlAllowed("https://8.8.8.8/cal.ics").ok).toBe(false);
    expect(scrapeUrlAllowed("https://0.1.2.3/cal.ics").ok).toBe(false);
  });

  it("rejects http off localhost and unknown html hosts", () => {
    expect(scrapeUrlAllowed("http://evil.example/x").ok).toBe(false);
    expect(scrapeUrlAllowed("https://evil.example/events").ok).toBe(false);
    expect(scrapeUrlAllowed("javascript:alert(1)").ok).toBe(false);
  });

  it("refuses to save a Meetup search URL or a 21st feed", () => {
    const meetup = parsePriorityUrls(["https://www.meetup.com/find/?keywords=birmingham"]);
    expect(meetup.urls).toHaveLength(0);
    expect(meetup.rejected[0]?.reason).toMatch(/allowlist/i);
    const rejected = parsePriorityUrls(["https://evil.example/cal.ics", "not-a-url"]);
    expect(rejected.urls).toHaveLength(0);
    expect(rejected.rejected.length).toBeGreaterThanOrEqual(2);
    const many = parsePriorityUrls(
      Array.from({ length: 21 }, (_, i) => `https://birminghamcathedral.com/cal-${i}.ics`)
    );
    expect(many.urls).toHaveLength(20);
    expect(many.rejected).toHaveLength(1);
    const dup = parsePriorityUrls([
      "https://birminghamcathedral.com/calendar.ics",
      "https://birminghamcathedral.com/calendar.ics"
    ]);
    expect(dup.urls).toHaveLength(1);
    expect(dup.rejected).toHaveLength(0);
  });

  it("keeps an allowlisted feed when a leftover Meetup line sits next to it", () => {
    const mixed = parsePriorityUrls([
      "https://www.meetup.com/find/?keywords=birmingham",
      "https://birminghamcathedral.com/calendar.ics"
    ]);
    expect(mixed.urls).toEqual(["https://birminghamcathedral.com/calendar.ics"]);
    expect(mixed.rejected).toHaveLength(1);
    expect(droppedPriorityUrlMessage(mixed.rejected)).toMatch(/meetup\.com/i);
    expect(droppedPriorityUrlMessage([])).toBeNull();
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
    const [fallback] = eventsFromJsonLd(
      { "@type": "Event", name: "Loose", startDate: "2026-10-21T16:00:00Z" },
      "not a url"
    );
    expect(fallback.sourceKey.startsWith("live:jsonld:")).toBe(true);
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

  it("defaults an end time when DTEND is missing", () => {
    const raw = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:no-end
SUMMARY:Open
DTSTART:20261022T180000Z
END:VEVENT
END:VCALENDAR`;
    const [event] = parseIcsEvents(raw, "https://birminghamcathedral.com/calendar.ics");
    expect(event.endsAt.getTime() - event.startsAt.getTime()).toBe(60 * 60 * 1000);
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

  it("records Response too large and keeps zero events", async () => {
    const harvest = await fetchLiveEvents(["https://birminghamcathedral.com/calendar.ics"], {
      fetchFn: async (input) => {
        if (input.endsWith("/robots.txt")) {
          return { ok: true, status: 200, headers: { get: () => "text/plain" }, text: async () => "User-agent: *\nAllow: /\n" };
        }
        return {
          ok: true,
          status: 200,
          headers: { get: () => "text/calendar" },
          text: async () => "X".repeat(512 * 1024 + 1)
        };
      },
      pauseMs: 0
    });
    expect(harvest.events).toHaveLength(0);
    expect(harvest.sources[0]?.error).toBe("Response too large.");
  });

  it("keeps 200 events from a 250-event ICS", async () => {
    const vevents = Array.from({ length: 250 }, (_, i) => {
      const n = String(i).padStart(3, "0");
      return `BEGIN:VEVENT
UID:bulk-${n}
SUMMARY:Event ${n}
DTSTART:20261022T180000Z
DTEND:20261022T190000Z
END:VEVENT`;
    }).join("\n");
    const ics = `BEGIN:VCALENDAR\n${vevents}\nEND:VCALENDAR`;
    const harvest = await fetchLiveEvents(["https://birminghamcathedral.com/calendar.ics"], {
      fetchFn: async (input) => {
        if (input.endsWith("/robots.txt")) {
          return { ok: true, status: 200, headers: { get: () => "text/plain" }, text: async () => "User-agent: *\nAllow: /\n" };
        }
        return { ok: true, status: 200, headers: { get: () => "text/calendar" }, text: async () => ics };
      },
      pauseMs: 0
    });
    expect(harvest.events).toHaveLength(200);
    expect(harvest.sources[0]?.eventCount).toBe(200);
  });
});

function sampleEvent(overrides: Partial<ScrapedEvent> & Pick<ScrapedEvent, "sourceKey" | "category">): ScrapedEvent {
  return {
    title: "Sample",
    organisationName: "Org",
    startsAt: new Date("2026-10-20T10:00:00Z"),
    endsAt: new Date("2026-10-20T11:00:00Z"),
    online: false,
    needsTypeReview: false,
    ...overrides
  };
}

describe("harvest select", () => {
  it("keeps unclassified events when Meetup is disabled and caps the run", () => {
    const enabled = new Set<Category>(["Christian"]);
    const unclassified = sampleEvent({
      sourceKey: "live:calendar.google.com:anon",
      category: "Meetup",
      needsTypeReview: true
    });
    const droppedMeetup = sampleEvent({ sourceKey: "live:meetup.com:known", category: "Meetup" });
    const kept = selectHarvestEvents([unclassified, droppedMeetup], [], enabled);
    expect(kept.map((e) => e.sourceKey)).toEqual(["live:calendar.google.com:anon"]);
  });

  it("slices combined live and fixture events to the run cap", () => {
    const enabled = new Set<Category>(["Meetup"]);
    const live = Array.from({ length: RUN_EVENT_CAP + 10 }, (_, i) =>
      sampleEvent({ sourceKey: `live:n:${i}`, category: "Meetup" })
    );
    expect(selectHarvestEvents(live, [], enabled)).toHaveLength(RUN_EVENT_CAP);
  });
});

describe("fixture gate", () => {
  it("yields no fixture- keys when SCRAPE_FIXTURES=0", () => {
    const previous = process.env.SCRAPE_FIXTURES;
    process.env.SCRAPE_FIXTURES = "0";
    try {
      expect(fixtureEvents()).toEqual([]);
    } finally {
      if (previous === undefined) delete process.env.SCRAPE_FIXTURES;
      else process.env.SCRAPE_FIXTURES = previous;
    }
  });
});

describe("scrape lock helper", () => {
  it("treats an empty RETURNING set as not acquired", () => {
    expect(scrapeLockAcquired([])).toBe(false);
    expect(scrapeLockAcquired([{ id: "scrape" }])).toBe(true);
    expect(scrapeLockUntil(0).getTime()).toBe(5 * 60 * 1000);
  });
});
