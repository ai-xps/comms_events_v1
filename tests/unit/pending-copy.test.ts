import { describe, expect, it } from "vitest";
import { DISCARD_EVENT_CONFIRM_BODY, discardTouchesOrganisation } from "@/lib/pending-copy";

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
