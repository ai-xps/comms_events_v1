import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSqlitePragmas } from "@/lib/sqlite";

/**
 * Public liveness for uptime checks (R14).
 * How it works: like peeking that the notebook opens, not reading every page.
 */
export async function GET() {
  try {
    await ensureSqlitePragmas(prisma);
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
