import { londonDate } from "../time";
import { LIMITS } from "../security";
import { cleanText, clip, joinNotes, looksOnline, stripHtml } from "./text";
import type { ScrapedEvent } from "./types";

function unfold(raw: string): string[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescapeIcs(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseProps(block: string[]): Record<string, string> {
  const props: Record<string, string> = {};
  for (const line of block) {
    const split = line.indexOf(":");
    if (split < 0) continue;
    const left = line.slice(0, split);
    const value = unescapeIcs(line.slice(split + 1));
    const name = left.split(";")[0]!.toUpperCase();
    props[name] = value;
    const tz = /TZID=([^;:]+)/i.exec(left);
    if (tz) props[`${name}_TZID`] = tz[1]!;
    if (/VALUE=DATE/i.test(left)) props[`${name}_DATE`] = "1";
    if (value.endsWith("Z") && name.startsWith("DT")) props[`${name}_UTC`] = "1";
    const cn = /CN=([^;]+)/i.exec(left);
    if (cn) props[`${name}_CN`] = unescapeIcs(cn[1]!.replace(/^"|"$/g, "").trim());
  }
  return props;
}

export function parseIcsDate(value: string, opts: { utc?: boolean; dateOnly?: boolean } = {}): Date | null {
  const compact = value.replace(/[-:]/g, "");
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?Z?$/.exec(compact);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4] ?? "0");
  const minute = Number(m[5] ?? "0");
  if (opts.utc) return new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (opts.dateOnly) return londonDate(year, month, day, 0, 0);
  return londonDate(year, month, day, hour, minute);
}

function parseGeo(value: string | undefined): { lat: number; lng: number } | null {
  if (!value) return null;
  const [latRaw, lngRaw] = value.split(";");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function parseDurationMs(duration: string | undefined): number | null {
  if (!duration) return null;
  const m = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/i.exec(duration);
  if (!m) return null;
  const days = +(m[1] ?? 0);
  const hours = +(m[2] ?? 0);
  const mins = +(m[3] ?? 0);
  const secs = +(m[4] ?? 0);
  const ms = ((days * 24 + hours) * 60 * 60 + mins * 60 + secs) * 1000;
  return ms > 0 ? ms : null;
}

export function parseIcsEvents(raw: string, sourceUrl: string): ScrapedEvent[] {
  let host = "ics";
  try {
    host = new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    host = "ics";
  }
  const lines = unfold(raw);
  const events: ScrapedEvent[] = [];
  let block: string[] | null = null;
  for (const line of lines) {
    if (line.toUpperCase() === "BEGIN:VEVENT") {
      block = [];
      continue;
    }
    if (line.toUpperCase() === "END:VEVENT" && block) {
      const props = parseProps(block);
      block = null;
      if (props.STATUS && /CANCELLED/i.test(props.STATUS)) continue;
      const title = clip(cleanText(props.SUMMARY || "Untitled event"), LIMITS.titleLength);
      const startsAt = parseIcsDate(props.DTSTART ?? "", {
        utc: !!props.DTSTART_UTC,
        dateOnly: !!props.DTSTART_DATE
      });
      if (!startsAt) continue;
      const durationMs = parseDurationMs(props.DURATION);
      const endsAt =
        parseIcsDate(props.DTEND ?? "", { utc: !!props.DTEND_UTC, dateOnly: !!props.DTEND_DATE }) ??
        (durationMs ? new Date(startsAt.getTime() + durationMs) : new Date(startsAt.getTime() + 60 * 60 * 1000));
      const uid = clip(props.UID || `${title}:${startsAt.toISOString()}`, 180);
      const location = props.LOCATION ? cleanText(props.LOCATION) || null : null;
      const url = props.URL?.trim() || sourceUrl;
      const geo = parseGeo(props.GEO);
      const organiser = props.ORGANIZER_CN?.trim() || host;
      const description = props.DESCRIPTION ? clip(stripHtml(props.DESCRIPTION), LIMITS.textLength) : null;
      events.push({
        sourceKey: `live:${host}:${uid}`,
        title,
        organisationName: clip(organiser, LIMITS.titleLength),
        category: "Meetup",
        startsAt,
        endsAt: endsAt.getTime() <= startsAt.getTime() ? new Date(startsAt.getTime() + 60 * 60 * 1000) : endsAt,
        online: looksOnline(title, location, description),
        placeName: location ? clip(location, LIMITS.placeLength) : null,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        externalUrl: url,
        notes: joinNotes(
          description,
          props.CATEGORIES ? `Categories: ${props.CATEGORIES}` : null,
          props.STATUS && !/CONFIRMED/i.test(props.STATUS) ? `Status: ${props.STATUS}` : null
        ),
        fetchedFrom: sourceUrl,
        needsTypeReview: false
      });
      continue;
    }
    if (block) block.push(line);
  }
  return events;
}
