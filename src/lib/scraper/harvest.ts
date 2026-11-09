import type { Category } from "../constants";
import type { ScrapedEvent } from "./types";

export const FETCH_BODY_MAX = 1024 * 1024;
export const URL_EVENT_CAP = 300;
/** Wide Birmingham discovery can return hundreds of unique rows per run. */
export const RUN_EVENT_CAP = 2500;

export type HarvestSelection = {
  events: ScrapedEvent[];
  /** Live/fixture rows dropped because their inferred type toggle is off. */
  droppedDisabledCategory: number;
};

/**
 * Live events keep the first sourceKey (specific slices before broad “all events”).
 * Fixtures overwrite the same key (demo wins). Unclassified rows are kept even when
 * their holding type is switched off. Cap is after the merge.
 */
export function selectHarvestEvents(
  live: ScrapedEvent[],
  fixtures: ScrapedEvent[],
  enabled: Set<Category>
): HarvestSelection {
  const byKey = new Map<string, ScrapedEvent>();
  let droppedDisabledCategory = 0;

  const take = (event: ScrapedEvent, overwrite: boolean) => {
    if (!event.needsTypeReview && !enabled.has(event.category)) {
      droppedDisabledCategory += 1;
      return;
    }
    if (!overwrite && byKey.has(event.sourceKey)) return;
    byKey.set(event.sourceKey, event);
  };

  for (const event of live) take(event, false);
  for (const event of fixtures) take(event, true);

  return {
    events: [...byKey.values()].slice(0, RUN_EVENT_CAP),
    droppedDisabledCategory
  };
}
