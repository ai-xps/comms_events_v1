import { describe, expect, it } from "vitest";
import { pendingStillOpen } from "@/lib/pending-time";

describe("pendingStillOpen", () => {
  const now = new Date("2026-11-07T12:00:00.000Z");

  it("hides an event that already ended", () => {
    expect(
      pendingStillOpen(
        new Date("2026-11-07T09:00:00.000Z"),
        new Date("2026-11-07T10:00:00.000Z"),
        now
      )
    ).toBe(false);
  });

  it("keeps an event that ends later today", () => {
    expect(
      pendingStillOpen(
        new Date("2026-11-07T11:00:00.000Z"),
        new Date("2026-11-07T14:00:00.000Z"),
        now
      )
    ).toBe(true);
  });

  it("with no end time, keeps start within the last three hours", () => {
    expect(pendingStillOpen(new Date("2026-11-07T10:00:00.000Z"), null, now)).toBe(true);
    expect(pendingStillOpen(new Date("2026-11-07T08:00:00.000Z"), null, now)).toBe(false);
  });
});
