"use client";

import { useEffect, useRef } from "react";
import { MARKER_STYLE, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map";

export function EventMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    (async () => {
      const leaflet = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      map = leaflet.map(ref.current).setView([lat, lng], 14);
      leaflet.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION }).addTo(map);
      leaflet.circleMarker([lat, lng], MARKER_STYLE).addTo(map).bindPopup(title);
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, title]);

  return <div ref={ref} className="map" role="img" aria-label={`Map of ${title}`} />;
}
