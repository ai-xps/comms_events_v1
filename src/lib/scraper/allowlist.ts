import { isHttpUrl } from "../security";

/**
 * Hosts an admin may point Priority URLs at. Anything else is recorded as an error and not fetched.
 * HTTPS calendar files ending in .ics are also allowed, because the admin still has to paste the URL.
 */
export const ALLOWED_HOSTS = new Set([
  "birminghamcathedral.com",
  "www.birminghamcathedral.com",
  "carrslane.co.uk",
  "www.carrslane.co.uk",
  "meetup.com",
  "www.meetup.com",
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

export function scrapeUrlAllowed(value: string): { ok: true; url: URL } | { ok: false; reason: string } {
  if (!isHttpUrl(value)) return { ok: false, reason: "URL must start with http:// or https://." };
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: "URL is not valid." };
  }
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    return { ok: false, reason: "Live fetch is https only." };
  }
  const icsPath = url.pathname.toLowerCase().endsWith(".ics");
  if (ALLOWED_HOSTS.has(url.hostname.toLowerCase()) || icsPath) return { ok: true, url };
  return { ok: false, reason: "Host is not on the Gather allowlist." };
}
