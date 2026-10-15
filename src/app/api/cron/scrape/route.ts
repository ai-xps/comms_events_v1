import { NextRequest, NextResponse } from "next/server";
import { runScraper } from "@/lib/scraper/run";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = request.nextUrl.searchParams.get("secret") ?? "";
  if (!secret || (bearer !== secret && query !== secret)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }
  try {
    const result = await runScraper({ trigger: "SCHEDULED" });
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Scraper failed." }, { status });
  }
}
