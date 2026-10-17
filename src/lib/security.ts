/**
 * Only same-site paths may be used as a post-login destination. Anything else (absolute URLs,
 * protocol-relative "//host", backslash tricks) falls back, so a crafted login link cannot
 * send a member to a lookalike site straight after they sign in.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/calendar"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || /[\u0000-\u001f]/.test(value)) return fallback;
  if (value.startsWith("/login")) return fallback;
  return value;
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isHexColour(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

/** Returns a plain-English problem with event input, or null when it is acceptable. */
export function eventInputProblem(input: {
  title: string;
  notes: string;
  externalUrl: string;
  capacity: number | null;
  startsAt: Date;
  endsAt: Date;
}): string | null {
  if (input.title.length > LIMITS.titleLength) return `Title must be ${LIMITS.titleLength} characters or fewer.`;
  if (input.notes.length > LIMITS.textLength) return `Notes must be ${LIMITS.textLength} characters or fewer.`;
  if (input.externalUrl && !isHttpUrl(input.externalUrl)) return "Event Link must start with http:// or https://.";
  if (input.capacity !== null && (!Number.isInteger(input.capacity) || input.capacity < 0)) {
    return "Capacity must be a whole number, 0 or more.";
  }
  if (Number.isNaN(input.startsAt.getTime()) || Number.isNaN(input.endsAt.getTime())) return "Enter a start and end time.";
  if (input.endsAt <= input.startsAt) return "The event must end after it starts.";
  return null;
}

export const LIMITS = {
  importBytes: 2 * 1024 * 1024,
  importRows: 2000,
  titleLength: 200,
  textLength: 5000,
  passwordMax: 128
} as const;
