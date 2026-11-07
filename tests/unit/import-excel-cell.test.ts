import { describe, expect, it } from "vitest";
import { excelCellText } from "@/lib/import-users";

describe("excelCellText", () => {
  it("reads plain values", () => {
    expect(excelCellText("Ada")).toBe("Ada");
    expect(excelCellText(42)).toBe("42");
    expect(excelCellText(null)).toBe("");
  });

  it("reads rich text without becoming [object Object]", () => {
    expect(
      excelCellText({
        richText: [{ text: "T3" }, { text: " C1" }]
      })
    ).toBe("T3 C1");
  });

  it("reads hyperlink / formula result text", () => {
    expect(excelCellText({ text: "07000000111", hyperlink: "tel:07000000111" })).toBe(
      "07000000111"
    );
    expect(excelCellText({ formula: "A1", result: "Sparkbrook" })).toBe("Sparkbrook");
  });
});
