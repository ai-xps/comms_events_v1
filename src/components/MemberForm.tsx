"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { requestJson } from "@/lib/fetch-json";
import { StatusBanner } from "./StatusBanner";
import { useConfirm } from "./ConfirmDialog";

type Cell = { id: string; name: string };

export function MemberForm({
  cells,
  member
}: {
  cells: Cell[];
  member?: {
    id: string;
    name: string;
    cellNumber: string;
    role: string;
    cellId: string | null;
    active: boolean;
  };
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, confirm] = useConfirm();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(form.entries());
    const role = String(payload.role ?? "member");
    const cellId = String(payload.cellId ?? "");
    if (role !== "admin" && !cellId) {
      setMessage("Choose a cell for leaders and members.");
      return;
    }
    if (member) {
      const active = form.get("active") === "on";
      payload.active = active ? "on" : "off";
      if (member.active && !active) {
        const ok = await confirm({
          title: `Deactivate ${member.name}?`,
          body: "They will be signed out straight away and cannot sign in until reactivated. Their bookings stay in the records.",
          confirmLabel: "Deactivate",
          destructive: true
        });
        if (!ok) return;
      }
    }
    setBusy(true);
    setMessage(null);
    const result = await requestJson(member ? `/api/users/${member.id}` : "/api/users", {
      method: member ? "PATCH" : "POST",
      body: payload
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    router.push("/members");
    router.refresh();
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <StatusBanner message={message} kind="error" />
      <label>
        Name
        <input name="name" required maxLength={120} defaultValue={member?.name} />
      </label>
      <label>
        Cell number
        <input name="cellNumber" required inputMode="text" autoComplete="username" defaultValue={member?.cellNumber} />
      </label>
      <label>
        Cell
        <select name="cellId" defaultValue={member?.cellId ?? ""}>
          <option value="">Unassigned (admin only)</option>
          {cells.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Permission
        <select name="role" defaultValue={member?.role ?? "member"}>
          <option value="member">member</option>
          <option value="cell leader">cell leader</option>
          <option value="admin">admin</option>
        </select>
      </label>
      <label>
        Password {member ? "(leave blank to keep the current one)" : ""}
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required={!member}
        />
      </label>
      {member ? (
        <label>
          <input type="checkbox" name="active" defaultChecked={member.active} /> Active
        </label>
      ) : null}
      <div className="row">
        <button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button className="ghost" type="button" onClick={() => router.push("/members")}>
          Return
        </button>
      </div>
      {dialog}
    </form>
  );
}
