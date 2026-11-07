import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { attendEvent, cancelBooking, BookingError } from "@/lib/booking";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await request.json().catch(() => null);
  try {
    const booking = await attendEvent({
      eventId: String(body?.eventId ?? ""),
      userId: String(body?.userId ?? user.id),
      actor: user
    });
    return NextResponse.json({ ok: true, bookingId: booking.id, existing: false });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await request.json().catch(() => null);
  try {
    await cancelBooking({
      eventId: String(body?.eventId ?? ""),
      userId: String(body?.userId ?? user.id),
      actor: user
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
