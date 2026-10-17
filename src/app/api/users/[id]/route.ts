import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { normaliseCellNumber, isValidCellNumber } from "@/lib/cell-number";
import { parseRole } from "@/lib/constants";
import { writeAudit } from "@/lib/audit";
import { LIMITS } from "@/lib/security";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) return rejectOrigin();
  const actor = await getCurrentUser();
  if (!actor || actor.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can edit accounts." }, { status: 403 });
  }
  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Person not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const cellNumber = normaliseCellNumber(String(body.cellNumber ?? existing.cellNumber));
  const role = parseRole(String(body.role ?? existing.role));
  if (!isValidCellNumber(cellNumber) || !role) {
    return NextResponse.json({ error: "Cell number or permission is not valid." }, { status: 400 });
  }
  const clash = await prisma.user.findFirst({ where: { cellNumber, NOT: { id } } });
  if (clash) return NextResponse.json({ error: "That cell number already exists." }, { status: 400 });
  const password = String(body.password ?? "");
  const active = parseActive(body.active, existing.active);
  if (id === actor.id && !active) {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }
  const data: {
    name: string;
    cellNumber: string;
    role: string;
    cellId: string | null;
    active: boolean;
    passwordHash?: string;
    sessionVersion?: { increment: number };
  } = {
    name: String(body.name ?? existing.name).trim(),
    cellNumber,
    role,
    cellId: body.cellId ? String(body.cellId) : null,
    active
  };
  if (password) {
    if (password.length < 8 || password.length > LIMITS.passwordMax) {
      return NextResponse.json(
        { error: `Password must be 8 to ${LIMITS.passwordMax} characters.` },
        { status: 400 }
      );
    }
    data.passwordHash = await hashPassword(password);
  }
  const deactivated = existing.active && !active;
  // A new password or deactivation signs the person out everywhere.
  if (password || deactivated) data.sessionVersion = { increment: 1 };
  await prisma.user.update({ where: { id }, data });

  const audits: { action: string; summary: string }[] = [];
  if (role !== existing.role) {
    audits.push({ action: "user.permission", summary: `${actor.name} changed ${existing.name} from ${existing.role} to ${role}` });
  }
  if (password) {
    audits.push({ action: "user.password_reset", summary: `${actor.name} reset the password for ${existing.name}` });
  }
  if (active !== existing.active) {
    audits.push({
      action: active ? "user.activate" : "user.deactivate",
      summary: `${actor.name} ${active ? "reactivated" : "deactivated"} ${existing.name}`
    });
  }
  for (const entry of audits) {
    await writeAudit({ actorId: actor.id, entityType: "User", entityId: id, ...entry });
  }
  return NextResponse.json({ ok: true });
}

/** A missing value keeps the current state; the form always sends "on" or "off". */
function parseActive(value: unknown, current: boolean): boolean {
  if (value === undefined || value === null) return current;
  return value === true || value === "on" || value === "true";
}
