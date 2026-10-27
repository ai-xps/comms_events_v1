"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBanner } from "./StatusBanner";
import { useConfirm } from "./ConfirmDialog";
import { requestJson } from "@/lib/fetch-json";

export function EventActions({
  eventId,
  booked,
  full,
  starred,
  canCancel,
  members,
  bookedMemberIds,
  canDelegate,
  canEdit,
  myAttendance,
  myBookingId,
  canConfirmOwn,
  past
}: {
  eventId: string;
  booked: boolean;
  full: boolean;
  starred: boolean;
  canCancel: boolean;
  members: { id: string; name: string }[];
  bookedMemberIds?: string[];
  canDelegate: boolean;
  canEdit: boolean;
  myAttendance?: string | null;
  myBookingId?: string | null;
  canConfirmOwn?: boolean;
  past?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"info" | "error">("info");
  const [star, setStar] = useState(starred);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [dialog, confirm] = useConfirm();

  const availableMembers = useMemo(() => {
    const taken = new Set(bookedMemberIds ?? []);
    return members.filter((m) => !taken.has(m.id));
  }, [members, bookedMemberIds]);

  function show(text: string, nextKind: "info" | "error") {
    setKind(nextKind);
    setMessage(text);
  }

  async function attend(userId?: string) {
    setBusy(true);
    const result = await requestJson("/api/bookings", { method: "POST", body: { eventId, userId } });
    setBusy(false);
    if (!result.ok) return show(result.error, "error");
    if (userId) {
      setFlash(true);
      window.setTimeout(() => setFlash(false), 600);
      show("Booked.", "info");
    } else {
      show("You’re down as planning to go.", "info");
    }
    router.refresh();
  }

  async function cancel(userId?: string) {
    const forOther = Boolean(userId);
    const ok = await confirm({
      title: forOther ? "Remove this booking?" : "Cancel your place?",
      body: forOther
        ? "Their place will be freed for someone else."
        : "Your place will be freed for someone else.",
      confirmLabel: forOther ? "Remove" : "Cancel my place",
      cancelLabel: forOther ? "Keep" : "Keep my place",
      destructive: true
    });
    if (!ok) return;
    setBusy(true);
    const result = await requestJson("/api/bookings", {
      method: "DELETE",
      body: userId ? { eventId, userId } : { eventId }
    });
    setBusy(false);
    if (!result.ok) return show(result.error, "error");
    show(forOther ? "Removed." : "Booking cancelled.", "info");
    router.refresh();
  }

  async function markOwn(attendance: "ATTENDED" | "ABSENT") {
    if (!myBookingId) return;
    setBusy(true);
    const result = await requestJson("/api/attendance", {
      method: "POST",
      body: { bookingId: myBookingId, attendance }
    });
    setBusy(false);
    if (!result.ok) return show(result.error, "error");
    show(attendance === "ATTENDED" ? "Marked as attended." : "Marked as didn’t attend.", "info");
    router.refresh();
  }

  async function toggleStar() {
    const result = await requestJson<{ starred?: boolean }>("/api/stars", { method: "POST", body: { eventId } });
    if (!result.ok) return show(result.error, "error");
    setStar(!!result.data.starred);
  }

  const attendanceLabel =
    myAttendance === "ATTENDED" ? "Attended" : myAttendance === "ABSENT" ? "Didn’t" : myAttendance === "UNCONFIRMED" ? "Unconfirmed" : null;

  return (
    <div className="stack">
      <StatusBanner message={message} kind={kind} />
      {past && attendanceLabel ? (
        <p className={`attendance-chip attendance-${(myAttendance ?? "").toLowerCase()}`} data-testid="attendance-chip">
          {attendanceLabel}
        </p>
      ) : null}
      <div className="row">
        {booked ? (
          <span className="chip" aria-current="true">
            You clicked Attend
          </span>
        ) : full ? (
          <span className="chip">This event is full</span>
        ) : past ? null : (
          <button type="button" onClick={() => attend()} disabled={busy}>
            Attend
          </button>
        )}
        {canCancel ? (
          <button className="secondary" type="button" onClick={() => cancel()} disabled={busy}>
            Cancel booking
          </button>
        ) : null}
        {canConfirmOwn ? (
          <>
            <button type="button" onClick={() => markOwn("ATTENDED")} disabled={busy}>
              I went
            </button>
            <button className="secondary" type="button" onClick={() => markOwn("ABSENT")} disabled={busy}>
              I didn’t
            </button>
          </>
        ) : null}
        <button className="ghost" type="button" onClick={toggleStar} aria-pressed={star}>
          {star ? "Starred" : "Star"}
        </button>
        {canEdit ? (
          <Link className="button ghost" href={`/events/${eventId}/edit`}>
            Edit
          </Link>
        ) : null}
      </div>
      {canDelegate ? (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            const id = new FormData(e.currentTarget).get("userId");
            if (id) attend(String(id));
          }}
        >
          <label>
            Book a cell member
            <select name="userId" required disabled={availableMembers.length === 0}>
              {availableMembers.length === 0 ? (
                <option value="">Everyone in your cell is booked</option>
              ) : (
                availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))
              )}
            </select>
          </label>
          <button
            className={`secondary${flash ? " book-flash" : ""}`}
            type="submit"
            disabled={busy || availableMembers.length === 0}
            data-testid="book-member"
          >
            Book member
          </button>
        </form>
      ) : null}
      {dialog}
    </div>
  );
}

export function RemoveAttendeeButton({
  eventId,
  userId,
  name
}: {
  eventId: string;
  userId: string;
  name: string;
}) {
  const router = useRouter();
  const [dialog, confirm] = useConfirm();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const ok = await confirm({
      title: `Remove ${name}?`,
      body: "Their Attend place will be freed.",
      confirmLabel: "Remove",
      destructive: true
    });
    if (!ok) return;
    setBusy(true);
    await requestJson("/api/bookings", { method: "DELETE", body: { eventId, userId } });
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      <button className="ghost" type="button" onClick={remove} disabled={busy} data-testid="remove-attendee">
        Remove
      </button>
      {dialog}
    </>
  );
}
