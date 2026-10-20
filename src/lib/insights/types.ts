import type { Category } from "@/lib/constants";
import type { InsightsScope } from "@/lib/policy";

export type PeriodPreset = "30" | "90" | "year" | "custom";
export type InsightsFormat = "" | "online" | "inperson";

export type InsightsFilters = {
  from: Date;
  to: Date;
  preset: PeriodPreset;
  category: Category | "";
  format: InsightsFormat;
  cellId: string | null;
};

export type RawEvent = {
  id: string;
  title: string;
  category: string;
  online: boolean;
  startsAt: Date;
  endsAt: Date;
  capacity: number | null;
  status: string;
  createdAt: Date;
  sourceKey: string | null;
};

export type RawBooking = {
  eventId: string;
  userId: string;
  bookedById: string;
  bookedAt: Date;
  attendance: string;
  userCellId: string | null;
  cellName: string;
};

export type RawStar = { eventId: string };
export type RawRun = {
  startedAt: Date;
  trigger: string;
  createdCount: number;
  publishedCount: number;
  discardedByRule: number;
  leftPending: number;
  status: string;
  sourceResults?: string;
};
export type RawMember = { id: string; active: boolean; cellId: string | null };

export type RawInsights = {
  events: RawEvent[];
  bookings: RawBooking[];
  stars: RawStar[];
  runs: RawRun[];
  members: RawMember[];
};

export type Kpis = {
  eventsPublished: number;
  attendClicks: number;
  activeMembers: number;
  attendanceRate: number | null;
  confirmationRate: number | null;
  noShowRate: number | null;
  fillRate: number | null;
  delegateShare: number | null;
  stars: number;
};

export type WeekPoint = {
  weekStart: string;
  attendClicks: number;
  attended: number;
  absent: number;
  unconfirmed: number;
};

export type NamedCount = { key: string; label: string; count: number; suppressed?: boolean };

export type HeatCell = { weekday: number; hourBucket: number; count: number };

export type Funnel = { scraped: number; pending: number; published: number; discarded: number };

export type TopEvent = {
  id: string;
  title: string;
  startsAt: string;
  bookings: number;
  capacity: number | null;
  fillPct: number | null;
  attendancePct: number | null;
};

export type ScraperRow = {
  startedAt: string;
  trigger: string;
  createdCount: number;
  status: string;
  failedFeeds: number;
};

export type InsightsData = {
  generatedAt: string;
  schemaVersion: 1;
  scope: InsightsScope;
  filters: {
    from: string;
    to: string;
    preset: PeriodPreset;
    category: string;
    format: string;
    cellId: string | null;
  };
  kpis: Kpis;
  weeks: WeekPoint[];
  previousWeeks: WeekPoint[];
  byCategory: NamedCount[];
  byFormat: NamedCount[];
  byCell: NamedCount[];
  heatmap: HeatCell[];
  funnel: Funnel;
  scraperRuns: ScraperRow[];
  topEvents: TopEvent[];
};

export const DATASETS = ["summary", "weekly", "byType", "byCell", "perEvent", "attendees", "everything"] as const;
export type Dataset = (typeof DATASETS)[number];

export const EXPORT_FORMATS = ["csv", "txt", "json", "xlsx"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
