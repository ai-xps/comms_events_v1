import type { ScrapedEvent } from "./types";

export async function fetchLiveEvents(): Promise<ScrapedEvent[]> {
  throw new Error("Live scraper is not enabled in this build.");
}
