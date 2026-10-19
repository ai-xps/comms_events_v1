export function normaliseCellNumber(raw: string): string {
  return raw.replace(/[\s\-()]/g, "").trim();
}

/** Login ID: letters and digits only, any length, non-empty. Unique per user. */
export function isValidCellNumber(value: string): boolean {
  return /^[A-Za-z0-9]+$/.test(value);
}
