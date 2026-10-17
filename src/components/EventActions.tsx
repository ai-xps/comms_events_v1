"use client";

import { useState } from "react";
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
  canDelegate,
  canEdit
}: {
  eventId: string;
  booked: boolean;
  full: boolean;
  starred: boolean;
  canCancel: boolean;
  members: { id: string; name: string }[];
  canDelegate: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"info" | "error">("info");
  const [star, setStar] = useState(starred);
  const [busy, setBusy] = useState(false);
  const [dialog, confirm] = useConfirm();

  function show(text: string, nextKind: "info" | "error") {
    setKind(nextKind);
    setMessage(text);
  }

  async function attend(userId?: string) {
    setBusy(true);
    const result = await requestJson("/api/bookings", { method: "POST", body: { eventId, userId } });
    setBusy(false);
    if (!result.ok) return show(result.error, "error");
    show(userId ? "Booked." : "You’re down as planning to go.", "info");
    router.refresh();
  }

  async function cancel() {
    const ok = await confirm({
      title: "Cancel your place?",
      body: "Your place will be freed for someone else.",
      confirmLabel: "Cancel my place",
      cancelLabel: "Keep my place",
      destructive: true
    });
    if (!ok) return;
    setBusy(true);
    const result = await requestJson("/api/bookings", { method: "DELETE", body: { eventId } });
    setBusy(false);
    if (!result.ok) return show(result.error, "error");
    show("Booking cancelled.", "info");
    router.refresh();
  }

  async function toggleStar() {
    const result = await requestJson<{ starred?: boolean }>("/api/stars", { method: "POST", body: { eventId } });
    if (!result.ok) return show(result.error, "error");
    setStar(!!result.data.starred);
  }

  return (
    <div className="stack">
      <StatusBanner message={message} kind={kind} />
      <div className="row">
        {booked ? (
          <span className="chip" aria-current="true">
            You clicked Attend
          </span>
        ) : full ? (
          <span className="chip">This event is full</span>
        ) : (
          <button type="button" onClick={() => attend()} disabled={busy}>
            Attend
          </button>
        )}
        {canCancel ? (
          <button className="secondary" type="button" onClick={cancel} disabled={busy}>
            Cancel booking
          </button>
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
            <select name="userId" required>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <button className="secondary" type="submit" disabled={busy}>
            Book member
          </button>
        </form>
      ) : null}
      {dialog}
    </div>
  );
}
