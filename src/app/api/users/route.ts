import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { passwordInUse } from "@/lib/password-unique";
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
  const password = String(body.password ?? "").trim();
  if (!isValidCellNumber(cellNumber)) {
    return NextResponse.json(
      { error: "Cell number must be letters and digits only (no spaces)." },
      { status: 400 }
    );
  }
  if (!role) return NextResponse.json({ error: "Permission is not valid." }, { status: 400 });
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }
  if (role !== "admin" && !body.cellId) {
    return NextResponse.json({ error: "Leaders and members need a cell." }, { status: 400 });
  }
  if (await passwordInUse(password, cellNumber)) {
    return NextResponse.json(
      {
        error:
          "That password is already used by someone with this cell number. Each person on the same cell number needs a unique password."
      },
      { status: 400 }
    );
  }
  const user = await prisma.user.create({
    data: {
      name: String(body.name ?? "").trim(),
      cellNumber,
      passwordHash: await hashPassword(password),
      role,
      cellId: body.cellId ? String(body.cellId) : null
    }
  });
  try {
    await writeAudit({
      actorId: actor.id,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
      summary: `${actor.name} created ${user.name} as ${role}`
    });
  } catch (error) {
    console.error("user.create audit failed", error);
  }
  return NextResponse.json({ ok: true, id: user.id });
}
