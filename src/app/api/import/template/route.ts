import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { IMPORT_TEMPLATE_CSV } from "@/lib/import-users";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can download the import template." }, { status: 403 });
  }
  return new NextResponse(IMPORT_TEMPLATE_CSV, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="gather-members-template.csv"'
    }
  });
}
