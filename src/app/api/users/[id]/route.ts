import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { normaliseCellNumber, isValidCellNumber } from "@/lib/cell-number";
import { parseRole } from "@/lib/constants";
import { writeAudit } from "@/lib/audit";

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
  const data: {
    name: string;
    cellNumber: string;
    role: string;
    cellId: string | null;
    active: boolean;
    passwordHash?: string;
  } = {
    name: String(body.name ?? existing.name).trim(),
    cellNumber,
    role,
    cellId: body.cellId ? String(body.cellId) : null,
    active: body.active === "on" || body.active === true || body.active === undefined
  };
  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    data.passwordHash = await hashPassword(password);
  }
  await prisma.user.update({ where: { id }, data });
  if (role !== existing.role) {
    await writeAudit({
      actorId: actor.id,
      action: "user.permission",
      entityType: "User",
      entityId: id,
      summary: `${actor.name} changed ${existing.name} from ${existing.role} to ${role}`
    });
  }
  return NextResponse.json({ ok: true });
}
