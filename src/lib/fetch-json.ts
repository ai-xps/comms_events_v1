export type JsonResult<T = Record<string, unknown>> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string };

const OFFLINE = "Could not reach Gather. Check your connection and try again.";

/**
 * fetch + JSON for client components. Never throws: network failures, non-JSON replies and
 * error statuses all come back as { ok: false, error } with a sentence that can be shown as is.
 */
export async function requestJson<T = Record<string, unknown>>(
  url: string,
  init: { method?: string; body?: unknown } = {}
): Promise<JsonResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: init.method ?? "GET",
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body)
    });
  } catch {
    return { ok: false, status: 0, error: OFFLINE };
  }
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) {
    if (response.status === 401) return { ok: false, status: 401, error: "Your session has ended. Please sign in again." };
    return { ok: false, status: response.status, error: data?.error ?? "Something went wrong. Please try again." };
  }
  return { ok: true, status: response.status, data: (data ?? {}) as T };
}
