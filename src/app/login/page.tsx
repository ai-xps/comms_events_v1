"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBanner } from "@/components/StatusBanner";
import { safeNextPath } from "@/lib/security";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="login-shell" aria-busy="true" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

  return (
    <main className="login-shell">
      <div className="login-card card">
        <p className="wordmark">Gather</p>
        <h1>Birmingham community events</h1>
        <p className="lede">Sign in with the cell number and password your cell leader gave you.</p>
        <StatusBanner message={error} kind="error" />
        <form className="stack" onSubmit={onSubmit}>
          <label>
            Cell number
            <input name="cellNumber" autoComplete="username" required inputMode="numeric" />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
