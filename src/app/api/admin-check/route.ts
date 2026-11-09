import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
