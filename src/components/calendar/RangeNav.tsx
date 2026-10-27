import Link from "next/link";
import { calendarHref, rangeLabel, stepAnchor, type CalendarState, type DayKey } from "@/lib/calendar";

const VIEWS = [
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "month", label: "Month" },
  { id: "list", label: "List" }
] as const;

export function RangeNav({ state, today }: { state: CalendarState; today: DayKey }) {
  const prev = stepAnchor(state.view, state.anchor, -1);
  const next = stepAnchor(state.view, state.anchor, 1);
  return (
    <div className="calendar-nav">
      <div className="row calendar-nav-step">
        <Link className="button ghost" href={calendarHref(state, { anchor: today })} scroll={false}>
          Today
        </Link>
        <Link
          className="button ghost calendar-nav-chevron"
          href={calendarHref(state, { anchor: prev })}
          scroll={false}
          aria-label="Previous"
        >
          ←
        </Link>
        <Link
          className="button ghost calendar-nav-chevron"
          href={calendarHref(state, { anchor: next })}
          scroll={false}
          aria-label="Next"
        >
          →
        </Link>
      </div>
      <h2 className="range-heading" aria-live="polite">
        {rangeLabel(state.view, state.anchor)}
      </h2>
      <div className="view-tabs" role="tablist" aria-label="Calendar view">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            role="tab"
            aria-selected={state.view === v.id}
            className="view-tab"
            href={calendarHref(state, { view: v.id })}
            scroll={false}
          >
            {v.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
