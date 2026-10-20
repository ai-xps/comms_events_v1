import { NextRequest, NextResponse } from "next/server";
import { clearSession, readSession } from "@/lib/session";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const session = await readSession();
  if (session) {
    // Signing out ends this person's sessions on every device, not just this browser.
    await prisma.user
      .updateMany({ where: { id: session.id, sessionVersion: session.sv }, data: { sessionVersion: { increment: 1 } } })
      .catch((error) => console.error("Could not revoke session on logout", error));
  }
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
