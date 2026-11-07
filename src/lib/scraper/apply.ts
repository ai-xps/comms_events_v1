export type ScrapeAction = "create" | "update" | "skip-discarded" | "skip-human-edited";

export function scrapeDecision(
  existingStatus: string | null | undefined,
  orgStatus: string,
  opts: { humanEditedAt?: Date | null; needsTypeReview?: boolean } = {}
): { action: ScrapeAction; status?: "PENDING" | "PUBLISHED" | "DISCARDED" } {
  if (existingStatus === "DISCARDED") return { action: "skip-discarded" };
  if (opts.humanEditedAt) return { action: "skip-human-edited" };
  if (existingStatus) return { action: "update" };
  // Unclassified live events stay in pending even when the organisation is whitelisted.
  if (opts.needsTypeReview) return { action: "create", status: "PENDING" };
  if (orgStatus === "WHITELIST") return { action: "create", status: "PUBLISHED" };
  if (orgStatus === "BLACKLIST") return { action: "create", status: "DISCARDED" };
  return { action: "create", status: "PENDING" };
}

export function isUpdatedScrapedRow(createdAt: Date, updatedAt: Date): boolean {
  return updatedAt.getTime() - createdAt.getTime() > 5000;
}
