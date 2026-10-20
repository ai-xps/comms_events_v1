import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { canViewInsights } from "@/lib/policy";
import { writeAudit } from "@/lib/audit";

const CHANNELS = new Set(["whatsapp", "email", "teams", "telegram", "copy", "device"]);

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || !canViewInsights(user)) {
    return NextResponse.json({ error: "You cannot share insights." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as { channel?: string };
  const channel = CHANNELS.has(body.channel ?? "") ? body.channel! : "unknown";
  await writeAudit({
    actorId: user.id,
    action: "insights.share",
    entityType: "Insights",
    summary: `${user.name} shared insights via ${channel}`
  });
  return NextResponse.json({ ok: true });
}
