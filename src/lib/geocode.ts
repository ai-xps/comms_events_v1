export const GEOCODE_USER_AGENT = "GatherBirmingham/1.0 (community-events; +https://commseventsv1-production.up.railway.app)";
/** left, top, right, bottom covering Greater Birmingham. */
export const BIRMINGHAM_VIEWBOX = "-2.15,52.62,-1.70,52.38";

export type GeocodeHit = { lat: number; lng: number; label: string };

/** Maps Nominatim JSON to pins. Empty or broken payloads yield []. */
export function parseNominatimHits(payload: unknown): GeocodeHit[] {
  if (!Array.isArray(payload)) return [];
  const hits: GeocodeHit[] = [];
  for (const row of payload) {
    if (!row || typeof row !== "object") continue;
    const rec = row as { lat?: unknown; lon?: unknown; display_name?: unknown };
    const lat = Number(rec.lat);
    const lng = Number(rec.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const label = String(rec.display_name ?? "").trim();
    hits.push({ lat, lng, label: label.slice(0, 180) });
  }
  return hits;
}
