export type ScrapeAction = "create" | "update" | "skip-discarded";

export function scrapeDecision(
  existingStatus: string | null | undefined,
  orgStatus: string
): { action: ScrapeAction; status?: "PENDING" | "PUBLISHED" | "DISCARDED" } {
  if (existingStatus === "DISCARDED") return { action: "skip-discarded" };
  if (existingStatus) return { action: "update" };
  if (orgStatus === "WHITELIST") return { action: "create", status: "PUBLISHED" };
  if (orgStatus === "BLACKLIST") return { action: "create", status: "DISCARDED" };
  return { action: "create", status: "PENDING" };
}

export function isUpdatedScrapedRow(createdAt: Date, updatedAt: Date): boolean {
  return updatedAt.getTime() - createdAt.getTime() > 5000;
}
