import type { Category } from "../constants";

export type ScrapedEvent = {
  sourceKey: string;
  title: string;
  organisationName: string;
  category: Category;
  startsAt: Date;
  endsAt: Date;
  online: boolean;
  placeName?: string | null;
  lat?: number | null;
  lng?: number | null;
  externalUrl?: string | null;
  notes?: string | null;
  /** Priority URL this event was parsed from (live feeds only). */
  fetchedFrom?: string | null;
  needsTypeReview: boolean;
};
