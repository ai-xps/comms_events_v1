"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBanner } from "./StatusBanner";

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

  async function attend(userId?: string) {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, userId })
    });
    const data = await response.json();
    if (!response.ok) {
      setKind("error");
      setMessage(data.error);
      return;
    }
    setKind("info");
    setMessage("You’re down as planning to go.");
    router.refresh();
  }

  async function cancel() {
    const response = await fetch("/api/bookings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId })
    });
    const data = await response.json();
    if (!response.ok) {
      setKind("error");
      setMessage(data.error);
      return;
    }
    setMessage("Booking cancelled.");
    router.refresh();
  }

  async function toggleStar() {
    const response = await fetch("/api/stars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId })
    });
    const data = await response.json();
    setStar(!!data.starred);
  }

  return (
    <div className="stack">
      <StatusBanner message={message} kind={kind} />
      <div className="row">
        {booked ? (
          <span className="chip" aria-pressed="true">
            You clicked Attend
          </span>
        ) : full ? (
          <span className="chip">This event is full</span>
        ) : (
          <button type="button" onClick={() => attend()}>
            Attend
          </button>
        )}
        {canCancel ? (
          <button className="secondary" type="button" onClick={cancel}>
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
          <button className="secondary" type="submit">
            Book member
          </button>
        </form>
      ) : null}
    </div>
  );
}
