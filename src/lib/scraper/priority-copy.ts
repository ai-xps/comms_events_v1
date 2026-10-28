/** One sentence for the scraper form. Does not include the technical allowlist reason. */
export function droppedPriorityUrlMessage(rejected: { url: string }[]): string | null {
  if (!rejected.length) return null;
  const list = rejected.map((row) => row.url).join(", ");
  return rejected.length === 1
    ? `This address is not on the allowlist, so it was not saved: ${list}`
    : `These addresses are not on the allowlist, so they were not saved: ${list}`;
}

type RunSource = { url: string; ok: boolean; eventCount: number; error?: string };

/** What Run now should say, including why the pending queue can look unchanged. */
export function runFinishedMessage(input: {
  createdCount?: number;
  updatedCount?: number;
  publishedCount?: number;
  discardedByRule?: number;
  leftPending?: number;
  skippedHumanEdited?: number;
  sources?: RunSource[];
  dropped?: { url: string }[];
}): string {
  const created = input.createdCount ?? 0;
  const updated = input.updatedCount ?? 0;
  const parts: string[] = [];
  const dropped = droppedPriorityUrlMessage(input.dropped ?? []);
  if (dropped) parts.push(dropped);
  parts.push(
    `Run finished: created ${created}, updated ${updated}, published ${input.publishedCount ?? 0}, discarded ${input.discardedByRule ?? 0}, pending ${input.leftPending ?? 0}, skipped human-edited ${input.skippedHumanEdited ?? 0}.`
  );
  const sources = input.sources ?? [];
  if (sources.length === 0) {
    parts.push(
      created === 0
        ? "No live feed was fetched. Demo events already stored are updated in place, so the pending list looks the same."
        : "No Priority URL was fetched. New rows came from the demo harvest."
    );
  } else {
    const problems = sources.filter((source) => !source.ok || source.eventCount === 0).slice(0, 3);
    if (problems.length) {
      parts.push(
        problems.map((source) => `${source.url}: ${source.error ?? "No events found."}`).join(" ")
      );
    }
  }
  return parts.join(" ");
}
