import { isHttpUrl } from "../security";
import { prisma } from "../db";
import { writeAudit } from "../audit";
import { categoryEnabledKey, type Category, CATEGORIES } from "../constants";
import { dropEndedStars } from "../stars";
import { fixtureEvents } from "./fixtures";

function nameKey(name: string) {
  return name.trim().toLowerCase();
}

export async function runScraper(opts: {
  trigger: "MANUAL" | "SCHEDULED";
  actorId?: string | null;
}) {
  const existing = await prisma.scrapeLock.findUnique({ where: { id: "scrape" } });
  if (existing && existing.heldUntil > new Date()) {
    const error = new Error("A scraper run is already in progress.");
    (error as Error & { status?: number }).status = 409;
    throw error;
  }
  await prisma.scrapeLock.upsert({
    where: { id: "scrape" },
    update: { heldUntil: new Date(Date.now() + 5 * 60 * 1000) },
    create: { id: "scrape", heldUntil: new Date(Date.now() + 5 * 60 * 1000) }
  });

  const run = await prisma.scraperRun.create({
    data: {
      trigger: opts.trigger,
      status: "RUNNING"
    }
  });

  const counts = {
    createdCount: 0,
    updatedCount: 0,
    discardedByRule: 0,
    leftPending: 0,
    publishedCount: 0
  };

  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const urls = settings ? JSON.parse(settings.priorityUrls || "[]") : [];
    await prisma.scraperRun.update({
      where: { id: run.id },
      data: { priorityUrlsSnapshot: JSON.stringify(urls) }
    });

    const enabled = new Set<Category>();
    if (settings) {
      for (const category of CATEGORIES) {
        if (settings[categoryEnabledKey(category)]) enabled.add(category);
      }
    } else {
      CATEGORIES.forEach((c) => enabled.add(c));
    }

    const organisations = await prisma.organisation.findMany();
    const orgByKey = new Map(organisations.map((o) => [o.nameKey, o]));
    const events = fixtureEvents().filter((e) => enabled.has(e.category));

    for (const incoming of events) {
      const key = nameKey(incoming.organisationName);
      let org = orgByKey.get(key);
      if (!org) {
        org = await prisma.organisation.create({
          data: {
            name: incoming.organisationName.trim(),
            nameKey: key,
            status: "STANDARD"
          }
        });
        orgByKey.set(key, org);
      }
      const existingEvent = await prisma.event.findUnique({
        where: { sourceKey: incoming.sourceKey }
      });
      if (existingEvent) {
        await prisma.event.update({
          where: { id: existingEvent.id },
          data: {
            title: incoming.title,
            organisationName: incoming.organisationName,
            organisationId: org.id,
            category: incoming.category,
            startsAt: incoming.startsAt,
            endsAt: incoming.endsAt,
            online: incoming.online,
            placeName: incoming.placeName ?? null,
            lat: incoming.lat ?? null,
            lng: incoming.lng ?? null,
            externalUrl: safeExternalUrl(incoming.externalUrl),
            notes: incoming.notes ?? null
          }
        });
        counts.updatedCount += 1;
        continue;
      }
      let status = "PENDING";
      if (org.status === "WHITELIST") {
        status = "PUBLISHED";
        counts.publishedCount += 1;
      } else if (org.status === "BLACKLIST") {
        status = "DISCARDED";
        counts.discardedByRule += 1;
      } else {
        counts.leftPending += 1;
      }
      await prisma.event.create({
        data: {
          sourceKey: incoming.sourceKey,
          title: incoming.title,
          organisationName: incoming.organisationName,
          organisationId: org.id,
          category: incoming.category,
          startsAt: incoming.startsAt,
          endsAt: incoming.endsAt,
          online: incoming.online,
          placeName: incoming.placeName ?? null,
          lat: incoming.lat ?? null,
          lng: incoming.lng ?? null,
          externalUrl: safeExternalUrl(incoming.externalUrl),
          notes: incoming.notes ?? null,
          status,
          recurrence: "NONE"
        }
      });
      counts.createdCount += 1;
    }

    await dropEndedStars();
    await prisma.scraperRun.update({
      where: { id: run.id },
      data: {
        ...counts,
        status: "OK",
        finishedAt: new Date()
      }
    });
    await writeAudit({
      actorId: opts.actorId ?? null,
      action: "scraper.run",
      entityType: "ScraperRun",
      entityId: run.id,
      summary: `${opts.trigger} scraper created ${counts.createdCount}, updated ${counts.updatedCount}`
    });
    return { id: run.id, ...counts, status: "OK" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scraper failed";
    await prisma.scraperRun.update({
      where: { id: run.id },
      data: { status: "ERROR", errorText: message, finishedAt: new Date() }
    });
    throw error;
  } finally {
    await prisma.scrapeLock.deleteMany({ where: { id: "scrape" } });
  }
}

function safeExternalUrl(value: string | null | undefined): string | null {
  return value && isHttpUrl(value) ? value : null;
}
