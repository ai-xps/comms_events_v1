import ExcelJS from "exceljs";
import Papa from "papaparse";
import { prisma } from "./db";
import { hashPassword } from "./password";
import { normaliseCellNumber, isValidCellNumber } from "./cell-number";
import { parseRole, type Role } from "./constants";
import { writeAudit } from "./audit";
import { LIMITS } from "./security";
import type { SessionUser } from "./session";

export const IMPORT_TEMPLATE_CSV =
  "Name,Cell number,Cell,Password,Permission\r\nExample Person,07000000999,Sparkbrook,ChangeMe1!,member\r\n";

type Row = {
  name: string;
  cellNumber: string;
  cell: string;
  password: string;
  permission: string;
  region?: string;
  department?: string;
  team?: string;
};

type CellMeta = { name: string; region?: string; department?: string; team?: string };

function flattenNestedJson(input: unknown): { rows: Record<string, unknown>[]; cells: CellMeta[] } {
  if (Array.isArray(input)) return { rows: input as Record<string, unknown>[], cells: [] };
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.users) || Array.isArray(obj.rows)) {
      const rows = (obj.users ?? obj.rows) as Record<string, unknown>[];
      const cells = Array.isArray(obj.cells) ? (obj.cells as CellMeta[]) : [];
      if (obj.regions && typeof obj.regions === "object") {
        walkTree(obj.regions, [], cells);
      }
      return { rows, cells };
    }
    const cells: CellMeta[] = [];
    walkTree(obj, [], cells);
    return { rows: [], cells };
  }
  return { rows: [], cells: [] };
}

function walkTree(node: unknown, path: string[], cells: CellMeta[]) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkTree(item, path, cells);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (typeof obj.name === "string" && path.length >= 3) {
    cells.push({
      region: path[0],
      department: path[1],
      team: path[2],
      name: obj.name
    });
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    if (key === "users" || key === "rows" || key === "cells") continue;
    walkTree(value, [...path, key], cells);
  }
}

function pick(row: Record<string, unknown>, keys: string[]): string {
  const map = new Map(Object.keys(row).map((k) => [k.toLowerCase().replace(/[^a-z]/g, ""), k]));
  for (const key of keys) {
    const found = map.get(key.toLowerCase().replace(/[^a-z]/g, ""));
    if (found && row[found] != null) return String(row[found]).trim();
  }
  return "";
}

function toRow(raw: Record<string, unknown>): Row {
  return {
    name: pick(raw, ["name"]),
    cellNumber: pick(raw, ["cellnumber", "cell number"]),
    cell: pick(raw, ["cell"]),
    password: pick(raw, ["password"]),
    permission: pick(raw, ["permission", "duty", "role"]),
    region: pick(raw, ["region"]) || undefined,
    department: pick(raw, ["department"]) || undefined,
    team: pick(raw, ["team"]) || undefined
  };
}

export async function parseImportFile(filename: string, buffer: Buffer): Promise<{
  rows: Row[];
  cells: CellMeta[];
}> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv")) {
    const parsed = Papa.parse<Record<string, string>>(buffer.toString("utf8"), {
      header: true,
      skipEmptyLines: true
    });
    return { rows: parsed.data.map((r) => toRow(r)), cells: [] };
  }
  if (lower.endsWith(".json")) {
    const json = JSON.parse(buffer.toString("utf8"));
    const { rows, cells } = flattenNestedJson(json);
    return { rows: rows.map((r) => toRow(r)), cells };
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { rows: [], cells: [] };
  const header: string[] = [];
  sheet.getRow(1).eachCell((cell, col) => {
    header[col] = String(cell.value ?? "");
  });
  const rows: Row[] = [];
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const raw: Record<string, unknown> = {};
    row.eachCell((cell, col) => {
      raw[header[col] ?? `col${col}`] = cell.value;
    });
    rows.push(toRow(raw));
  });
  return { rows, cells: [] };
}

