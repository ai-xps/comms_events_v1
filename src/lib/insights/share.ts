import { pctLabel } from "./aggregate";
import { insightsHref } from "./period";
import type { InsightsData, InsightsFilters } from "./types";

const NAME_PATTERN = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/;

export function shareSummary(data: InsightsData, origin: string, filters: InsightsFilters): string {
  const path = insightsHref(filters);
  const link = `${origin.replace(/\/$/, "")}${path}`;
  const scope = data.scope.kind === "region" ? "Region" : "Your cell";
  const type = data.filters.category || "all types";
  const lines = [
    `Gather insights (${scope} · ${type})`,
    `${data.kpis.attendClicks} Attend clicks · ${pctLabel(data.kpis.attendanceRate)} attendance · ${data.kpis.eventsPublished} published events`,
    `Open: ${link}`
  ];
  const text = lines.join("\n");
  if (NAME_PATTERN.test(text) || /\b07\d{9}\b/.test(text)) {
    throw new Error("Share text must not include names or cell numbers.");
  }
  return text;
}

export function shareTargets(text: string): { id: string; label: string; href?: string }[] {
  const encoded = encodeURIComponent(text);
  const firstLine = encodeURIComponent(text.split("\n")[0] ?? "Gather insights");
  return [
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encoded}` },
    { id: "email", label: "Email", href: `mailto:?subject=${firstLine}&body=${encoded}` },
    { id: "teams", label: "Microsoft Teams", href: `https://teams.microsoft.com/share?msgText=${encoded}` },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?text=${encoded}` },
    { id: "copy", label: "Copy to clipboard" },
    { id: "device", label: "Share…" }
  ];
}
