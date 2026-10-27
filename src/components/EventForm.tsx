"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { requestJson } from "@/lib/fetch-json";
import { LIMITS } from "@/lib/security";
import { StatusBanner } from "./StatusBanner";
import { LocationPicker } from "./LocationPicker";
import { useConfirm } from "./ConfirmDialog";
import type { GeocodeHit } from "@/lib/geocode";

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
  event,
  defaultStartsAt,
  defaultEndsAt
}: {
  organisations: Org[];
  colours: Record<string, string>;
  event?: EventValue;
  defaultStartsAt?: string;
  defaultEndsAt?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"info" | "error">("info");
  const [dialog, confirm] = useConfirm();
  const [online, setOnline] = useState(event?.online ?? false);
  const [placeName, setPlaceName] = useState(event?.placeName ?? "");
  const [lat, setLat] = useState(event?.lat != null ? String(event.lat) : "");
  const [lng, setLng] = useState(event?.lng != null ? String(event.lng) : "");
  const [looking, setLooking] = useState(false);
  const point = useMemo(() => {
    const la = Number(lat);
    const ln = Number(lng);
    return lat !== "" && lng !== "" && Number.isFinite(la) && Number.isFinite(ln) ? { lat: la, lng: ln } : null;
  }, [lat, lng]);
  const pending = event?.status === "PENDING";

  function leave(path: string) {
    router.push(path);
    router.refresh();
  }

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
    if (pending) leave("/pending");
    else leave(result.data.id ? `/events/${result.data.id}` : "/calendar");
  }

  async function findOnMap() {
    const q = placeName.trim();
    if (q.length < 3) {
      setKind("error");
      setMessage("Type a bit more of the place name, then Find on map.");
      return;
    }
    setLooking(true);
    const result = await requestJson<{ hits?: GeocodeHit[]; error?: string }>("/api/geocode", {
      method: "POST",
      body: { q }
    });
    setLooking(false);
    if (!result.ok) {
      setKind("error");
      setMessage(result.error);
      return;
    }
    const hit = result.data.hits?.[0];
    if (!hit) {
      setKind("info");
      setMessage("No place found. Click the map instead.");
      return;
    }
    setLat(String(hit.lat));
    setLng(String(hit.lng));
    if (hit.label && !placeName.trim()) setPlaceName(hit.label);
    setKind("info");
    setMessage("Pin set from the address. Click the map to move it.");
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
    leave("/calendar");
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
        <input name="title" required maxLength={LIMITS.titleLength} defaultValue={event?.title} />
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
          <input type="datetime-local" name="startsAt" required defaultValue={event?.startsAt ?? defaultStartsAt} />
        </label>
        <label>
          Ends
          <input type="datetime-local" name="endsAt" required defaultValue={event?.endsAt ?? defaultEndsAt} />
        </label>
      </div>
      <label>
        Place
        <input
          name="placeName"
          maxLength={LIMITS.placeLength}
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
        />
      </label>
      {!online ? (
        <div className="location-field">
          <div className="row">
            <button className="secondary" type="button" onClick={findOnMap} disabled={looking}>
              {looking ? "Finding…" : "Find on map"}
            </button>
          </div>
          <span className="field-label">Map pin</span>
          <p className="muted">
            {point ? "Pin set. Click the map to move it, or find an address above." : "Click the map, or find an address above."}
          </p>
          <LocationPicker
            value={point}
            onChange={(p) => {
              setLat(String(p.lat));
              setLng(String(p.lng));
            }}
          />
          <input type="hidden" name="lat" value={lat} />
          <input type="hidden" name="lng" value={lng} />
          <details>
            <summary>Enter coordinates instead</summary>
            <div className="row">
              <label>
                Latitude
                <input inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
              </label>
              <label>
                Longitude
                <input inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} />
              </label>
            </div>
          </details>
        </div>
      ) : null}
      <div className="event-link-row">
        <label className="event-link-field">
          Event Link
          <input
            name="externalUrl"
            placeholder="https://… event page or Zoom"
            defaultValue={event?.externalUrl}
          />
        </label>
        <label className="online-check">
          <input type="checkbox" name="online" checked={online} onChange={(e) => setOnline(e.target.checked)} />
          Online
        </label>
      </div>
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
            <option value="WEEKLY">Weekly (24 occurrences)</option>
          </select>
        </label>
      ) : null}
      <div className="row">
        <button type="submit">Save</button>
        {pending ? (
          <>
            <button type="button" onClick={() => submit({ status: "PUBLISHED" })}>
              Publish
            </button>
            <button className="secondary" type="button" onClick={() => submit({ status: "DISCARDED" })}>
              Discard
            </button>
            <Link className="button ghost" href="/pending">
              Back to pending
            </Link>
          </>
        ) : (
          <Link className="button ghost" href="/calendar">
            Back to calendar
          </Link>
        )}
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
