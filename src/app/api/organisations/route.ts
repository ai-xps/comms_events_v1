import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can change organisations." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const status = String(body.status ?? "");
  if (!["WHITELIST", "BLACKLIST", "STANDARD"].includes(status)) {
    return NextResponse.json({ error: "Choose whitelist, standard, or blacklist." }, { status: 400 });
  }
  const org = await prisma.organisation.update({
    where: { id: String(body.id) },
    data: { status }
  });
  await writeAudit({
    actorId: user.id,
    action: "organisation.rule",
    entityType: "Organisation",
    entityId: org.id,
    summary: `${user.name} set ${org.name} to ${status}`
  });
  return NextResponse.json({ ok: true });
}
