import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { normaliseCellNumber, isValidCellNumber } from "@/lib/cell-number";
import { parseRole } from "@/lib/constants";
import { writeAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const actor = await getCurrentUser();
  if (!actor || actor.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can create accounts." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const cellNumber = normaliseCellNumber(String(body.cellNumber ?? ""));
  const role = parseRole(String(body.role ?? ""));
  const password = String(body.password ?? "");
  if (!isValidCellNumber(cellNumber)) {
    return NextResponse.json({ error: "Cell number must be 6–15 digits." }, { status: 400 });
  }
  if (!role) return NextResponse.json({ error: "Permission is not valid." }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (role !== "admin" && !body.cellId) {
    return NextResponse.json({ error: "Leaders and members need a cell." }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { cellNumber } });
  if (exists) return NextResponse.json({ error: "That cell number already exists." }, { status: 400 });
  const user = await prisma.user.create({
    data: {
      name: String(body.name ?? "").trim(),
      cellNumber,
      passwordHash: await hashPassword(password),
      role,
      cellId: body.cellId ? String(body.cellId) : null
    }
  });
  await writeAudit({
    actorId: actor.id,
    action: "user.create",
    entityType: "User",
    entityId: user.id,
    summary: `${actor.name} created ${user.name} as ${role}`
  });
  return NextResponse.json({ ok: true, id: user.id });
}
