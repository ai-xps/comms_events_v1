"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { requestJson } from "@/lib/fetch-json";
import { StatusBanner } from "./StatusBanner";
import { LocationPicker } from "./LocationPicker";
import { useConfirm } from "./ConfirmDialog";

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
  const [dialog, confirm] = useConfirm();
  const [online, setOnline] = useState(event?.online ?? false);
  const [lat, setLat] = useState(event?.lat != null ? String(event.lat) : "");
  const [lng, setLng] = useState(event?.lng != null ? String(event.lng) : "");
  const point = useMemo(() => {
    const la = Number(lat);
    const ln = Number(lng);
    return lat !== "" && lng !== "" && Number.isFinite(la) && Number.isFinite(ln) ? { lat: la, lng: ln } : null;
  }, [lat, lng]);

  async function submit(extra: Record<string, string> = {}) {
    if (!formRef.current) return;
    if (extra.status === "DISCARDED") {
      const ok = await confirm({
        title: "Discard this event?",
        body: "It leaves the review queue and will not appear on the calendar.",
        confirmLabel: "Discard",
        cancelLabel: "Keep reviewing",
        destructive: true
      });
      if (!ok) return;
    }
    const payload = Object.fromEntries(new FormData(formRef.current).entries());
    const result = await requestJson<{ id?: string }>(event ? `/api/events/${event.id}` : "/api/events", {
      method: event ? "PATCH" : "POST",
      body: { ...payload, online: online ? "on" : "off", ...extra }
    });
    if (!result.ok) {
      setKind("error");
      setMessage(result.error);
      return;
    }
    if (event?.status === "PENDING" && (extra.status === "PUBLISHED" || extra.status === "DISCARDED")) {
      router.push("/pending");
    } else {
      router.push(result.data.id ? `/events/${result.data.id}` : "/calendar");
    }
    router.refresh();
  }

  async function remove(mode: "this" | "future") {
    if (!event) return;
    const ok = await confirm(
      mode === "this"
        ? {
            title: "Delete this event?",
            body: "Anyone who clicked Attend will lose their place. This cannot be undone.",
            confirmLabel: "Delete event",
            destructive: true
          }
        : {
            title: "Delete this and all later events in the series?",
            body: "Earlier events stay. Places on the deleted events are removed. This cannot be undone.",
            confirmLabel: "Delete series from here",
            destructive: true
          }
    );
    if (!ok) return;
    const result = await requestJson(`/api/events/${event.id}`, { method: "DELETE", body: { mode } });
    if (!result.ok) {
      setKind("error");
      setMessage(result.error);
      return;
    }
    router.push("/calendar");
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
        <input type="checkbox" name="online" checked={online} onChange={(e) => setOnline(e.target.checked)} /> Online
      </label>
      <label>
        Place
        <input name="placeName" defaultValue={event?.placeName} />
      </label>
      {!online ? (
        <div className="location-field">
          <span className="field-label">Map pin</span>
          <p className="muted">
            {point ? `Pin set at ${point.lat}, ${point.lng}. Click the map to move it.` : "Click the map to set where the event is."}
          </p>
          <LocationPicker
            value={point}
            onChange={(p) => {
              setLat(String(p.lat));
              setLng(String(p.lng));
            }}
          />
          <details>
            <summary>Enter coordinates instead</summary>
            <div className="row">
              <label>
                Latitude
                <input name="lat" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
              </label>
              <label>
                Longitude
                <input name="lng" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} />
              </label>
            </div>
          </details>
        </div>
      ) : null}
      <label>
        Event Link
        <input name="externalUrl" placeholder="https://" defaultValue={event?.externalUrl} />
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
            <button className="ghost" type="button" onClick={() => remove("this")}>
              Delete this occurrence
            </button>
            {event.seriesId ? (
              <button className="ghost" type="button" onClick={() => remove("future")}>
                Delete this and future
              </button>
            ) : null}
          </>
        ) : null}
      </div>
      <p className="muted">Colours are {Object.keys(colours).join(", ")}.</p>
      {dialog}
    </form>
  );
}
