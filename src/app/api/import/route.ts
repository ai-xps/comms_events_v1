import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { importUsers } from "@/lib/import-users";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can import." }, { status: 403 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Choose a file." }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await importUsers({ actor: user, filename: file.name, buffer });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
