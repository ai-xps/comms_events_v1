"use client";

import { FormEvent, useState } from "react";
import { StatusBanner } from "@/components/StatusBanner";

export default function ImportPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"info" | "error">("info");
  const [errors, setErrors] = useState<{ row: number; reason: string }[]>([]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (file instanceof File && file.size > 2 * 1024 * 1024) {
      setKind("error");
      setMessage("That file is too large. The limit is 2 MB.");
      setErrors([]);
      return;
    }
    let json: { ok?: boolean; created?: number; error?: string; errors?: { row: number; reason: string }[] };
    try {
      const response = await fetch("/api/import", { method: "POST", body: data });
      json = await response.json().catch(() => ({ ok: false, error: "Import failed." }));
    } catch {
      setKind("error");
      setMessage("Could not reach Gather. Check your connection and try again.");
      return;
    }
    if (!json.ok) {
      setKind("error");
      setMessage("Nothing was imported. Fix the rows below and try again.");
      setErrors(json.errors ?? [{ row: 0, reason: json.error ?? "Import failed." }]);
      return;
    }
    setKind("info");
    setMessage(`Imported ${json.created} people.`);
    setErrors([]);
    form.reset();
  }

  return (
    <main>
      <div className="page-head">
        <h1>Import people</h1>
        <p className="lede">
          CSV, Excel, or JSON. Columns: Name, Cell number, Cell, Password, Permission. If any row fails, nobody is
          created.
        </p>
      </div>
      <form className="card stack" onSubmit={onSubmit}>
        <StatusBanner message={message} kind={kind} />
        <label>
          File
          <input type="file" name="file" accept=".csv,.xlsx,.xls,.json" required />
        </label>
        <button type="submit">Import</button>
      </form>
      {errors.length ? (
        <div className="table-wrap" style={{ marginTop: "var(--space-5)" }}>
          <table className="data stack-sm">
            <thead>
              <tr>
                <th>Row</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((err, i) => (
                <tr key={i}>
                  <td className="num" data-label="Row">
                    {err.row}
                  </td>
                  <td data-label="Reason">{err.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
