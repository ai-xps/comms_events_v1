import { LIMITS, isHttpUrl } from "../security";
import type { ScrapedEvent } from "./types";

function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

function typeName(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const typed = value as { "@type"?: unknown };
  const t = typed["@type"];
  if (Array.isArray(t)) return t.map(String).join(" ");
  return t ? String(t) : "";
}

function walk(node: unknown, acc: Record<string, unknown>[]): void {
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, acc));
    return;
  }
  if (!node || typeof node !== "object") return;
  const rec = node as Record<string, unknown>;
  if (/\bEvent\b/i.test(typeName(rec))) acc.push(rec);
  if (rec["@graph"]) walk(rec["@graph"], acc);
}

export function extractJsonLdScripts(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    try {
      out.push(JSON.parse(match[1]));
    } catch {
      // Ignore broken JSON-LD blocks; other scripts on the page may still parse.
    }
  }
  return out;
}

export function eventsFromJsonLd(payload: unknown, sourceUrl: string): ScrapedEvent[] {
  let host = "jsonld";
  try {
    host = new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    host = "jsonld";
  }
  const found: Record<string, unknown>[] = [];
  walk(payload, found);
  const events: ScrapedEvent[] = [];
  for (const rec of found) {
    const title = clip(String(rec.name ?? rec.headline ?? "Untitled event"), LIMITS.titleLength);
    const startRaw = rec.startDate ?? rec.startTime;
    const endRaw = rec.endDate ?? rec.endTime;
    const startsAt = startRaw ? new Date(String(startRaw)) : null;
    if (!startsAt || Number.isNaN(startsAt.getTime())) continue;
    const endsAt = endRaw ? new Date(String(endRaw)) : new Date(startsAt.getTime() + 60 * 60 * 1000);
    const location = rec.location;
    let placeName: string | null = null;
    if (typeof location === "string") placeName = location;
    else if (location && typeof location === "object") {
      const loc = location as { name?: string; address?: unknown };
      placeName = loc.name ?? (typeof loc.address === "string" ? loc.address : null);
    }
    const org = rec.organizer;
    let organisationName = host;
    if (typeof org === "string") organisationName = org;
    else if (org && typeof org === "object" && "name" in org) organisationName = String((org as { name: string }).name);
    const url = typeof rec.url === "string" && isHttpUrl(rec.url) ? rec.url : sourceUrl;
    const uid = clip(String(rec["@id"] ?? rec.identifier ?? `${title}:${startsAt.toISOString()}`), 180);
    events.push({
      sourceKey: `live:${host}:${uid}`,
      title,
      organisationName: clip(organisationName, LIMITS.titleLength),
      category: "Meetup",
      startsAt,
      endsAt: Number.isNaN(endsAt.getTime()) ? new Date(startsAt.getTime() + 60 * 60 * 1000) : endsAt,
      online: /online|virtual|zoom/i.test(`${title} ${placeName ?? ""} ${String(rec.eventAttendanceMode ?? "")}`),
      placeName,
      lat: null,
      lng: null,
      externalUrl: url,
      notes: rec.description ? clip(String(rec.description), LIMITS.textLength) : null
    });
  }
  return events;
}
