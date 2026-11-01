import { describe, expect, it } from "vitest";
import {
  DISCARD_EVENT_CONFIRM_BODY,
  discardTouchesOrganisation,
  displayEventLink,
  pendingWhen
} from "@/lib/pending-copy";

describe("Discard ≠ blacklist", () => {
  it("confirm copy says Discard does not blacklist the organisation", () => {
    expect(DISCARD_EVENT_CONFIRM_BODY).toMatch(/does not blacklist the organisation/i);
    expect(DISCARD_EVENT_CONFIRM_BODY).toMatch(/future scrapes/i);
    expect(DISCARD_EVENT_CONFIRM_BODY.toLowerCase()).not.toMatch(/will blacklist/);
  });

  it("marks Discard as an event-only action (never org status)", () => {
    expect(discardTouchesOrganisation()).toBe(false);
  });
});

describe("pending tile display", () => {
  it("strips scheme and leading www from Event Links", () => {
    expect(displayEventLink("https://www.birminghamcathedral.com/event/evening-prayer-16/2026-10-28/")).toBe(
      "birminghamcathedral.com/event/evening-prayer-16/2026-10-28/"
    );
    expect(displayEventLink("http://meetup.com/find/?location=gb--Birmingham")).toBe(
      "meetup.com/find/?location=gb--Birmingham"
    );
  });

  it("keeps a long cathedral slug readable after stripping (ellipsis is CSS)", () => {
    const long =
      "https://www.birminghamcathedral.com/event/holy-communion-in-traditional-language-with-extra-path-segments/2026-10-28/";
    const shown = displayEventLink(long);
    expect(shown.startsWith("birminghamcathedral.com/")).toBe(true);
    expect(shown).not.toMatch(/^https?:\/\//i);
    expect(shown.length).toBeLessThan(long.length);
  });

  it("shows start–end as date-time then clock when endsAt is set", () => {
    const startsAt = new Date("2026-10-28T13:10:00+00:00");
    const endsAt = new Date("2026-10-28T13:40:00+00:00");
    const label = pendingWhen(startsAt, endsAt);
    expect(label).toMatch(/13:10/);
    expect(label).toMatch(/–13:40/);
    expect(label).toMatch(/Oct/);
  });

  it("omits the end clock when endsAt is missing", () => {
    const startsAt = new Date("2026-10-28T16:00:00+00:00");
    expect(pendingWhen(startsAt, null)).not.toMatch(/–/);
    expect(pendingWhen(startsAt, undefined)).not.toMatch(/–/);
  });
});
