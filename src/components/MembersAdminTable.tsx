"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { requestJson } from "@/lib/fetch-json";
import { StatusBanner } from "./StatusBanner";

export type MemberRow = {
  id: string;
  name: string;
  cellNumber: string;
  cellName: string;
  role: string;
};

export function MembersAdminTable({
  members,
  selfId
}: {
  members: MemberRow[];
  selfId: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"info" | "error">("info");

  const selectableIds = useMemo(
    () => members.filter((m) => m.id !== selfId).map((m) => m.id),
    [members, selfId]
  );
  const allSelectableChecked =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  function toggleOne(id: string, on: boolean) {
    if (id === selfId) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(on: boolean) {
    setSelected(() => (on ? new Set(selectableIds) : new Set()));
  }

  async function deleteSelected() {
    const ids = [...selected].filter((id) => id !== selfId);
    if (ids.length === 0) {
      setKind("error");
      setMessage("Select at least one person to delete. You cannot delete your own account.");
      return;
    }
    const typed = window.prompt(
      `Type DELETE to permanently remove ${ids.length} people. Their Attend bookings and stars are removed.`
    );
    if (typed !== "DELETE") return;

    const names = members.filter((m) => ids.includes(m.id)).map((m) => m.name);
    const preview = names.slice(0, 8).join(", ") + (names.length > 8 ? ` and ${names.length - 8} more` : "");
    const ok = window.confirm(
      `Delete ${ids.length} people forever?\n\n${preview}\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setBusy(true);
    setMessage(null);
    const result = await requestJson<{ deleted?: number; skippedSelf?: boolean }>(
      "/api/users/batch-delete",
      { method: "POST", body: { ids } }
    );
    setBusy(false);
    if (!result.ok) {
      setKind("error");
      setMessage(result.error);
      return;
    }
    setSelected(new Set());
    setKind("info");
    setMessage(
      `Deleted ${result.data.deleted ?? ids.length} people.` +
        (result.data.skippedSelf ? " Your own account was left alone." : "")
    );
    router.refresh();
  }

  return (
    <>
      <div className="row" style={{ gap: "0.75rem", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
        <Link className="button" href="/members/new">
          Add person
        </Link>
        <button
          type="button"
          className="danger"
          disabled={busy || selected.size === 0}
          data-testid="members-delete-selected"
          onClick={() => void deleteSelected()}
        >
          {busy ? "Deleting…" : `Delete selected${selected.size ? ` (${selected.size})` : ""}`}
        </button>
      </div>
      <StatusBanner message={message} kind={kind} />
      <div className="table-wrap">
        <table className="data stack-sm">
          <thead>
            <tr>
              <th className="members-check-col">
                <input
                  type="checkbox"
                  aria-label="Select all on this page"
                  checked={allSelectableChecked}
                  disabled={busy || selectableIds.length === 0}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th>Name</th>
              <th>Cell number</th>
              <th>Cell</th>
              <th>Permission</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isSelf = m.id === selfId;
              return (
                <tr key={m.id}>
                  <td data-label="Select" className="members-check-col">
                    <input
                      type="checkbox"
                      aria-label={`Select ${m.name}`}
                      checked={selected.has(m.id)}
                      disabled={busy || isSelf}
                      title={isSelf ? "You cannot delete your own account" : undefined}
                      onChange={(e) => toggleOne(m.id, e.target.checked)}
                    />
                  </td>
                  <td data-label="Name">
                    {m.name}
                    {isSelf ? <span className="muted"> (you)</span> : null}
                  </td>
                  <td data-label="Cell number">{m.cellNumber}</td>
                  <td data-label="Cell">{m.cellName}</td>
                  <td data-label="Permission">{m.role}</td>
                  <td data-label="Actions">
                    <Link href={`/members/${m.id}/edit`}>Edit</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
