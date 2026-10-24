"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MEMBER_TABS } from "@/lib/nav-tabs";

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tab-bar" aria-label="Primary">
      {MEMBER_TABS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="tab-bar-link"
          aria-current={item.match(pathname) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
