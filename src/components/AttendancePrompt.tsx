"use client";

import { useEffect, useRef, useState } from "react";
import { requestJson } from "@/lib/fetch-json";
import { StatusBanner } from "./StatusBanner";

type Item = { id: string; title: string; when: string };

export function AttendancePrompt() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    lastFocus.current?.focus();
  }

  useEffect(() => {
    fetch("/api/attendance/pending")
      .then((r) => r.json())
      .then((data) => {
        if (data.items?.length) {
          lastFocus.current = document.activeElement as HTMLElement;
          setItems(data.items);
          setOpen(true);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (open) first.current?.focus();
  }, [open, items]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, items]);

  if (!open || !items?.length) return null;

  async function mark(id: string, attendance: "ATTENDED" | "ABSENT") {
    const result = await requestJson("/api/attendance", { method: "POST", body: { bookingId: id, attendance } });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    const next = (items ?? []).filter((item) => item.id !== id);
    setItems(next);
    if (next.length === 0) close();
  }

  return (
    <div className="dialog" role="presentation">
      <div
        ref={panelRef}
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attend-title"
      >
        <h2 id="attend-title">Did you go?</h2>
        <p className="muted">These events have finished. Confirming helps your cell leader keep records.</p>
        <StatusBanner message={error} kind="error" />
        <div className="stack">
          {items.map((item, index) => (
            <div key={item.id}>
              <strong>{item.title}</strong>
              <p className="muted">{item.when}</p>
              <div className="dialog-actions">
                <button
                  ref={index === 0 ? first : undefined}
                  type="button"
                  onClick={() => mark(item.id, "ATTENDED")}
                >
                  Attended
                </button>
                <button className="secondary" type="button" onClick={() => mark(item.id, "ABSENT")}>
                  Didn’t attend
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="dialog-dismiss">
          <button className="ghost" type="button" onClick={close}>
            Ask me next time
          </button>
        </p>
      </div>
    </div>
  );
}
