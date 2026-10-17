import { prisma } from "./db";
import { writeAudit } from "./audit";
import { CATEGORIES, DEFAULT_COLOURS, parseMemberAttendeeView, type Category } from "./constants";
import { parsePriorityUrls } from "./scraper/allowlist";

function readPriorityUrlList(raw: string | null | undefined): unknown[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getSettings() {
  const row = await prisma.settings.findUnique({ where: { id: "default" } });
  const colours = row ? (JSON.parse(row.categoryColours) as Record<string, string>) : DEFAULT_COLOURS;
  const enabled: Record<Category, boolean> = {
    Christian: row?.christianEnabled ?? true,
    Networking: row?.networkingEnabled ?? true,
    Professional: row?.professionalEnabled ?? true,
    Student: row?.studentEnabled ?? true,
    Meetup: row?.meetupEnabled ?? true
  };
  const partitioned = parsePriorityUrls(readPriorityUrlList(row?.priorityUrls));
  return {
    locationLabel: row?.locationLabel ?? "Birmingham",
    memberAttendeeView: parseMemberAttendeeView(row?.memberAttendeeView),
    colours: { ...DEFAULT_COLOURS, ...colours },
    enabled,
    priorityUrls: partitioned.urls
  };
}

/**
 * Drops stored Priority URLs that no longer pass the allowlist (e.g. a leftover Meetup search page)
 * so Save and Run now are not blocked by stale config. Writes an audit row when anything is removed.
 */
export async function persistCleanPriorityUrls(actorId?: string | null) {
  const row = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!row) return { urls: [] as string[], dropped: [] as { url: string; reason: string }[] };
  const partitioned = parsePriorityUrls(readPriorityUrlList(row.priorityUrls));
  if (!partitioned.rejected.length) {
    return { urls: partitioned.urls, dropped: partitioned.rejected };
  }
  await prisma.settings.update({
    where: { id: "default" },
    data: { priorityUrls: JSON.stringify(partitioned.urls) }
  });
  await writeAudit({
    actorId: actorId ?? null,
    action: "settings.priorityUrls.dropped",
    entityType: "Settings",
    entityId: "default",
    summary: `Removed ${partitioned.rejected.length} Priority URL(s) no longer on the allowlist: ${partitioned.rejected
      .map((item) => item.url)
      .join(", ")}`
  });
  return { urls: partitioned.urls, dropped: partitioned.rejected };
}

export function enabledCategories(enabled: Record<Category, boolean>): Category[] {
  return CATEGORIES.filter((c) => enabled[c]);
}
