import { describe, expect, it } from "vitest";
import { parseNominatimHits } from "@/lib/geocode";
import { IMPORT_TEMPLATE_CSV } from "@/lib/import-users";
import { eventsTable } from "@/lib/export-events";

describe("parseNominatimHits", () => {
  it("maps a stub JSON array to lat/lng", () => {
    const hits = parseNominatimHits([
      { lat: "52.4795", lon: "-1.903", display_name: "Carrs Lane, Birmingham" },
      { lat: "nope", lon: "-1.9" }
    ]);
    expect(hits).toEqual([{ lat: 52.4795, lng: -1.903, label: "Carrs Lane, Birmingham" }]);
  });

  it("returns empty for a broken payload", () => {
    expect(parseNominatimHits(null)).toEqual([]);
    expect(parseNominatimHits({})).toEqual([]);
  });
});

describe("import template", () => {
  it("has the five columns testers were shown", () => {
    const header = IMPORT_TEMPLATE_CSV.split("\r\n")[0];
    expect(header).toBe("Name,Cell number,Cell,Password,Permission");
  });
});

describe("events export table", () => {
  it("prefixes formula-looking cells via the table shape", () => {
    const table = eventsTable([
      {
        title: "=HYPERLINK()",
        organisationName: "Org",
        category: "Christian",
        startsAt: new Date("2026-10-20T10:00:00Z"),
        endsAt: new Date("2026-10-20T11:00:00Z"),
        online: false,
        placeName: "Hall",
        externalUrl: "https://example.com",
        bookings: 2
      }
    ]);
    expect(table.columns).toContain("event link");
    expect(table.rows[0][0]).toBe("=HYPERLINK()");
  });
});
