"use client";

import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { BIRMINGHAM, MARKER_STYLE, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map";

type Pin = { id: string; title: string; lat: number; lng: number };

export function EventsMap({ pins }: { pins: Pin[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const pinKey = pins.map((p) => `${p.id}:${p.lat}:${p.lng}`).join("|");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(ref.current).setView(BIRMINGHAM, 12);
      leaflet.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION }).addTo(map);
      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);
      drawPins(leaflet, map, layerRef.current, pinsRef.current);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (leafletRef.current && mapRef.current && layerRef.current) {
      drawPins(leafletRef.current, mapRef.current, layerRef.current, pinsRef.current);
    }
  }, [pinKey]);

  return (
    <>
      <div ref={ref} className="map" role="img" aria-label={`Map of ${pins.length} events with a place`} />
      {pins.length === 0 ? <p className="map-empty muted">No events with a location in this view.</p> : null}
    </>
  );
}

function drawPins(leaflet: typeof import("leaflet"), map: LeafletMap, layer: LayerGroup, pins: Pin[]) {
  layer.clearLayers();
  for (const pin of pins) {
    leaflet.circleMarker([pin.lat, pin.lng], MARKER_STYLE).bindPopup(pin.title).addTo(layer);
  }
  if (pins.length === 1) map.setView([pins[0].lat, pins[0].lng], 14);
  else if (pins.length > 1) map.fitBounds(leaflet.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [24, 24] });
  else map.setView(BIRMINGHAM, 12);
}
