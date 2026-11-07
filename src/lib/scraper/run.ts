import { isHttpUrl } from "../security";
import { prisma } from "../db";
import { writeAudit } from "../audit";
import { categoryEnabledKey, type Category, CATEGORIES } from "../constants";
import { dropEndedStars } from "../stars";
import { persistCleanPriorityUrls } from "../settings";
import { scrapeDecision } from "./apply";
import { fixtureEvents } from "./fixtures";
import { selectHarvestEvents } from "./harvest";
import { fetchLiveEvents, type SourceResult } from "./live-adapter";
import { claimScrapeLock, releaseScrapeLock } from "./lock";

function nameKey(name: string) {
  return name.trim().toLowerCase();
}

export async function runScraper(opts: {
  trigger: "MANUAL" | "SCHEDULED";
  actorId?: string | null;
}) {
  await claimScrapeLock();
  let runId: string | null = null;
  const counts = {
    createdCount: 0,
    updatedCount: 0,
    discardedByRule: 0,
    leftPending: 0,
    publishedCount: 0,
    skippedHumanEdited: 0
  };
  let sources: SourceResult[] = [];

  try {
    const run = await prisma.scraperRun.create({
      data: {
        trigger: opts.trigger,
        status: "RUNNING"
      }
    });
    runId = run.id;
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const urls = (await persistCleanPriorityUrls(opts.actorId)).urls;
    await prisma.scraperRun.update({
      where: { id: runId },
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

    const live = await fetchLiveEvents(urls);
    sources = live.sources;
    const events = selectHarvestEvents(live.events, fixtureEvents(), enabled);

    const organisations = await prisma.organisation.findMany();
    const orgByKey = new Map(organisations.map((o) => [o.nameKey, o]));

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
      const decision = scrapeDecision(existingEvent?.status, org.status, {
        humanEditedAt: existingEvent?.humanEditedAt,
        needsTypeReview: incoming.needsTypeReview
      });
      const fields = {
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
      };
      if (decision.action === "skip-discarded") continue;
      if (decision.action === "skip-human-edited") {
        counts.skippedHumanEdited += 1;
        continue;
      }
      if (decision.action === "update" && existingEvent) {
        await prisma.event.update({ where: { id: existingEvent.id }, data: fields });
        counts.updatedCount += 1;
        continue;
      }
      const status = decision.status ?? "PENDING";
      if (status === "PUBLISHED") counts.publishedCount += 1;
      else if (status === "DISCARDED") counts.discardedByRule += 1;
      else counts.leftPending += 1;
      await prisma.event.create({
        data: {
          sourceKey: incoming.sourceKey,
          ...fields,
          status,
          recurrence: "NONE"
        }
      });
      counts.createdCount += 1;
    }

    await dropEndedStars();
    await prisma.scraperRun.update({
      where: { id: runId },
      data: {
        ...counts,
        sourceResults: JSON.stringify(sources),
        status: "OK",
        finishedAt: new Date()
      }
    });
    await writeAudit({
      actorId: opts.actorId ?? null,
      action: "scraper.run",
      entityType: "ScraperRun",
      entityId: runId,
      summary: `${opts.trigger} scraper created ${counts.createdCount}, updated ${counts.updatedCount}, skipped ${counts.skippedHumanEdited} human-edited`
    });
    return { id: runId, ...counts, sources, status: "OK" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scraper failed";
    if (runId) {
      await prisma.scraperRun.update({
        where: { id: runId },
        data: {
          status: "ERROR",
          errorText: message,
          sourceResults: JSON.stringify(sources),
          finishedAt: new Date()
        }
      });
    }
    throw error;
  } finally {
    await releaseScrapeLock();
  }
}

function safeExternalUrl(value: string | null | undefined): string | null {
  return value && isHttpUrl(value) ? value : null;
}
