import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { originAllowed } from "@/lib/origin";

function req(headers: Record<string, string>) {
  return new NextRequest("http://localhost:3000/api/users", {
    method: "POST",
    headers
  });
}

describe("originAllowed", () => {
  it("accepts matching Origin", () => {
    expect(originAllowed(req({ origin: "http://localhost:3000" }))).toBe(true);
  });

  it("rejects a foreign Origin", () => {
    expect(originAllowed(req({ origin: "https://evil.example" }))).toBe(false);
  });

  it("falls back to Referer when Origin is missing", () => {
    expect(
      originAllowed(req({ referer: "http://localhost:3000/members/new" }))
    ).toBe(true);
  });

  it("falls back to Sec-Fetch-Site same-origin", () => {
    expect(originAllowed(req({ "sec-fetch-site": "same-origin" }))).toBe(true);
  });

  it("rejects when no Origin, Referer, or same-origin hint", () => {
    expect(originAllowed(req({}))).toBe(false);
  });
});
