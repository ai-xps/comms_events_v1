/** Shared chip label for attendance enums shown on event + bookings pages. */
export function attendanceLabel(value: string): string {
  if (value === "ATTENDED") return "Attended";
  if (value === "ABSENT") return "Didn’t";
  return "Unconfirmed";
}

export function attendanceChipClass(value: string): string {
  return `attendance-chip attendance-${value.toLowerCase()}`;
}
