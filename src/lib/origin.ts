import { NextRequest } from "next/server";

export function originAllowed(request: NextRequest): boolean {
  const expected = process.env.APP_ORIGIN ?? "http://localhost:3000";
  const origin = request.headers.get("origin");
  if (origin) return origin === expected;

  // Some browsers omit Origin on same-site POSTs; fall back to Referer / Sec-Fetch-Site.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === expected;
    } catch {
      return false;
    }
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

export function rejectOrigin() {
  return Response.json({ error: "This request did not come from Gather." }, { status: 403 });
}
