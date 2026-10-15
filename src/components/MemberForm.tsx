"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBanner } from "./StatusBanner";

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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const response = await fetch(member ? `/api/users/${member.id}` : "/api/users", {
      method: member ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error);
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
        <input name="name" required defaultValue={member?.name} />
      </label>
      <label>
        Cell number
        <input name="cellNumber" required defaultValue={member?.cellNumber} />
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
        <input name="password" type="password" minLength={member ? 0 : 8} required={!member} />
      </label>
      {member ? (
        <label>
          <input type="checkbox" name="active" defaultChecked={member.active} /> Active
        </label>
      ) : null}
      <button type="submit">Save</button>
    </form>
  );
}
