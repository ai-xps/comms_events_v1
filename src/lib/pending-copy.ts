/**
 * Discard confirm copy — Discard changes event status only.
 * It must never imply blacklisting the organisation.
 */
export const DISCARD_EVENT_CONFIRM_BODY =
  "The event leaves the pending list. This does not blacklist the organisation — they can still appear in future scrapes.";

export function discardTouchesOrganisation(): boolean {
  return false;
}
