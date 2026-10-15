import { NextRequest } from "next/server";

export function originAllowed(request: NextRequest): boolean {
  const expected = process.env.APP_ORIGIN ?? "http://localhost:3000";
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === expected;
}

export function rejectOrigin() {
  return Response.json({ error: "This request did not come from Gather." }, { status: 403 });
}
