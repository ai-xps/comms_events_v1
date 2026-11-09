"use client";

import { useState } from "react";
import { requestJson } from "@/lib/fetch-json";
import { StatusBanner } from "@/components/StatusBanner";
import { DATASETS, EXPORT_FORMATS, type Dataset, type ExportFormat, type InsightsData } from "@/lib/insights/types";
import { shareTargets } from "@/lib/insights/share";

const DATASET_LABEL: Record<Dataset, string> = {
  summary: "Summary",
  weekly: "Weekly trend",
  byType: "By event type",
  byCell: "By cell",
  perEvent: "Per-event attendance",
  attendees: "Attendee list (names, your scope)",
  everything: "Everything"
};

export function ExportShare({
  text,
  query
}: {
  data: InsightsData;
  text: string;
  query: Record<string, string>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"info" | "error">("info");
  const [dataset, setDataset] = useState<Dataset>("summary");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const targets = shareTargets(text);

  async function logShare(channel: string) {
    await requestJson("/api/insights/share-log", { method: "POST", body: { channel } });
  }

  async function onExport() {
    setMessage(null);
    const result = await requestJson<{ filename?: string; body?: string; type?: string }>(
      "/api/insights/export",
      { method: "POST", body: { dataset, format, ...query } }
    );
    if (!result.ok) {
      setKind("error");
      setMessage(result.error);
      return;
    }
    const binary = result.data.body;
    if (!binary) {
      setKind("error");
      setMessage("The file was empty.");
      return;
    }
    const bytes = Uint8Array.from(atob(binary), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: result.data.type ?? "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.data.filename ?? "gather-insights";
    a.click();
    URL.revokeObjectURL(url);
    setKind("info");
    setMessage("Download started.");
  }

  async function onShare(id: string, href?: string) {
    await logShare(id);
    if (id === "copy") {
      try {
        await navigator.clipboard.writeText(text);
        setKind("info");
        setMessage("Copied. Paste it into the app you want.");
      } catch {
        setKind("error");
        setMessage("Could not copy. Select the text from Email instead.");
      }
      return;
    }
    if (id === "device" && navigator.share) {
      try {
        await navigator.share({ text, title: "Gather insights" });
      } catch {
        /* user cancelled */
      }
      return;
    }
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="card stack">
      <h2>Take this with you</h2>
      <StatusBanner message={message} kind={kind} />
      <div className="insights-toolbar">
        <label>
          Dataset
          <select value={dataset} onChange={(e) => setDataset(e.target.value as Dataset)}>
            {DATASETS.map((d) => (
              <option key={d} value={d}>
                {DATASET_LABEL[d]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
            {EXPORT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={onExport}>
          Download
        </button>
      </div>
      <p className="muted">Share a short summary (totals only, no names) through your own app.</p>
      <div className="filters" role="group" aria-label="Share">
        {targets.map((t) =>
          t.id === "device" && typeof navigator !== "undefined" && !navigator.share ? null : (
            <button key={t.id} type="button" className="chip" onClick={() => onShare(t.id, t.href)}>
              {t.label}
            </button>
          )
        )}
      </div>
    </section>
  );
}
