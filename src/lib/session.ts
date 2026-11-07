import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_HOURS, type Role } from "./constants";

export type SessionUser = {
  id: string;
  name: string;
  cellNumber: string;
  role: Role;
  cellId: string | null;
};

/**
 * What the signed cookie carries. `sv` must match User.sessionVersion, so bumping that number
 * (logout, password reset, deactivation) revokes every cookie issued before it.
 */
export type SessionClaims = SessionUser & { sv: number };

type Payload = SessionClaims & { exp: number };

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function encodeSession(claims: SessionClaims, now = Date.now()): string {
  const payload: Payload = {
    ...claims,
    exp: now + SESSION_HOURS * 60 * 60 * 1000
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string, now = Date.now()): SessionClaims | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    if (payload.exp < now) return null;
    if (!payload.id || !payload.role) return null;
    return {
      id: payload.id,
      name: payload.name,
      cellNumber: payload.cellNumber,
      role: payload.role,
      cellId: payload.cellId,
      sv: typeof payload.sv === "number" ? payload.sv : 0
    };
  } catch {
    return null;
  }
}

export async function readSession(): Promise<SessionClaims | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

/** Secure cookies only when APP_ORIGIN is https (so HTTP IP demos can stay signed in). */
function cookieSecure(): boolean {
  const origin = process.env.APP_ORIGIN;
  if (origin) return origin.startsWith("https://");
  return process.env.NODE_ENV === "production";
}

export async function writeSession(claims: SessionClaims) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(claims), {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
