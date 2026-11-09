"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBanner } from "@/components/StatusBanner";
import { safeNextPath } from "@/lib/security";

export function LoginForm({
  cellNumbers,
  embedded = false,
  autoFocus = false
}: {
  cellNumbers: string[];
  embedded?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <Suspense fallback={embedded ? <div aria-busy="true" /> : <main className="welcome-shell" aria-busy="true" />}>
      <LoginFields cellNumbers={cellNumbers} embedded={embedded} autoFocus={autoFocus} />
    </Suspense>
  );
}

function LoginFields({
  cellNumbers,
  embedded,
  autoFocus
}: {
  cellNumbers: string[];
  embedded: boolean;
  autoFocus: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!autoFocus || !embedded) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("sign-in")?.scrollIntoView({
      block: "start",
      behavior: reduce ? "auto" : "smooth"
    });
  }, [autoFocus, embedded]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cellNumber: form.get("cellNumber"),
          password: form.get("password")
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
    } catch {
      setError("Could not reach Gather. Check your connection and try again.");
      return;
    } finally {
      setPending(false);
    }
    router.push(safeNextPath(params.get("next")));
    router.refresh();
  }

  const form = (
    <>
      <StatusBanner message={error} kind="error" />
      <form className="stack" onSubmit={onSubmit}>
        <label>
          Cell number
          <select
            name="cellNumber"
            required
            defaultValue=""
            autoComplete="username"
            autoFocus={autoFocus}
          >
            <option value="" disabled>
              Choose your cell number
            </option>
            {cellNumbers.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <p className="muted login-hint">
          Your cell leader gave you these. If several people share a cell number, your password
          chooses which person you are.
        </p>
        <button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </>
  );

  if (embedded) {
    return <div className="login-fields">{form}</div>;
  }

  return (
    <main className="welcome-shell">
      <div className="welcome-card card login-card-solo">{form}</div>
    </main>
  );
}
