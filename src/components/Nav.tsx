"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Role } from "@/lib/constants";
import { MEMBER_TABS } from "@/lib/nav-tabs";

const MENU_ITEMS: { href: string; label: string; title?: string; roles: Role[] }[] = [
  { href: "/pending", label: "Pending", title: "Pending review", roles: ["admin", "cell leader"] },
  { href: "/members", label: "Members", roles: ["admin", "cell leader"] },
  { href: "/insights", label: "Insights", roles: ["admin", "cell leader"] },
  { href: "/reports", label: "Reports", roles: ["admin", "cell leader"] },
  { href: "/import", label: "Import", roles: ["admin"] },
  { href: "/scraper", label: "Scraper", title: "Scraper settings", roles: ["admin"] },
  { href: "/audit", label: "Audit", roles: ["admin"] }
];

export function Nav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuLinks = MENU_ITEMS.filter((item) => item.roles.includes(role));

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

  function closeMenu() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <>
      <div className="nav-wrap nav-wrap-desktop">
        <nav className="nav" aria-label="Main">
          {MEMBER_TABS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.match(pathname) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          {menuLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.title ?? item.label}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {menuLinks.length > 0 ? (
        <div className="nav-wrap nav-wrap-menu">
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
                onClick={closeMenu}
              />
            ) : null}
            <nav id={menuId} className="nav nav-menu-only" aria-label="Leader and admin">
              {menuLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.title ?? item.label}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
