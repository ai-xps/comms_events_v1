import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normaliseCellNumber } from "@/lib/cell-number";
import { verifyPassword } from "@/lib/password";
import { writeSession } from "@/lib/session";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { GENERIC_LOGIN_ERROR, type Role } from "@/lib/constants";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const body = await request.json().catch(() => null);
  const cellNumber = normaliseCellNumber(String(body?.cellNumber ?? ""));
  const password = String(body?.password ?? "");

  const throttle = await prisma.loginThrottle.findUnique({ where: { cellNumber } });
  if (throttle?.lockedUntil && throttle.lockedUntil > new Date()) {
    return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  const candidates = cellNumber
    ? await prisma.user.findMany({ where: { cellNumber, active: true } })
    : [];
  let matched: (typeof candidates)[number] | null = null;
  for (const candidate of candidates) {
    if (await verifyPassword(password, candidate.passwordHash)) {
      matched = candidate;
      break;
    }
  }

  if (!matched) {
    const windowStart = throttle?.windowStart ?? new Date();
    const inWindow = Date.now() - windowStart.getTime() < 15 * 60 * 1000;
    const failures = inWindow ? (throttle?.failures ?? 0) + 1 : 1;
    const lockedUntil = failures >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    await prisma.loginThrottle.upsert({
      where: { cellNumber: cellNumber || "unknown" },
      update: {
        failures,
        windowStart: inWindow ? windowStart : new Date(),
        lockedUntil
      },
      create: { cellNumber: cellNumber || "unknown", failures: 1, windowStart: new Date() }
    });
    return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  await prisma.loginThrottle.deleteMany({ where: { cellNumber } });
  await writeSession({
    id: matched.id,
    name: matched.name,
    cellNumber: matched.cellNumber,
    role: matched.role as Role,
    cellId: matched.cellId,
    sv: matched.sessionVersion
  });
  return NextResponse.json({ ok: true });
}
