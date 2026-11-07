import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canReview } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { BIRMINGHAM_VIEWBOX, GEOCODE_USER_AGENT, parseNominatimHits } from "@/lib/geocode";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || !canReview(user)) {
    return NextResponse.json({ error: "You cannot look up an address." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as { q?: string };
  const q = String(body.q ?? "").trim().slice(0, 180);
  if (q.length < 3) {
    return NextResponse.json({ error: "Type a bit more of the place name." }, { status: 400 });
  }
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "gb");
  url.searchParams.set("viewbox", BIRMINGHAM_VIEWBOX);
  url.searchParams.set("bounded", "1");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": GEOCODE_USER_AGENT, Accept: "application/json" },
      signal: ctrl.signal
    });
    if (!response.ok) {
      return NextResponse.json({ hits: [], error: "Look-up is not available just now." }, { status: 200 });
    }
    const hits = parseNominatimHits(await response.json());
    return NextResponse.json({ hits });
  } catch {
    return NextResponse.json({ hits: [], error: "Look-up timed out." }, { status: 200 });
  } finally {
    clearTimeout(timer);
  }
}
