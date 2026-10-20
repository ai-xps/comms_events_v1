"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type Category, type MemberAttendeeView } from "@/lib/constants";
import { droppedPriorityUrlMessage } from "@/lib/scraper/priority-copy";
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
  notice
}: {
  settings: Settings;
  organisations: { id: string; name: string; status: string }[];
  notice?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(notice ?? null);
  const [kind, setKind] = useState<"info" | "error">("info");
  const [running, setRunning] = useState(false);

  function show(result: JsonResult, success: string) {
    setKind(result.ok ? "info" : "error");
    setMessage(result.ok ? success : result.error);
    if (result.ok) router.refresh();
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await requestJson<{ dropped?: { url: string; reason: string }[] }>("/api/settings", {
      method: "POST",
      body: {
        locationLabel: form.get("locationLabel"),
        memberAttendeeView: form.get("memberAttendeeView"),
        enabled: Object.fromEntries(CATEGORIES.map((c) => [c, form.get(`enabled-${c}`) === "on"])),
        colours: Object.fromEntries(CATEGORIES.map((c) => [c, form.get(`colour-${c}`)])),
        priorityUrls: String(form.get("priorityUrls") ?? "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      }
    });
    const skipped = result.ok ? droppedPriorityUrlMessage(result.data.dropped ?? []) : null;
    show(result, skipped ? `Settings saved. ${skipped}` : "Settings saved.");
  }

  async function runNow() {
    if (running) return;
    setRunning(true);
    setKind("info");
    setMessage("Scraper running… this can take up to a minute.");
    const result = await requestJson<{
      createdCount?: number;
      updatedCount?: number;
      publishedCount?: number;
      discardedByRule?: number;
      leftPending?: number;
      skippedHumanEdited?: number;
    }>("/api/scraper/run", {
      method: "POST"
    });
    setRunning(false);
    show(
      result,
      result.ok
        ? `Run finished: created ${result.data.createdCount ?? 0}, updated ${result.data.updatedCount ?? 0}, published ${result.data.publishedCount ?? 0}, discarded ${result.data.discardedByRule ?? 0}, pending ${result.data.leftPending ?? 0}, skipped human-edited ${result.data.skippedHumanEdited ?? 0}.`
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
          Priority URLs (https ICS or JSON-LD on the allowlist; one per line. Leave empty for the demo harvest only.)
          <textarea
            name="priorityUrls"
            defaultValue={settings.priorityUrls.join("\n")}
            placeholder="https://birminghamcathedral.com/calendar.ics"
          />
          <span className="muted">Meetup search pages and any host not on the allowlist are dropped, not saved.</span>
        </label>
        <div className="row">
          <button type="submit" disabled={running}>
            Save settings
          </button>
          <button className="secondary" type="button" onClick={runNow} disabled={running}>
            {running ? "Running…" : "Run now"}
          </button>
        </div>
        <p className="muted">
          After a run, review <a href="/pending">pending events</a>. A failed feed does not stop the others.
        </p>
      </form>
      <section className="card">
        <h2>Organisations</h2>
        <div className="table-wrap" style={{ border: 0, boxShadow: "none", borderRadius: 0 }}>
          <table className="data stack-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rule</th>
              </tr>
            </thead>
            <tbody>
              {organisations.map((org) => (
                <tr key={org.id}>
                  <td data-label="Name">{org.name}</td>
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
      </section>
    </div>
  );
}
