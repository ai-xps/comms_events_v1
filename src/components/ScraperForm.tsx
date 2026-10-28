"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type Category, type MemberAttendeeView } from "@/lib/constants";
import { STARTER_PRIORITY_URL } from "@/lib/scraper/allowlist";
import { droppedPriorityUrlMessage, runFinishedMessage } from "@/lib/scraper/priority-copy";
import { requestJson, type JsonResult } from "@/lib/fetch-json";
import { StatusBanner } from "./StatusBanner";

type Settings = {
  locationLabel: string;
  memberAttendeeView: MemberAttendeeView;
  enabled: Record<Category, boolean>;
  colours: Record<string, string>;
  priorityUrls: string[];
};

export function ScraperForm({
  settings,
  organisations,
  allowedHosts,
  notice
}: {
  settings: Settings;
  organisations: { id: string; name: string; status: string }[];
  allowedHosts: string[];
  notice?: string | null;
}) {
  const router = useRouter();
  const savedUrls = settings.priorityUrls.join("\n");
  const [priorityText, setPriorityText] = useState(savedUrls);
  const [message, setMessage] = useState<string | null>(notice ?? null);
  const [kind, setKind] = useState<"info" | "error">("info");
  const [running, setRunning] = useState(false);
  const [orgFilter, setOrgFilter] = useState<"ALL" | "WHITELIST" | "STANDARD" | "BLACKLIST">("ALL");
  const visibleOrgs =
    orgFilter === "ALL" ? organisations : organisations.filter((o) => o.status === orgFilter);

  useEffect(() => {
    setPriorityText(savedUrls);
  }, [savedUrls]);

  function show(result: JsonResult, success: string) {
    setKind(result.ok ? "info" : "error");
    setMessage(result.ok ? success : result.error);
    if (result.ok) router.refresh();
  }

  function settingsBody(form: FormData) {
    return {
      locationLabel: form.get("locationLabel"),
      memberAttendeeView: form.get("memberAttendeeView"),
      enabled: Object.fromEntries(CATEGORIES.map((c) => [c, form.get(`enabled-${c}`) === "on"])),
      colours: Object.fromEntries(CATEGORIES.map((c) => [c, form.get(`colour-${c}`)])),
      priorityUrls: priorityText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    };
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await requestJson<{ dropped?: { url: string; reason: string }[] }>("/api/settings", {
      method: "POST",
      body: settingsBody(new FormData(e.currentTarget))
    });
    const skipped = result.ok ? droppedPriorityUrlMessage(result.data.dropped ?? []) : null;
    show(result, skipped ? `Settings saved. ${skipped}` : "Settings saved. The priority list above is what will be fetched.");
  }

  async function runNow(form: HTMLFormElement) {
    if (running) return;
    setRunning(true);
    setKind("info");
    setMessage("Saving the priority list, then running the scraper…");
    const saved = await requestJson<{ dropped?: { url: string; reason: string }[] }>("/api/settings", {
      method: "POST",
      body: settingsBody(new FormData(form))
    });
    if (!saved.ok) {
      setRunning(false);
      show(saved, "");
      return;
    }
    const result = await requestJson<{
      createdCount?: number;
      updatedCount?: number;
      publishedCount?: number;
      discardedByRule?: number;
      leftPending?: number;
      skippedHumanEdited?: number;
      sources?: { url: string; ok: boolean; eventCount: number; error?: string }[];
    }>("/api/scraper/run", {
      method: "POST"
    });
    setRunning(false);
    show(
      result,
      result.ok
        ? runFinishedMessage({ ...result.data, dropped: saved.data.dropped ?? [] })
        : ""
    );
  }

  async function setOrg(id: string, status: string) {
    const result = await requestJson("/api/organisations", { method: "POST", body: { id, status } });
    show(result, "Organisation rule saved.");
  }

  return (
    <div className="stack">
      <StatusBanner message={message} kind={kind} />
      <form className="card stack" onSubmit={save}>
        <label>
          Location label
          <input name="locationLabel" defaultValue={settings.locationLabel} />
        </label>
        <label>
          What members see for attendees
          <select name="memberAttendeeView" defaultValue={settings.memberAttendeeView}>
            <option value="COUNT">Count only</option>
            <option value="COUNT_AND_INITIALS">Count and initials</option>
            <option value="COUNT_AND_NAME_CELL">Count and Name + Cell</option>
          </select>
          <span className="muted">Name + cell shows every member the name and cell number of everyone booked.</span>
        </label>
        <fieldset className="stack">
          <legend>Event types</legend>
          {CATEGORIES.map((c) => (
            <label key={c} className="row">
              <input type="checkbox" name={`enabled-${c}`} defaultChecked={settings.enabled[c]} />
              {c}
              <input type="color" name={`colour-${c}`} defaultValue={settings.colours[c]} aria-label={`${c} colour`} />
            </label>
          ))}
        </fieldset>
        <label>
          Priority URLs (https ICS or JSON-LD, one per line. Leave empty for the demo harvest only.)
          <textarea
            name="priorityUrls"
            value={priorityText}
            onChange={(e) => setPriorityText(e.target.value)}
            placeholder={STARTER_PRIORITY_URL}
          />
          <span className="muted">
            Run now saves this box first. An address is kept only when its host is one of: {allowedHosts.join(", ")}.
            Anything else is left out, and the run will not fetch it.
          </span>
        </label>
        <div className="row">
          <button type="submit" disabled={running}>
            Save settings
          </button>
          <button
            className="secondary"
            type="button"
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (form) void runNow(form);
            }}
            disabled={running}
          >
            {running ? "Running…" : "Run now"}
          </button>
        </div>
        <p className="muted">
          After a run, review <a href="/pending">pending events</a>. A failed feed does not stop the others.
        </p>
      </form>
      <section className="card">
        <h2>Organisations</h2>
        <p className="muted">Colour chips mark the rule. Filter to focus the list.</p>
        <div className="org-filter-row" role="group" aria-label="Filter organisations by rule">
          {(
            [
              ["ALL", "All"],
              ["WHITELIST", "Whitelist"],
              ["STANDARD", "Standard"],
              ["BLACKLIST", "Blacklist"]
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`chip org-chip org-${id.toLowerCase()}`}
              aria-pressed={orgFilter === id}
              data-on={orgFilter === id ? "true" : undefined}
              onClick={() => setOrgFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="table-wrap" style={{ border: 0, boxShadow: "none", borderRadius: 0 }}>
          <table className="data stack-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rule</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrgs.map((org) => (
                <tr key={org.id}>
                  <td data-label="Name">
                    <span className={`org-status-dot org-${org.status.toLowerCase()}`} aria-hidden="true" />
                    {org.name}
                  </td>
                  <td data-label="Rule">
                    <select
                      aria-label={`Organisation rule for ${org.name}`}
                      defaultValue={org.status}
                      onChange={(e) => setOrg(org.id, e.target.value)}
                    >
                      <option value="WHITELIST">Whitelist (auto-publish)</option>
                      <option value="STANDARD">Standard (pending)</option>
                      <option value="BLACKLIST">Blacklist (discard)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleOrgs.length === 0 ? <p className="muted">No organisations in this filter.</p> : null}
      </section>
    </div>
  );
}
