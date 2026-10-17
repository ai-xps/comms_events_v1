import { isHttpUrl } from "../security";

/**
 * Hosts an admin may point Priority URLs at. Anything else is recorded as an error and not fetched.
 * HTTPS calendar files must still be on this list — a `.ics` path is not a wildcard.
 */
export const ALLOWED_HOSTS = new Set([
  "birminghamcathedral.com",
  "www.birminghamcathedral.com",
  "carrslane.co.uk",
  "www.carrslane.co.uk",
  "birmingham.ac.uk",
  "www.birmingham.ac.uk",
  "bcu.ac.uk",
  "www.bcu.ac.uk",
  "bcusu.com",
  "www.bcusu.com",
  "iod.com",
  "www.iod.com",
  "greaterbirminghamchambers.com",
  "www.greaterbirminghamchambers.com",
  "birmingham.impacthub.net",
  "digbethdiningclub.com",
  "www.digbethdiningclub.com",
  "aston.ac.uk",
  "www.aston.ac.uk",
  "astonsu.com",
  "www.astonsu.com",
  "calendar.google.com",
  "outlook.office365.com",
  "cloud.churchsuite.com",
  "churchsuite.com"
]);

export const MAX_PRIORITY_URLS = 20;

function isLoopbackHost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost")
  );
}

function isPrivateOrLinkLocalIp(host: string): boolean {
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (v4) {
    const octets = v4.slice(1).map(Number);
    if (octets.some((n) => n > 255)) return false;
    const [a, b] = octets;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    return false;
  }
  if (host.includes(":")) {
    const h = host.toLowerCase();
    return h === "::1" || h === "::" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd");
  }
  return false;
}

export function scrapeUrlAllowed(
  value: string,
  env: string | undefined = process.env.NODE_ENV
): { ok: true; url: URL } | { ok: false; reason: string } {
  if (!isHttpUrl(value)) return { ok: false, reason: "URL must start with http:// or https://." };
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: "URL is not valid." };
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const loopback = isLoopbackHost(host);
  if (loopback) {
    if (env === "production") return { ok: false, reason: "Loopback hosts are not allowed." };
  } else if (isPrivateOrLinkLocalIp(host)) {
    return { ok: false, reason: "Private or link-local addresses are not allowed." };
  }
  if (url.protocol !== "https:") {
    if (!(loopback && env !== "production" && url.protocol === "http:")) {
      return { ok: false, reason: "Live fetch is https only." };
    }
  }
  if (loopback && env !== "production") return { ok: true, url };
  if (!ALLOWED_HOSTS.has(host)) return { ok: false, reason: "Host is not on the Gather allowlist." };
  return { ok: true, url };
}

export function parsePriorityUrls(values: unknown[]): {
  urls: string[];
  rejected: { url: string; reason: string }[];
} {
  const urls: string[] = [];
  const rejected: { url: string; reason: string }[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const url = String(value).trim();
    if (!url) continue;
    if (urls.length >= MAX_PRIORITY_URLS) {
      rejected.push({ url, reason: `No more than ${MAX_PRIORITY_URLS} Priority URLs.` });
      continue;
    }
    const allowed = scrapeUrlAllowed(url);
    if (!allowed.ok) {
      rejected.push({ url, reason: allowed.reason });
      continue;
    }
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return { urls, rejected };
}
