import { prisma } from "./db";
import { CATEGORIES, DEFAULT_COLOURS, type Category } from "./constants";

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
  return {
    locationLabel: row?.locationLabel ?? "Birmingham",
    memberAttendeeView: (row?.memberAttendeeView ?? "COUNT") as "COUNT" | "COUNT_AND_INITIALS",
    colours: { ...DEFAULT_COLOURS, ...colours },
    enabled,
    priorityUrls: row ? (JSON.parse(row.priorityUrls || "[]") as string[]) : []
  };
}

export function enabledCategories(enabled: Record<Category, boolean>): Category[] {
  return CATEGORIES.filter((c) => enabled[c]);
}
