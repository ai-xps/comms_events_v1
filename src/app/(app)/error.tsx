"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <div className="page-head">
        <h1>Something went wrong</h1>
        <p className="lede">This page could not load. Try again, or go back to the calendar.</p>
      </div>
      <div className="card stack">
        {error.digest ? <p className="muted">Reference: {error.digest}</p> : null}
        <div className="row">
          <button type="button" onClick={reset}>
            Try again
          </button>
          <Link className="button secondary" href="/calendar">
            Back to the calendar
          </Link>
        </div>
      </div>
    </main>
  );
}
