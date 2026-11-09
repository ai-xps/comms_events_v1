import { describe, expect, it } from "vitest";
import { attendanceChipClass, attendanceLabel } from "@/lib/attendance-label";

describe("attendanceLabel", () => {
  it("maps enums to the same chip wording as the event page", () => {
    expect(attendanceLabel("ATTENDED")).toBe("Attended");
    expect(attendanceLabel("ABSENT")).toBe("Didn’t");
    expect(attendanceLabel("UNCONFIRMED")).toBe("Unconfirmed");
  });
});

describe("attendanceChipClass", () => {
  it("pairs each status with its coloured chip class", () => {
    expect(attendanceChipClass("ATTENDED")).toBe("attendance-chip attendance-attended");
    expect(attendanceChipClass("ABSENT")).toBe("attendance-chip attendance-absent");
    expect(attendanceChipClass("UNCONFIRMED")).toBe("attendance-chip attendance-unconfirmed");
  });
});
