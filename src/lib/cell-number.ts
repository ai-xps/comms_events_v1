export function normaliseCellNumber(raw: string): string {
  return raw.replace(/[\s\-()]/g, "").trim();
}

export function isValidCellNumber(value: string): boolean {
  return /^\d{6,15}$/.test(value);
}
