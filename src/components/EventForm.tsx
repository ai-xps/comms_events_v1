"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { StatusBanner } from "./StatusBanner";

type Org = { id: string; name: string };
type EventValue = {
  id: string;
  title: string;
  organisationName: string;
  organisationId: string | null;
  category: string;
  startsAt: string;
  endsAt: string;
  online: boolean;
  placeName: string;
  lat: number | null;
  lng: number | null;
  externalUrl: string;
  notes: string;
  capacity: number | null;
  status: string;
  recurrence: string;
  seriesId: string | null;
};

export function EventForm({
  organisations,
  colours,
  event
}: {
  organisations: Org[];
  colours: Record<string, string>;
  event?: EventValue;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"info" | "error">("info");

  async function submit(extra: Record<string, string> = {}) {
    if (!formRef.current) return;
    const payload = Object.fromEntries(new FormData(formRef.current).entries());
    const response = await fetch(event ? `/api/events/${event.id}` : "/api/events", {
      method: event ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ...extra })
    });
    const data = await response.json();
    if (!response.ok) {
      setKind("error");
      setMessage(data.error);
      return;
    }
    if (extra.status === "DISCARDED") {
      router.push("/pending");
    } else {
      router.push(data.id ? `/events/${data.id}` : "/calendar");
    }
    router.refresh();
  }

  return (
    <form
      ref={formRef}
      className="card stack"
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submit();
      }}
    >
      <StatusBanner message={message} kind={kind} />
      <label>
        Title
        <input name="title" required defaultValue={event?.title} />
      </label>
      <label>
        Organisation
        <input name="organisationName" required defaultValue={event?.organisationName} list="orgs" />
        <datalist id="orgs">
          {organisations.map((o) => (
            <option key={o.id} value={o.name} />
          ))}
        </datalist>
      </label>
      <label>
        Type
        <select name="category" defaultValue={event?.category ?? "Christian"}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <div className="row">
        <label>
          Starts
          <input type="datetime-local" name="startsAt" required defaultValue={event?.startsAt} />
        </label>
        <label>
          Ends
          <input type="datetime-local" name="endsAt" required defaultValue={event?.endsAt} />
        </label>
      </div>
      <label>
        <input type="checkbox" name="online" defaultChecked={event?.online} /> Online
      </label>
      <label>
        Place
        <input name="placeName" defaultValue={event?.placeName} />
      </label>
      <div className="row">
        <label>
          Latitude
          <input name="lat" defaultValue={event?.lat ?? ""} />
        </label>
        <label>
          Longitude
          <input name="lng" defaultValue={event?.lng ?? ""} />
        </label>
      </div>
      <label>
        Host URL
        <input name="externalUrl" defaultValue={event?.externalUrl} />
      </label>
      <label>
        Notes
        <textarea name="notes" defaultValue={event?.notes} />
      </label>
      <label>
        Capacity (leave blank for unlimited)
        <input name="capacity" type="number" min="0" defaultValue={event?.capacity ?? ""} />
      </label>
      {!event ? (
        <label>
          Repeat
          <select name="recurrence" defaultValue="NONE">
            <option value="NONE">One-off</option>
            <option value="WEEKLY">Weekly (12 occurrences)</option>
          </select>
        </label>
      ) : null}
      <div className="row">
        <button type="submit">Save</button>
        {event?.status === "PENDING" ? (
          <>
            <button type="button" onClick={() => submit({ status: "PUBLISHED" })}>
              Publish
            </button>
            <button className="secondary" type="button" onClick={() => submit({ status: "DISCARDED" })}>
              Discard
            </button>
          </>
        ) : null}
        {event ? (
          <>
            <button
              className="ghost"
              type="button"
              onClick={() =>
                fetch(`/api/events/${event.id}`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ mode: "this" })
                }).then(() => router.push("/calendar"))
              }
            >
              Delete this occurrence
            </button>
            {event.seriesId ? (
              <button
                className="ghost"
                type="button"
                onClick={() =>
                  fetch(`/api/events/${event.id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mode: "future" })
                  }).then(() => router.push("/calendar"))
                }
              >
                Delete this and future
              </button>
            ) : null}
          </>
        ) : null}
      </div>
      <p className="muted">Colours are {Object.keys(colours).join(", ")}.</p>
    </form>
  );
}
