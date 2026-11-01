import { formatDateTime, formatTime } from "./time";

/**
 * Discard confirm copy — Discard changes event status only.
 * It must never imply blacklisting the organisation.
 */
export const DISCARD_EVENT_CONFIRM_BODY =
  "The event leaves the pending list. This does not blacklist the organisation — they can still appear in future scrapes.";

export function discardTouchesOrganisation(): boolean {
  return false;
}

/** Known scrape hosts → short names readers recognise on the pending tile. */
const EVENT_LINK_SITE_NAMES: Record<string, string> = {
  "birminghamcathedral.com": "Birmingham Cathedral",
  "carrslane.co.uk": "Carrs Lane",
  "meetup.com": "Meetup",
  "birmingham.ac.uk": "University of Birmingham",
  "bcu.ac.uk": "Birmingham City University",
  "bcusu.com": "BCU Students' Union",
  "aston.ac.uk": "Aston University",
  "astonsu.com": "Aston Students' Union",
  "iod.com": "Institute of Directors",
  "greaterbirminghamchambers.com": "Greater Birmingham Chambers",
  "birmingham.impacthub.net": "Impact Hub Birmingham",
  "digbethdiningclub.com": "Digbeth Dining Club",
  "calendar.google.com": "Google Calendar",
  "outlook.office365.com": "Outlook Calendar",
  "cloud.churchsuite.com": "ChurchSuite",
  "churchsuite.com": "ChurchSuite"
};

function hostKey(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/**
 * Short label for the pending Event Link row. Full URL stays in the tooltip.
 * Prefer a known site name; otherwise the bare hostname (no long path).
 */
export function eventLinkLabel(url: string): string {
  try {
    const host = hostKey(new URL(url).hostname);
    const site = EVENT_LINK_SITE_NAMES[host] ?? host;
    return `On ${site}`;
  } catch {
    return "On source page";
  }
}

/** Start as full London date-time; end as clock only when present. */
export function pendingWhen(startsAt: Date, endsAt: Date | null | undefined): string {
  const start = formatDateTime(startsAt);
  if (!endsAt) return start;
  return `${start}–${formatTime(endsAt)}`;
}
