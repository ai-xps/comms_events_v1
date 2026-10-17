import { scrapeUrlAllowed } from "./allowlist";
import { inferCategory, TYPE_REVIEW_NOTE } from "./categorise";
import { parseIcsEvents } from "./ics";
import { eventsFromJsonLd, extractJsonLdScripts } from "./jsonld";
import type { ScrapedEvent } from "./types";

export const SCRAPE_USER_AGENT = "GatherBirmingham/1.0 (community-events; +https://commseventsv1-production.up.railway.app)";
const FETCH_MS = 8000;
const GAP_MS = 1000;

export type SourceResult = {
  url: string;
  ok: boolean;
  eventCount: number;
  error?: string;
};

export type LiveHarvest = {
  events: ScrapedEvent[];
  sources: SourceResult[];
};

export type FetchLike = (input: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<{
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pathDisallowed(robots: string, path: string): boolean {
  const lines = robots.split(/\r?\n/).map((l) => l.trim());
  let inStar = false;
  const disallows: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      inStar = value === "*";
      continue;
    }
    if (inStar && key === "disallow" && value) disallows.push(value);
  }
  return disallows.some((rule) => {
    if (rule === "/") return true;
    return path === rule || path.startsWith(rule);
  });
}

async function timedFetch(fetchFn: FetchLike, url: string): Promise<{ ok: boolean; status: number; contentType: string; body: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_MS);
  try {
    const response = await fetchFn(url, {
      headers: { "User-Agent": SCRAPE_USER_AGENT, Accept: "text/calendar, application/ld+json, application/json, text/html;q=0.5" },
      signal: ctrl.signal
    });
    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type") ?? "",
      body
    };
  } finally {
    clearTimeout(timer);
  }
}

function decorate(events: ScrapedEvent[], pageUrl: string): ScrapedEvent[] {
  let host = "";
  try {
    host = new URL(pageUrl).hostname;
  } catch {
    host = "";
  }
  return events.map((event) => {
    const inferred = inferCategory({
      host,
      title: event.title,
      organisationName: event.organisationName
    });
    const notes = inferred.inferred
      ? event.notes
      : [TYPE_REVIEW_NOTE, event.notes].filter(Boolean).join("\n\n");
    return { ...event, category: inferred.category, notes };
  });
}

function parseBody(url: string, contentType: string, body: string): ScrapedEvent[] {
  const lower = contentType.toLowerCase();
  const path = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();
  if (lower.includes("text/calendar") || path.endsWith(".ics") || body.includes("BEGIN:VEVENT")) {
    return parseIcsEvents(body, url);
  }
  if (lower.includes("ld+json") || lower.includes("application/json")) {
    try {
      return eventsFromJsonLd(JSON.parse(body), url);
    } catch {
      return [];
    }
  }
  const fromScripts = extractJsonLdScripts(body).flatMap((block) => eventsFromJsonLd(block, url));
  if (fromScripts.length) return fromScripts;
  return [];
}

/**
 * Fetches admin Priority URLs only. One URL failing does not fail the harvest.
 * Set SCRAPE_LIVE=0 to skip the network (fixtures still run).
 */
export async function fetchLiveEvents(
  urls: string[],
  opts: { fetchFn?: FetchLike; pauseMs?: number } = {}
): Promise<LiveHarvest> {
  if (urls.length === 0 || process.env.SCRAPE_LIVE === "0") {
    return { events: [], sources: [] };
  }
  const fetchFn = opts.fetchFn ?? (globalThis.fetch as FetchLike);
  const pause = opts.pauseMs ?? GAP_MS;
  const robotsCache = new Map<string, string | null>();
  const sources: SourceResult[] = [];
  const events: ScrapedEvent[] = [];

  for (const raw of urls) {
    const allowed = scrapeUrlAllowed(raw);
    if (!allowed.ok) {
      sources.push({ url: raw, ok: false, eventCount: 0, error: allowed.reason });
      continue;
    }
    const { url } = allowed;
    try {
      const origin = url.origin;
      if (!robotsCache.has(origin)) {
        try {
          const robots = await timedFetch(fetchFn, `${origin}/robots.txt`);
          robotsCache.set(origin, robots.ok ? robots.body : "");
        } catch {
          robotsCache.set(origin, null);
        }
        if (pause) await sleep(pause);
      }
      const robots = robotsCache.get(origin);
      if (robots == null) {
        sources.push({ url: raw, ok: false, eventCount: 0, error: "Could not read robots.txt." });
        continue;
      }
      if (robots && pathDisallowed(robots, url.pathname)) {
        sources.push({ url: raw, ok: false, eventCount: 0, error: "robots.txt disallows this path." });
        continue;
      }
      const page = await timedFetch(fetchFn, url.toString());
      if (!page.ok) {
        sources.push({ url: raw, ok: false, eventCount: 0, error: `HTTP ${page.status}` });
      } else {
        const parsed = decorate(parseBody(url.toString(), page.contentType, page.body), url.toString());
        events.push(...parsed);
        sources.push({
          url: raw,
          ok: true,
          eventCount: parsed.length,
          error: parsed.length ? undefined : "No calendar events in this response."
        });
      }
    } catch (error) {
      const aborted = error instanceof Error && error.name === "AbortError";
      sources.push({
        url: raw,
        ok: false,
        eventCount: 0,
        error: aborted ? "Timed out." : "Could not fetch this URL."
      });
    }
    if (pause) await sleep(pause);
  }

  return { events, sources };
}
