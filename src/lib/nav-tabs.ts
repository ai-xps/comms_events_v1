/** Member places shown in the phone tab bar and the wide top nav. */
export const MEMBER_TABS: { href: string; label: string; match: (path: string) => boolean }[] = [
  { href: "/", label: "Home", match: (p) => p === "/" },
  { href: "/search", label: "Search", match: (p) => p.startsWith("/search") },
  { href: "/calendar", label: "Calendar", match: (p) => p.startsWith("/calendar") },
  { href: "/bookings", label: "Bookings", match: (p) => p.startsWith("/bookings") }
];
