import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { importUsers } from "@/lib/import-users";
import { LIMITS } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can import." }, { status: 403 });
  }
  try {
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > LIMITS.importBytes + 64 * 1024) {
      return NextResponse.json(
        { ok: false, error: "That file is too large. The limit is 2 MB." },
        { status: 413 }
      );
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Choose a file." }, { status: 400 });
    }
    if (file.size > LIMITS.importBytes) {
      return NextResponse.json(
        { ok: false, error: "That file is too large. The limit is 2 MB." },
        { status: 413 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importUsers({ actor: user, filename: file.name, buffer });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("import route failed", error);
    return NextResponse.json(
      {
        ok: false,
        created: 0,
        errors: [{ row: 0, reason: "Import failed unexpectedly. Try CSV, or download the template and try again." }]
      },
      { status: 500 }
    );
  }
}
