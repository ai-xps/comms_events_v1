import { describe, expect, it } from "vitest";
import { scrapeDecision, isUpdatedScrapedRow } from "@/lib/scraper/apply";
import {
  MEETUP_BIRMINGHAM_FIND_URL,
  parsePriorityUrls,
  scrapeUrlAllowed,
  STARTER_PRIORITY_URL
} from "@/lib/scraper/allowlist";
import { droppedPriorityUrlMessage, runFinishedMessage } from "@/lib/scraper/priority-copy";
import { inferCategory, TYPE_REVIEW_NOTE } from "@/lib/scraper/categorise";
import { fixtureEvents } from "@/lib/scraper/fixtures";
import { buildCoverageReport, formatCoverageReport } from "@/lib/scraper/coverage-report";
import { RUN_EVENT_CAP, selectHarvestEvents } from "@/lib/scraper/harvest";
import { parseIcsDate, parseIcsEvents } from "@/lib/scraper/ics";
import { eventsFromJsonLd, extractJsonLdScripts } from "@/lib/scraper/jsonld";
import { scrapeLockAcquired, scrapeLockUntil } from "@/lib/scraper/lock";
import { fetchLiveEvents, type FetchLike } from "@/lib/scraper/live-adapter";
import { discoverCalendarLinks, eventsFromMicrodata } from "@/lib/scraper/microdata";
import { stripHtml } from "@/lib/scraper/text";
import { londonDate, londonParts } from "@/lib/time";
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
  it("accepts the cathedral what's-on page we use as the starter feed", () => {
    const parsed = parsePriorityUrls([STARTER_PRIORITY_URL]);
    expect(parsed.urls).toEqual([STARTER_PRIORITY_URL]);
    expect(parsed.rejected).toHaveLength(0);
  });

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

  it("accepts Meetup https and still refuses a 61st feed or unknown host", () => {
    const meetup = parsePriorityUrls([MEETUP_BIRMINGHAM_FIND_URL, "https://www.meetup.com/"]);
    expect(meetup.urls).toEqual([MEETUP_BIRMINGHAM_FIND_URL, "https://www.meetup.com/"]);
    expect(meetup.rejected).toHaveLength(0);
    expect(scrapeUrlAllowed("https://meetup.com/").ok).toBe(true);
    expect(scrapeUrlAllowed(MEETUP_BIRMINGHAM_FIND_URL).ok).toBe(true);
    const rejected = parsePriorityUrls(["https://evil.example/cal.ics", "not-a-url"]);
    expect(rejected.urls).toHaveLength(0);
    expect(rejected.rejected.length).toBeGreaterThanOrEqual(2);
    const many = parsePriorityUrls(
      Array.from({ length: 61 }, (_, i) => `https://birminghamcathedral.com/cal-${i}.ics`)
    );
    expect(many.urls).toHaveLength(60);
    expect(many.rejected).toHaveLength(1);
    const dup = parsePriorityUrls([
      "https://birminghamcathedral.com/calendar.ics",
      "https://birminghamcathedral.com/calendar.ics"
    ]);
    expect(dup.urls).toHaveLength(1);
    expect(dup.rejected).toHaveLength(0);
  });

  it("keeps an allowlisted feed when a leftover unknown host sits next to it", () => {
    const mixed = parsePriorityUrls([
      "https://evil.example/find/?keywords=birmingham",
      "https://birminghamcathedral.com/calendar.ics"
    ]);
    expect(mixed.urls).toEqual(["https://birminghamcathedral.com/calendar.ics"]);
    expect(mixed.rejected).toHaveLength(1);
    expect(droppedPriorityUrlMessage(mixed.rejected)).toMatch(/evil\.example/i);
    expect(droppedPriorityUrlMessage(mixed.rejected)).toMatch(/not saved/i);
    expect(droppedPriorityUrlMessage([])).toBeNull();
  });

  it("explains a demo-only run that leaves pending looking the same", () => {
    const text = runFinishedMessage({ createdCount: 0, updatedCount: 12, sources: [], dropped: [] });
    expect(text).toMatch(/created 0/);
    expect(text).toMatch(/pending list looks the same/i);
    const dropped = runFinishedMessage({
      createdCount: 0,
      sources: [],
      dropped: [{ url: "https://evil.example/find/?keywords=birmingham" }]
    });
    expect(dropped).toMatch(/not saved/i);
    expect(dropped).toMatch(/No live feed was fetched/);
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

  it("uses Eventbrite / Meetup Priority URL slices for the five types", () => {
    expect(
      inferCategory({
        host: "www.eventbrite.co.uk",
        title: "Generic listing",
        organisationName: "Org",
        pageUrl: "https://www.eventbrite.co.uk/d/united-kingdom--birmingham/professional--events/"
      }).category
    ).toBe("Professional");
    expect(
      inferCategory({
        host: "www.meetup.com",
        title: "Generic listing",
        organisationName: "Org",
        pageUrl: "https://www.meetup.com/find/?keywords=christian&location=gb--Birmingham"
      }).category
    ).toBe("Christian");
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

  it("reads a Meetup-shaped JSON array of Events with start and end", () => {
    // Live Meetup find pages put Events in a top-level ld+json array (not @graph).
    const html = `<script type="application/ld+json">${JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: "Canal Walk - Birmingham to Hamstead",
        startDate: "2026-11-07T12:00:00.000Z",
        endDate: "2026-11-07T15:00:00.000Z",
        url: "https://www.meetup.com/birminghampeople/events/316895414/",
        organizer: { name: "Birmingham People" }
      },
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: "Evening drinks - meet people in Tech!",
        startDate: "2026-11-10T19:00:00.000Z",
        url: "https://www.meetup.com/birmingham-tech-network/events/315465806/"
      }
    ])}</script>`;
    const events = extractJsonLdScripts(html).flatMap((block) =>
      eventsFromJsonLd(block, MEETUP_BIRMINGHAM_FIND_URL)
    );
    expect(events).toHaveLength(2);
    expect(events[0].title).toMatch(/Canal Walk/i);
    expect(events[0].endsAt.getTime() - events[0].startsAt.getTime()).toBe(3 * 60 * 60 * 1000);
    expect(events[0].externalUrl).toContain("meetup.com/birminghampeople");
    expect(events[1].endsAt.getTime()).toBeGreaterThan(events[1].startsAt.getTime());
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

  it("harvests Meetup JSON-LD HTML and tags the category from the host", async () => {
    const meetupHtml = `<html><script type="application/ld+json">${JSON.stringify({
      "@type": "Event",
      name: "DevOps Society - The Human API Workshop",
      startDate: "2026-11-12T18:00:00.000Z",
      endDate: "2026-11-12T20:00:00.000Z",
      url: "https://www.meetup.com/devops-society/events/316811039/",
      organizer: { name: "DevOps Society" }
    })}</script></html>`;
    const fetchFn: FetchLike = async (input) => {
      if (input.endsWith("/robots.txt")) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => "text/plain" },
          text: async () => "User-agent: *\nAllow: /\n"
        };
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => "text/html; charset=utf-8" },
        text: async () => meetupHtml
      };
    };
    const harvest = await fetchLiveEvents([MEETUP_BIRMINGHAM_FIND_URL], { fetchFn, pauseMs: 0 });
    expect(harvest.sources).toEqual([
      expect.objectContaining({ url: MEETUP_BIRMINGHAM_FIND_URL, ok: true, eventCount: 1 })
    ]);
    expect(harvest.events).toHaveLength(1);
    expect(harvest.events[0].category).toBe("Meetup");
    expect(harvest.events[0].title).toMatch(/DevOps Society/i);
    expect(harvest.events[0].externalUrl).toContain("meetup.com/devops-society");
    expect(harvest.events[0].needsTypeReview).toBe(false);
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
          text: async () => "X".repeat(1024 * 1024 + 1)
        };
      },
      pauseMs: 0
    });
    expect(harvest.events).toHaveLength(0);
    expect(harvest.sources[0]?.error).toBe("Response too large.");
  });

  it("keeps 300 events from a 350-event ICS", async () => {
    const vevents = Array.from({ length: 350 }, (_, i) => {
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
    expect(harvest.events).toHaveLength(300);
    expect(harvest.sources[0]?.eventCount).toBe(300);
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
    expect(kept.events.map((e) => e.sourceKey)).toEqual(["live:calendar.google.com:anon"]);
    expect(kept.droppedDisabledCategory).toBe(1);
  });

  it("slices combined live and fixture events to the run cap", () => {
    const enabled = new Set<Category>(["Meetup"]);
    const live = Array.from({ length: RUN_EVENT_CAP + 10 }, (_, i) =>
      sampleEvent({ sourceKey: `live:n:${i}`, category: "Meetup" })
    );
    expect(selectHarvestEvents(live, [], enabled).events).toHaveLength(RUN_EVENT_CAP);
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

describe("destruction / robust capture", () => {
  it("strips HTML descriptions and keeps readable notes", () => {
    expect(stripHtml("<p>Hello<br/>world</p><script>x()</script>")).toMatch(/Hello/);
    expect(stripHtml("<p>Hello<br/>world</p><script>x()</script>")).not.toMatch(/script/i);
  });

  it("keeps GEO, organiser CN, categories, and skips cancelled ICS rows", () => {
    const raw = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:geo-1
SUMMARY:Lunch club
DESCRIPTION:<p>Soup &amp; bread</p>
DTSTART:20261110T120000Z
DTEND:20261110T130000Z
LOCATION:Carrs Lane
GEO:52.479;-1.895
ORGANIZER;CN=Carrs Lane Church:MAILTO:hello@carrslane.co.uk
CATEGORIES:Community,Food
END:VEVENT
BEGIN:VEVENT
UID:cancel-1
SUMMARY:Cancelled talk
STATUS:CANCELLED
DTSTART:20261111T120000Z
END:VEVENT
END:VCALENDAR`;
    const events = parseIcsEvents(raw, "https://carrslane.co.uk/calendar.ics");
    expect(events).toHaveLength(1);
    expect(events[0].lat).toBeCloseTo(52.479);
    expect(events[0].lng).toBeCloseTo(-1.895);
    expect(events[0].organisationName).toBe("Carrs Lane Church");
    expect(events[0].notes).toMatch(/Soup/);
    expect(events[0].notes).toMatch(/Categories:/);
    expect(events[0].fetchedFrom).toContain("carrslane.co.uk");
  });

  it("walks ItemList → ListItem → item Event nodes (Eventbrite-style)", () => {
    const payload = {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Event",
            name: "Mind Body Spirit Festival",
            startDate: "2026-11-20T10:00:00Z",
            endDate: "2026-11-20T18:00:00Z",
            url: "https://www.eventbrite.co.uk/e/example"
          }
        }
      ]
    };
    const events = eventsFromJsonLd(payload, "https://www.eventbrite.co.uk/d/united-kingdom--birmingham/all-events/");
    expect(events).toHaveLength(1);
    expect(events[0]?.title).toBe("Mind Body Spirit Festival");
  });

  it("reads PostalAddress, offers, VirtualLocation, and trailing-comma JSON-LD", () => {
    const html = `<script type="application/ld+json">{
  "@type": "Event",
  "name": "Founders breakfast",
  "startDate": "2026-11-12T08:00:00Z",
  "endDate": "2026-11-12T09:30:00Z",
  "description": "<p>Coffee &amp; chat</p>",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "location": {
    "@type": "VirtualLocation",
    "name": "Zoom",
    "url": "https://zoom.example/x"
  },
  "organizer": { "name": "Impact Hub Birmingham" },
  "offers": { "price": "0", "priceCurrency": "GBP", "availability": "https://schema.org/InStock" },
}</script>
<script type="application/ld+json">{"@type":"Event","name":"Street food","startDate":"2026-11-13T17:00:00Z","location":{"@type":"Place","name":"Digbeth","address":{"@type":"PostalAddress","streetAddress":"Floodgate St","addressLocality":"Birmingham","postalCode":"B5 5SA"},"geo":{"@type":"GeoCoordinates","latitude":52.475,"longitude":-1.886}}}</script>`;
    const events = extractJsonLdScripts(html).flatMap((block) =>
      eventsFromJsonLd(block, "https://birmingham.impacthub.net/events")
    );
    expect(events).toHaveLength(2);
    expect(events[0].online).toBe(true);
    expect(events[0].notes).toMatch(/Coffee/);
    expect(events[0].notes).toMatch(/Price: 0 GBP/);
    expect(events[1].placeName).toMatch(/Digbeth/);
    expect(events[1].placeName).toMatch(/B5 5SA/);
    expect(events[1].lat).toBeCloseTo(52.475);
    expect(events[1].lng).toBeCloseTo(-1.886);
  });

  it("walks itemListElement nests and survives one broken script beside a good one", () => {
    const html = `<script type="application/ld+json">NOPE</script>
<script type="application/ld+json">${JSON.stringify({
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "Event",
          name: "Nested panel",
          startDate: "2026-11-14T18:00:00Z",
          organizer: { name: "Aston SU" }
        }
      ]
    })}</script>`;
    const events = extractJsonLdScripts(html).flatMap((b) => eventsFromJsonLd(b, "https://www.astonsu.com/events/"));
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Nested panel");
  });

  it("survives a mixed live harvest where robots block, timeout, empty, and good feeds all appear", async () => {
    const fetchFn: FetchLike = async (input) => {
      if (input.endsWith("/robots.txt")) {
        if (input.includes("meetup.com")) {
          return {
            ok: true,
            status: 200,
            headers: { get: () => "text/plain" },
            text: async () => "User-agent: *\nDisallow: /find\n"
          };
        }
        return {
          ok: true,
          status: 200,
          headers: { get: () => "text/plain" },
          text: async () => "User-agent: *\nAllow: /\n"
        };
      }
      if (input.includes("calendar.ics")) {
        return { ok: true, status: 200, headers: { get: () => "text/calendar" }, text: async () => ICS };
      }
      if (input.includes("empty")) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => "text/html" },
          text: async () => "<html><body>no events</body></html>"
        };
      }
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    };
    const harvest = await fetchLiveEvents(
      [
        "https://birminghamcathedral.com/calendar.ics",
        "https://www.meetup.com/find/?location=gb--Birmingham",
        "https://birminghamcathedral.com/empty",
        "https://www.birmingham.ac.uk/events"
      ],
      { fetchFn, pauseMs: 0 }
    );
    expect(harvest.events.some((e) => e.title === "Sung Eucharist")).toBe(true);
    expect(harvest.events.every((e) => e.notes?.includes("Source feed:"))).toBe(true);
    expect(harvest.sources).toHaveLength(4);
    expect(harvest.sources.filter((s) => s.ok && s.eventCount > 0)).toHaveLength(1);
    expect(harvest.sources.some((s) => s.error?.match(/robots/i))).toBe(true);
    expect(harvest.sources.some((s) => s.error?.match(/Timed out/i))).toBe(true);
    expect(harvest.sources.some((s) => s.error?.match(/No calendar events/i))).toBe(true);
  });

  it("parses Event microdata and discovers same-host ICS links", () => {
    const html = `
      <div itemscope itemtype="https://schema.org/Event">
        <span itemprop="name">Evening prayer</span>
        <meta itemprop="startDate" content="2026-11-15T18:00:00Z" />
        <meta itemprop="endDate" content="2026-11-15T18:45:00Z" />
        <span itemprop="location">Cathedral</span>
      </div>
      <a href="/feeds/whats-on.ics" type="text/calendar">ICS</a>
      <a href="https://evil.example/x.ics">skip</a>
    `;
    const events = eventsFromMicrodata(html, "https://birminghamcathedral.com/whats-on/");
    expect(events).toHaveLength(1);
    expect(events[0]?.title).toBe("Evening prayer");
    const links = discoverCalendarLinks(html, "https://birminghamcathedral.com/whats-on/");
    expect(links).toEqual(["https://birminghamcathedral.com/feeds/whats-on.ics"]);
  });

  it("follows linked ICS when HTML has no JSON-LD events", async () => {
    const fetchFn: FetchLike = async (input) => {
      if (input.endsWith("/robots.txt")) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => "text/plain" },
          text: async () => "User-agent: *\nAllow: /\n"
        };
      }
      if (input.includes("whats-on.ics")) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => "text/calendar" },
          text: async () => `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:linked-1
SUMMARY:Linked ICS service
DTSTART:20261120T110000Z
DTEND:20261120T120000Z
END:VEVENT
END:VCALENDAR`
        };
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => "text/html" },
        text: async () =>
          `<html><body><a href="/feeds/whats-on.ics" type="text/calendar">cal</a></body></html>`
      };
    };
    const harvest = await fetchLiveEvents(["https://birminghamcathedral.com/whats-on/"], {
      fetchFn,
      pauseMs: 0
    });
    expect(harvest.events.some((e) => e.title === "Linked ICS service")).toBe(true);
    expect(harvest.sources[0]?.eventCount).toBeGreaterThan(0);
  });

  it("builds a day × source coverage report for last week and next week", () => {
    const now = londonDate(2026, 11, 8, 12, 0);
    const events: ScrapedEvent[] = [
      sampleEvent({
        sourceKey: "live:birminghamcathedral.com:a",
        category: "Christian",
        title: "Past service",
        startsAt: londonDate(2026, 11, 5, 11, 0),
        endsAt: londonDate(2026, 11, 5, 12, 0),
        fetchedFrom: "https://birminghamcathedral.com/calendar.ics"
      }),
      sampleEvent({
        sourceKey: "live:meetup.com:b",
        category: "Meetup",
        title: "Tomorrow walk",
        startsAt: londonDate(2026, 11, 9, 12, 0),
        endsAt: londonDate(2026, 11, 9, 15, 0),
        fetchedFrom: MEETUP_BIRMINGHAM_FIND_URL
      }),
      sampleEvent({
        sourceKey: "fixture-x",
        category: "Meetup",
        title: "Demo tonight",
        startsAt: londonDate(2026, 11, 8, 19, 0),
        endsAt: londonDate(2026, 11, 8, 21, 0)
      })
    ];
    const report = buildCoverageReport(events, now);
    expect(report.lastWeek.total).toBe(1);
    expect(report.nextWeek.total).toBe(2);
    expect(report.nextWeek.days[0]?.total).toBe(1); // today
    expect(report.nextWeek.days[1]?.bySource[0]?.source).toBe("meetup.com");
    // 2026-11-08 is a Sunday → this week Mon 2 Nov – Sun 8 Nov
    expect(report.thisWeek.from).toBe("2026-11-02");
    expect(report.thisWeek.to).toBe("2026-11-08");
    expect(report.thisWeek.total).toBe(2); // past service + demo tonight
    expect(report.thisWeek.byCategory.Christian).toBe(1);
    expect(report.thisMonth.days).toHaveLength(30); // November
    expect(report.thisMonth.days[7]?.total).toBe(1); // day 8
    const text = formatCoverageReport(report);
    expect(text).toMatch(/THIS WEEK/);
    expect(text).toMatch(/THIS MONTH/);
    expect(text).toMatch(/LAST 7 DAYS/);
    expect(text).toMatch(/NEXT 7 DAYS/);
    expect(text).toMatch(/birminghamcathedral\.com/);
    expect(text).toMatch(/meetup\.com/);
    expect(text).toMatch(/demo fixtures/);
  });
});
