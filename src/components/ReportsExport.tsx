"use client";

import { FormEvent, useState } from "react";
import { StatusBanner } from "./StatusBanner";

export function ReportsExport({ defaultFrom, defaultTo }: { defaultFrom: string; defaultTo: string }) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [message, setMessage] = useState<string | null>(null);

  async function download(e: FormEvent, format: "csv" | "xlsx") {
    e.preventDefault();
    setMessage(null);
    try {
      const response = await fetch("/api/export/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, format })
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setMessage(data.error ?? "Could not export.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "xlsx" ? "gather-events.xlsx" : "gather-events.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Could not reach Gather. Check your connection and try again.");
    }
  }

  return (
    <form className="card stack reports-range" onSubmit={(e) => download(e, "csv")}>
      <h2>Events in a date range</h2>
      <p className="muted">
        Download event/attendee files here. Charts and insight datasets live under Insights.
        Attendee lists for a single event are in the table below.
      </p>
      <StatusBanner message={message} kind="error" />
      <div className="row">
        <label>
          From
          <input type="date" name="from" required value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" name="to" required value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>
      <div className="row">
        <button type="submit">Download CSV</button>
        <button className="secondary" type="button" onClick={(e) => download(e, "xlsx")}>
          Download Excel
        </button>
      </div>
    </form>
  );
}
