import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { runScraper } from "@/lib/scraper/run";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can run the scraper." }, { status: 403 });
  }
  try {
    const result = await runScraper({ trigger: "MANUAL", actorId: user.id });
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    if (status !== 409) console.error("Manual scrape failed", error);
    return NextResponse.json({ error: status === 409 ? "A scrape is already running." : "Scraper failed." }, { status });
  }
}
