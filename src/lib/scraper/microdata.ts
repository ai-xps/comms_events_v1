import { LIMITS, isHttpUrl } from "../security";
import { cleanText, clip, joinNotes, looksOnline, stripHtml } from "./text";
import type { ScrapedEvent } from "./types";

/**
 * Fallback when a page has no JSON-LD: HTML microdata itemscope Event blocks.
 * Like reading sticky labels on a kitchen jar when the printed recipe card is missing.
 */

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
  const m = re.exec(tag);
  return m ? m[1]! : null;
}

function decodeChunk(html: string): string {
  return stripHtml(html);
}

/** Pull itemprop values from within one itemscope block (shallow). */
function propMap(blockHtml: string): Record<string, string[]> {
  const props: Record<string, string[]> = {};
  const re =
    /<(?<tag>[a-z0-9]+)([^>]*\bitemprop\s*=\s*["'](?<prop>[^"']+)["'][^>]*)>(?<inner>[\s\S]*?)<\/\k<tag>>|<(?:meta|link|time|a|img)([^>]*\bitemprop\s*=\s*["']([^"']+)["'][^>]*)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(blockHtml))) {
    const prop = (match.groups?.prop ?? match[6] ?? "").trim();
    if (!prop) continue;
    const open = match[2] ?? match[5] ?? "";
    const content =
      attr(open, "content") ??
      attr(open, "datetime") ??
      attr(open, "href") ??
      attr(open, "src") ??
      (match.groups?.inner != null ? decodeChunk(match.groups.inner) : "");
    if (!content.trim()) continue;
    (props[prop] ??= []).push(content.trim());
  }
  return props;
}

function first(props: Record<string, string[]>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = props[key]?.[0];
    if (v?.trim()) return v.trim();
  }
  return null;
}

export function eventsFromMicrodata(html: string, sourceUrl: string): ScrapedEvent[] {
  let host = "microdata";
  try {
    host = new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    host = "microdata";
  }

  const events: ScrapedEvent[] = [];
  const blockRe =
    /<([a-z0-9]+)([^>]*\bitemscope\b[^>]*\bitemtype\s*=\s*["'][^"']*Event[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(html))) {
    const block = match[3] ?? "";
    const props = propMap(block);
    const title = clip(cleanText(first(props, "name", "headline") ?? "Untitled event"), LIMITS.titleLength);
    const startRaw = first(props, "startDate", "startTime");
    if (!startRaw) continue;
    const startsAt = new Date(startRaw);
    if (Number.isNaN(startsAt.getTime())) continue;
    const endRaw = first(props, "endDate", "endTime");
    const endsAt = endRaw ? new Date(endRaw) : new Date(startsAt.getTime() + 60 * 60 * 1000);
    const placeName = first(props, "location", "address");
    const urlRaw = first(props, "url");
    const url = urlRaw && isHttpUrl(urlRaw) ? urlRaw : sourceUrl;
    const description = first(props, "description");
    const organiser = first(props, "organizer", "performer") ?? host;
    const uid = clip(urlRaw && isHttpUrl(urlRaw) ? urlRaw : `${title}:${startsAt.toISOString()}`, 180);
    events.push({
      sourceKey: `live:${host}:${uid}`,
      title,
      organisationName: clip(cleanText(organiser), LIMITS.titleLength),
      category: "Meetup",
      startsAt,
      endsAt:
        Number.isNaN(endsAt.getTime()) || endsAt.getTime() <= startsAt.getTime()
          ? new Date(startsAt.getTime() + 60 * 60 * 1000)
          : endsAt,
      online: looksOnline(title, placeName, description),
      placeName: placeName ? clip(cleanText(placeName), LIMITS.placeLength) : null,
      lat: null,
      lng: null,
      externalUrl: url,
      notes: joinNotes(description ? clip(stripHtml(description), LIMITS.textLength) : null),
      fetchedFrom: sourceUrl,
      needsTypeReview: false
    });
  }
  return events;
}

/** Same-host calendar file links found in HTML (ICS discovery). */
export function discoverCalendarLinks(html: string, pageUrl: string): string[] {
  let base: URL;
  try {
    base = new URL(pageUrl);
  } catch {
    return [];
  }
  const found = new Set<string>();
  const linkRe = /<(?:a|link)\b([^>]+)>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(html))) {
    const attrs = match[1] ?? "";
    const href = attr(attrs, "href");
    if (!href) continue;
    const type = (attr(attrs, "type") ?? "").toLowerCase();
    const rel = (attr(attrs, "rel") ?? "").toLowerCase();
    let absolute: URL;
    try {
      absolute = new URL(href, base);
    } catch {
      continue;
    }
    if (absolute.hostname.toLowerCase() !== base.hostname.toLowerCase()) continue;
    const path = absolute.pathname.toLowerCase();
    const looksIcs =
      path.endsWith(".ics") ||
      type.includes("text/calendar") ||
      (rel.includes("alternate") && type.includes("calendar"));
    if (!looksIcs) continue;
    found.add(absolute.toString());
  }
  return [...found].slice(0, 5);
}
