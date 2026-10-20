import type { Category } from "../constants";
import type { ScrapedEvent } from "./types";

export const FETCH_BODY_MAX = 512 * 1024;
export const URL_EVENT_CAP = 200;
export const RUN_EVENT_CAP = 500;

/**
 * Live events first, then fixtures (same sourceKey: fixture wins). Unclassified rows
 * are kept even when their holding type is switched off. Cap is after the merge.
 */
export function selectHarvestEvents(
  live: ScrapedEvent[],
  fixtures: ScrapedEvent[],
  enabled: Set<Category>
): ScrapedEvent[] {
  const byKey = new Map<string, ScrapedEvent>();
  for (const event of [...live, ...fixtures]) {
    if (!event.needsTypeReview && !enabled.has(event.category)) continue;
    byKey.set(event.sourceKey, event);
  }
  return [...byKey.values()].slice(0, RUN_EVENT_CAP);
}
