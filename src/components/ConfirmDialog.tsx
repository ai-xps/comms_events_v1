"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ConfirmOptions = {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
};

/**
 * Native <dialog> gives a focus trap, Escape to close and inert background for free.
 * Focus starts on Cancel so a stray Enter never confirms a destructive action.
 */
export function ConfirmDialog({
  options,
  onResult
}: {
  options: ConfirmOptions | null;
  onResult: (confirmed: boolean) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (options && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!options && dialog.open) {
      dialog.close();
    }
  }, [options]);

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      aria-describedby={options?.body ? "confirm-body" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onResult(false);
      }}
    >
      {options ? (
        <>
          <h2 id="confirm-title">{options.title}</h2>
          {options.body ? (
            <p id="confirm-body" className="muted">
              {options.body}
            </p>
          ) : null}
          <div className="dialog-actions">
            <button ref={cancelRef} className="secondary" type="button" onClick={() => onResult(false)}>
              {options.cancelLabel ?? "Cancel"}
            </button>
            <button
              type="button"
              className={options.destructive ? "danger" : undefined}
              onClick={() => onResult(true)}
            >
              {options.confirmLabel}
            </button>
          </div>
        </>
      ) : null}
    </dialog>
  );
}

/** const [dialog, confirm] = useConfirm(); if (await confirm({...})) { ... } */
export function useConfirm(): [React.ReactNode, (options: ConfirmOptions) => Promise<boolean>] {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    resolver.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const onResult = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setOptions(null);
  }, []);

  return [<ConfirmDialog key="confirm" options={options} onResult={onResult} />, confirm];
}
