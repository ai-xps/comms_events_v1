import { NextRequest, NextResponse } from "next/server";
import { runScraper } from "@/lib/scraper/run";
import { secretsMatch } from "@/lib/secrets";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET ?? "";
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secret || !secretsMatch(bearer, secret)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }
  try {
    const result = await runScraper({ trigger: "SCHEDULED" });
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    console.error("Scheduled scrape failed", error);
    return NextResponse.json({ error: status === 409 ? "A scrape is already running." : "Scraper failed." }, { status });
  }
}