export async function importUsers(opts: {
  actor: SessionUser;
  filename: string;
  buffer: Buffer;
}) {
  const { rows, cells } = await parseImportFile(opts.filename, opts.buffer);
  const errors: { row: number; reason: string }[] = [];
  if (rows.length > LIMITS.importRows) {
    return {
      ok: false as const,
      created: 0,
      errors: [{ row: 0, reason: `The file has ${rows.length} rows. The limit is ${LIMITS.importRows} per import.` }]
    };
  }
  const seen = new Set<string>();
  const prepared: Array<Row & { role: Role; cellNumber: string }> = [];

  rows.forEach((row, i) => {
    const rowNumber = i + 2;
    const cellNumber = normaliseCellNumber(row.cellNumber);
    if (!row.name) errors.push({ row: rowNumber, reason: "Name is missing." });
    if (!isValidCellNumber(cellNumber)) {
      errors.push({ row: rowNumber, reason: "Cell number must be 6–15 digits." });
    }
    if (!row.cell) errors.push({ row: rowNumber, reason: "Cell is missing." });
    if (!row.password || row.password.length < 8 || row.password.length > LIMITS.passwordMax) {
      errors.push({ row: rowNumber, reason: `Password must be 8 to ${LIMITS.passwordMax} characters.` });
    }
    const role = parseRole(row.permission);
    if (!role) errors.push({ row: rowNumber, reason: "Permission must be admin, cell leader, or member." });
    if (cellNumber && seen.has(cellNumber)) {
      errors.push({ row: rowNumber, reason: "Cell number is repeated in this file." });
    }
    if (cellNumber) seen.add(cellNumber);
    if (role) prepared.push({ ...row, role, cellNumber });
  });

  if (prepared.length) {
    const existing = await prisma.user.findMany({
      where: { cellNumber: { in: prepared.map((r) => r.cellNumber) } },
      select: { cellNumber: true }
    });
    const existingSet = new Set(existing.map((u) => u.cellNumber));
    prepared.forEach((row, i) => {
      if (existingSet.has(row.cellNumber)) {
        errors.push({ row: i + 2, reason: "Cell number already exists." });
      }
    });
  }

  if (errors.length) {
    return { ok: false as const, created: 0, errors };
  }

  const created = await prisma.$transaction(async (tx) => {
    const cellByName = new Map<string, string>();
    const existingCells = await tx.cell.findMany();
    existingCells.forEach((c) => cellByName.set(c.name.toLowerCase(), c.id));
    for (const meta of cells) {
      const key = meta.name.toLowerCase();
      if (!cellByName.has(key)) {
        const cell = await tx.cell.create({
          data: {
            name: meta.name,
            region: meta.region ?? null,
            department: meta.department ?? null,
            team: meta.team ?? null
          }
        });
        cellByName.set(key, cell.id);
      }
    }
    let count = 0;
    for (const row of prepared) {
      const key = row.cell.toLowerCase();
      let cellId = cellByName.get(key);
      if (!cellId) {
        const cell = await tx.cell.create({
          data: {
            name: row.cell,
            region: row.region ?? null,
            department: row.department ?? null,
            team: row.team ?? null
          }
        });
        cellId = cell.id;
        cellByName.set(key, cellId);
      }
      const hash = await hashPassword(row.password);
      const needsCell = row.role !== "admin";
      await tx.user.create({
        data: {
          name: row.name,
          cellNumber: row.cellNumber,
          passwordHash: hash,
          role: row.role,
          cellId: needsCell ? cellId : row.cell ? cellId : null,
          active: true
        }
      });
      count += 1;
    }
    return count;
  });

  await writeAudit({
    actorId: opts.actor.id,
    action: "users.import",
    entityType: "User",
    summary: `${opts.actor.name} imported ${created} users from ${opts.filename}`
  });
  return { ok: true as const, created, errors: [] };
}
