"use client";

import { useEffect, useRef } from "react";

const MARKER = {
  radius: 8,
  color: "#8b3a24",
  weight: 2,
  fillColor: "#8b3a24",
  fillOpacity: 0.85
};

export function EventMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: { remove: () => void } | null = null;
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !ref.current) return;
      const L = leaflet.default;
      map = L.map(ref.current).setView([lat, lng], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map as never);
      L.circleMarker([lat, lng], MARKER)
        .addTo(map as never)
        .bindPopup(title);
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, title]);

  return <div ref={ref} className="map" role="img" aria-label={`Map of ${title}`} />;
}
