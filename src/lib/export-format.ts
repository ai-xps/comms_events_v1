/**
 * Shared writers for every file the app produces. All spreadsheet-bound text passes through
 * safeCell so a member name such as "=HYPERLINK(...)" is shown as text, not run as a formula.
 */
export type Cell = string | number | null | undefined;
export type Table = { name: string; columns: string[]; rows: Cell[][] };

const FORMULA_START = /^[=+\-@\t\r]/;

export function safeCell(value: Cell): string | number {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  return FORMULA_START.test(value) ? `'${value}` : value;
}

function csvField(value: Cell): string {
  return `"${String(safeCell(value)).replaceAll('"', '""')}"`;
}

export function toCsv(table: Table): string {
  return [table.columns, ...table.rows].map((row) => row.map(csvField).join(",")).join("\r\n");
}

export function toTxt(title: string, lines: string[], tables: Table[]): string {
  const out = [title, "=".repeat(title.length), "", ...lines];
  for (const table of tables) {
    out.push("", table.name, "-".repeat(table.name.length));
    const widths = table.columns.map((c, i) =>
      Math.max(c.length, ...table.rows.map((r) => String(r[i] ?? "").length))
    );
    const fmt = (row: Cell[]) => row.map((v, i) => String(v ?? "").padEnd(widths[i])).join("  ").trimEnd();
    out.push(fmt(table.columns), widths.map((w) => "-".repeat(w)).join("  "));
    if (table.rows.length === 0) out.push("(no rows)");
    else out.push(...table.rows.map(fmt));
  }
  return out.join("\n") + "\n";
}

export function toJson(meta: Record<string, unknown>, tables: Table[]): string {
  const data = Object.fromEntries(
    tables.map((t) => [
      t.name,
      t.rows.map((row) => Object.fromEntries(t.columns.map((c, i) => [c, row[i] ?? null])))
    ])
  );
  return JSON.stringify({ ...meta, data }, null, 2);
}

export async function toXlsx(tables: Table[]): Promise<Buffer> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  for (const table of tables) {
    const sheet = workbook.addWorksheet(table.name.slice(0, 31));
    sheet.addRow(table.columns);
    sheet.getRow(1).font = { bold: true };
    for (const row of table.rows) sheet.addRow(row.map(safeCell));
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
