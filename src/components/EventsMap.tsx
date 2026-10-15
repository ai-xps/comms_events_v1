"use client";

import { useEffect, useRef } from "react";

type Pin = { id: string; title: string; lat: number; lng: number };

const MARKER = {
  radius: 8,
  color: "#8b3a24",
  weight: 2,
  fillColor: "#8b3a24",
  fillOpacity: 0.85
};

export function EventsMap({ pins }: { pins: Pin[] }) {
  const ref = useRef<HTMLDivElement>(null);
  if (pins.length === 0) {
    return <p className="map-empty muted">No mapped events in this view.</p>;
  }
  return <MapCanvas pins={pins} mapRef={ref} />;
}

function MapCanvas({
  pins,
  mapRef
}: {
  pins: Pin[];
  mapRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    let map: { remove: () => void } | null = null;
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !mapRef.current) return;
      const L = leaflet.default;
      map = L.map(mapRef.current).setView([pins[0].lat, pins[0].lng], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map as never);
      pins.forEach((pin) => {
        L.circleMarker([pin.lat, pin.lng], MARKER)
          .addTo(map as never)
          .bindPopup(pin.title);
      });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [pins, mapRef]);
  return <div ref={mapRef} className="map" role="img" aria-label="Map of published events with a place" />;
}
