import { londonDate } from "../time";
import { LIMITS } from "../security";
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
    const name = left.split(";")[0].toUpperCase();
    props[name] = value;
    const tz = /TZID=([^;:]+)/i.exec(left);
    if (tz) props[`${name}_TZID`] = tz[1];
    if (/VALUE=DATE/i.test(left)) props[`${name}_DATE`] = "1";
    if (value.endsWith("Z") && name.startsWith("DT")) props[`${name}_UTC`] = "1";
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

function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
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
      const title = clip(props.SUMMARY || "Untitled event", LIMITS.titleLength);
      const startsAt = parseIcsDate(props.DTSTART ?? "", {
        utc: !!props.DTSTART_UTC,
        dateOnly: !!props.DTSTART_DATE
      });
      if (!startsAt) continue;
      const endsAt =
        parseIcsDate(props.DTEND ?? "", { utc: !!props.DTEND_UTC, dateOnly: !!props.DTEND_DATE }) ??
        new Date(startsAt.getTime() + 60 * 60 * 1000);
      const uid = clip(props.UID || `${title}:${startsAt.toISOString()}`, 180);
      const location = props.LOCATION?.trim() || null;
      const url = props.URL?.trim() || sourceUrl;
      events.push({
        sourceKey: `live:${host}:${uid}`,
        title,
        organisationName: clip(props.ORGANIZER || host, LIMITS.titleLength),
        category: "Meetup",
        startsAt,
        endsAt,
        online: /online|zoom|teams/i.test(`${title} ${location ?? ""}`),
        placeName: location,
        lat: null,
        lng: null,
        externalUrl: url,
        notes: props.DESCRIPTION ? clip(props.DESCRIPTION, LIMITS.textLength) : null,
        needsTypeReview: false
      });
      continue;
    }
    if (block) block.push(line);
  }
  return events;
}
