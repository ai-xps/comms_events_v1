import { describe, expect, it } from "vitest";
import {
  DISCARD_EVENT_CONFIRM_BODY,
  discardTouchesOrganisation,
  eventLinkLabel,
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
  it("names known Event Link hosts in a short On … label", () => {
    expect(eventLinkLabel("https://www.birminghamcathedral.com/event/evening-prayer-16/2026-10-28/")).toBe(
      "On Birmingham Cathedral"
    );
    expect(eventLinkLabel("https://www.meetup.com/birmingham-tech/events/123/")).toBe("On Meetup");
  });

  it("falls back to the hostname for unknown sites, without the long path", () => {
    expect(eventLinkLabel("https://www.example.org/very/long/event/path/slug-here")).toBe("On example.org");
    expect(eventLinkLabel("not-a-url")).toBe("On source page");
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
