"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Role } from "@/lib/constants";

const ITEMS: { href: string; label: string; roles: Role[] }[] = [
  { href: "/calendar", label: "Calendar", roles: ["admin", "cell leader", "member"] },
  { href: "/bookings", label: "My bookings", roles: ["admin", "cell leader", "member"] },
  { href: "/pending", label: "Pending review", roles: ["admin", "cell leader"] },
  { href: "/members", label: "Members", roles: ["admin", "cell leader"] },
  { href: "/reports", label: "Reports", roles: ["admin", "cell leader"] },
  { href: "/import", label: "Import", roles: ["admin"] },
  { href: "/scraper", label: "Scraper settings", roles: ["admin"] },
  { href: "/audit", label: "Audit", roles: ["admin"] }
];

export function Nav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const links = ITEMS.filter((item) => item.roles.includes(role));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="nav-wrap">
      <button
        ref={buttonRef}
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        Menu
      </button>
      <div className="nav-panel" data-open={open ? "true" : "false"}>
        {open ? (
          <button
            type="button"
            className="nav-backdrop"
            aria-label="Close menu"
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}
          />
        ) : null}
        <nav id={menuId} className="nav" aria-label="Main">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
