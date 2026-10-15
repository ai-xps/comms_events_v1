import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";
import { originAllowed, rejectOrigin } from "@/lib/origin";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url));
}
