import { describe, expect, it } from "vitest";
import { eventInputProblem, isHexColour, isHttpUrl, safeNextPath } from "@/lib/security";

describe("safeNextPath — regression: login next= could send a member off-site", () => {
  it.each([
    [null, "/calendar"],
    ["", "/calendar"],
    ["/pending", "/pending"],
    ["/events/abc", "/events/abc"],
    ["https://lookalike.example", "/calendar"],
    ["//evil.example", "/calendar"],
    ["/\\evil", "/calendar"],
    ["\\login", "/calendar"],
    ["/login", "/calendar"],
    ["/login?next=/calendar", "/calendar"]
  ])("maps %j to %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe("isHttpUrl", () => {
  it("accepts http and https only", () => {
    expect(isHttpUrl("https://example.com/event")).toBe(true);
    expect(isHttpUrl("http://localhost:3000")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:text/html,hi")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
  });
});

describe("isHexColour", () => {
  it("accepts #rrggbb only", () => {
    expect(isHexColour("#2f5d50")).toBe(true);
    expect(isHexColour("#FFF")).toBe(false);
    expect(isHexColour("red")).toBe(false);
    expect(isHexColour("expression(alert(1))")).toBe(false);
  });
});

describe("eventInputProblem", () => {
  const ok = {
    title: "Choir",
    notes: "",
    externalUrl: "https://example.com",
    capacity: 20,
    startsAt: new Date("2026-10-20T18:00:00Z"),
    endsAt: new Date("2026-10-20T20:00:00Z")
  };

  it("accepts a valid event", () => {
    expect(eventInputProblem(ok)).toBeNull();
  });

  it("rejects a javascript Event Link", () => {
    expect(eventInputProblem({ ...ok, externalUrl: "javascript:alert(1)" })).toMatch(/http/);
  });

  it("rejects the event ending before it starts", () => {
    expect(eventInputProblem({ ...ok, endsAt: ok.startsAt })).toMatch(/end after/);
  });

  it("rejects a negative capacity", () => {
    expect(eventInputProblem({ ...ok, capacity: -1 })).toMatch(/Capacity/);
  });
});
