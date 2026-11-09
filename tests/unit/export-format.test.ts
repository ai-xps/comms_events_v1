import { describe, expect, it } from "vitest";
import { safeCell, toCsv, toJson, toTxt, toXlsx, type Table } from "@/lib/export-format";

const table: Table = {
  name: "Attendees",
  columns: ["name", "cell"],
  rows: [
    ["=HYPERLINK(\"http://evil\")", "+123"],
    ["Hannah Cole", "07000000004"]
  ]
};

describe("safeCell", () => {
  it("prefixes spreadsheet formula starters", () => {
    expect(safeCell("=1+1")).toBe("'=1+1");
    expect(safeCell("+cmd")).toBe("'+cmd");
    expect(safeCell("-1")).toBe("'-1");
    expect(safeCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(safeCell("\tcmd")).toBe("'\tcmd");
    expect(safeCell("Hannah")).toBe("Hannah");
    expect(safeCell(12)).toBe(12);
    expect(safeCell(null)).toBe("");
  });
});

describe("writers", () => {
  it("quotes CSV fields and prefixes formulas", () => {
    const csv = toCsv(table);
    expect(csv).toContain('"\'=HYPERLINK(""http://evil"")"');
    expect(csv).toContain('"Hannah Cole"');
  });

  it("writes a readable text report", () => {
    const txt = toTxt("Gather insights", ["Attend clicks: 2"], [table]);
    expect(txt).toContain("Gather insights");
    expect(txt).toContain("Attend clicks: 2");
    expect(txt).toContain("Hannah Cole");
  });

  it("includes schema metadata in JSON", () => {
    const json = JSON.parse(toJson({ generatedAt: "2026-10-17T12:00:00Z", schemaVersion: 1 }, [table]));
    expect(json.schemaVersion).toBe(1);
    expect(json.data.Attendees).toHaveLength(2);
    expect(json.data.Attendees[1].name).toBe("Hannah Cole");
  });

  it("writes an xlsx buffer", async () => {
    const buf = await toXlsx([table]);
    expect(buf.length).toBeGreaterThan(100);
  });
});
