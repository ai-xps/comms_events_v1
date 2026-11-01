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

/** Strip scheme (and leading www.) so Event Link fits the pending tile. */
export function displayEventLink(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

/** Start as full London date-time; end as clock only when present. */
export function pendingWhen(startsAt: Date, endsAt: Date | null | undefined): string {
  const start = formatDateTime(startsAt);
  if (!endsAt) return start;
  return `${start}–${formatTime(endsAt)}`;
}
