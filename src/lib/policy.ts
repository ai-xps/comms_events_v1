import type { Role } from "./constants";

/**
 * The role matrix in one place. Every server route that books, cancels, exports or reports
 * asks these functions, so a change to who-can-do-what happens here and is covered by
 * tests/unit/policy.test.ts.
 */

export type Actor = { id: string; role: Role; cellId: string | null };
export type Decision = { ok: true } | { ok: false; status: 403; reason: string };

const allow: Decision = { ok: true };
const deny = (reason: string): Decision => ({ ok: false, status: 403, reason });

/** Members book themselves; cell leaders book members of their own cell; admins book anyone. */
export function canBookFor(actor: Actor, target: { id: string; cellId: string | null }): Decision {
  if (actor.role === "admin") return allow;
  if (actor.role === "member") return actor.id === target.id ? allow : deny("You can only book yourself.");
  if (!actor.cellId || target.cellId !== actor.cellId) return deny("You can only book members of your own cell.");
  return allow;
}

/** Members cancel their own place before the start; leaders cancel within their cell at any time. */
export function canCancelBooking(
  actor: Actor,
  booking: { userId: string; userCellId: string | null },
  eventStarted: boolean
): Decision {
  if (actor.role === "admin") return allow;
  if (actor.role === "member") {
    if (actor.id !== booking.userId) return deny("You can only cancel your own booking.");
    if (eventStarted) return deny("This event has already started.");
    return allow;
  }
  if (!actor.cellId || booking.userCellId !== actor.cellId) {
    return deny("You can only cancel bookings for your own cell.");
  }
  return allow;
}

/** Attendee exports: admin sees everyone, a cell leader sees their own cell, members cannot export. */
export function canExportAttendees(actor: Actor): Decision {
  if (actor.role === "admin") return allow;
  if (actor.role === "cell leader" && actor.cellId) return allow;
  return deny("You cannot export this list.");
}

/** Row filter that matches canExportAttendees: true when the actor may see this person's row. */
export function canSeeAttendee(actor: Actor, attendeeCellId: string | null): boolean {
  if (actor.role === "admin") return true;
  return actor.role === "cell leader" && !!actor.cellId && attendeeCellId === actor.cellId;
}

export function canViewInsights(actor: Actor): boolean {
  return actor.role === "admin" || (actor.role === "cell leader" && !!actor.cellId);
}

export type InsightsScope = { kind: "region" } | { kind: "cell"; cellId: string };

/**
 * Admin sees the region, or one cell when they pick it. A cell leader is always pinned to their
 * own cell, whatever cell they ask for. Members get null and must be refused.
 */
export function insightsScope(actor: Actor, requestedCellId?: string | null): InsightsScope | null {
  if (!canViewInsights(actor)) return null;
  if (actor.role === "cell leader") return { kind: "cell", cellId: actor.cellId! };
  return requestedCellId ? { kind: "cell", cellId: requestedCellId } : { kind: "region" };
}

export function canManageMembers(actor: Actor): boolean {
  return actor.role === "admin";
}
