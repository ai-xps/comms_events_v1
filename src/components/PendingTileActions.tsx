"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestJson } from "@/lib/fetch-json";
import { DISCARD_EVENT_CONFIRM_BODY } from "@/lib/pending-copy";
import { useConfirm } from "./ConfirmDialog";

export function PendingTileActions({ eventId, title }: { eventId: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [dialog, confirm] = useConfirm();

  async function patch(status: "PUBLISHED" | "DISCARDED") {
    if (status === "DISCARDED") {
      const ok = await confirm({
        title: `Discard ${title}?`,
        body: DISCARD_EVENT_CONFIRM_BODY,
        confirmLabel: "Discard",
        destructive: true
      });
      if (!ok) return;
    }
    setBusy(true);
    const result = await requestJson(`/api/events/${eventId}`, {
      method: "PATCH",
      body: { status }
    });
    setBusy(false);
    if (!result.ok) return;
    router.refresh();
  }

  return (
    <div className="pending-tile-actions">
      <button
        type="button"
        className="secondary"
        disabled={busy}
        data-testid="pending-approve"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void patch("PUBLISHED");
        }}
      >
        Approve
      </button>
      <button
        type="button"
        className="ghost"
        disabled={busy}
        data-testid="pending-discard"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void patch("DISCARDED");
        }}
      >
        Discard
      </button>
      {dialog}
    </div>
  );
}
