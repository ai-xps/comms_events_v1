import { describe, expect, it } from "vitest";
import { isValidCellNumber, normaliseCellNumber } from "@/lib/cell-number";

describe("normaliseCellNumber", () => {
  it("strips spaces, hyphens, and brackets", () => {
    expect(normaliseCellNumber(" A1-b2 (c3) ")).toBe("A1b2c3");
  });
});

describe("isValidCellNumber", () => {
  it("accepts alphanumeric of any length", () => {
    expect(isValidCellNumber("A")).toBe(true);
    expect(isValidCellNumber("a1")).toBe(true);
    expect(isValidCellNumber("07000000001")).toBe(true);
    expect(isValidCellNumber("Cell42")).toBe(true);
  });

  it("rejects empty, spaces, and symbols", () => {
    expect(isValidCellNumber("")).toBe(false);
    expect(isValidCellNumber("a b")).toBe(false);
    expect(isValidCellNumber("a@b")).toBe(false);
    expect(isValidCellNumber("12-34")).toBe(false);
  });
});
