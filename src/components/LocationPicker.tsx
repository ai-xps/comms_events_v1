"use client";

import { useEffect, useRef } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";

const BIRMINGHAM: [number, number] = [52.4862, -1.8904];

const MARKER = {
  radius: 8,
  color: "#8b3a24",
  weight: 2,
  fillColor: "#8b3a24",
  fillOpacity: 0.85
};

type Point = { lat: number; lng: number };

export function LocationPicker({
  value,
  onChange
}: {
  value: Point | null;
  onChange: (point: Point) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initial = useRef(value);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !ref.current) return;
      const L = leaflet.default;
      const start = initial.current;
      const map = L.map(ref.current).setView(start ? [start.lat, start.lng] : BIRMINGHAM, start ? 15 : 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);
      if (start) markerRef.current = L.circleMarker([start.lat, start.lng], MARKER).addTo(map);
      map.on("click", (e) => {
        const point = {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6))
        };
        if (markerRef.current) markerRef.current.setLatLng([point.lat, point.lng]);
        else markerRef.current = L.circleMarker([point.lat, point.lng], MARKER).addTo(map);
        onChangeRef.current(point);
      });
      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    if (markerRef.current) markerRef.current.setLatLng([value.lat, value.lng]);
    else {
      void import("leaflet").then((leaflet) => {
        if (mapRef.current !== map) return;
        markerRef.current = leaflet.default.circleMarker([value.lat, value.lng], MARKER).addTo(map);
      });
    }
  }, [value]);

  return (
    <div
      ref={ref}
      className="map map-picker"
      role="application"
      aria-label="Map. Click to set where the event takes place."
    />
  );
}
