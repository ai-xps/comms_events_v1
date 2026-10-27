import Link from "next/link";
import { calendarHref, rangeLabel, stepAnchor, type CalendarState, type DayKey } from "@/lib/calendar";

const VIEWS = [
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "month", label: "Month" }
] as const;

export function RangeNav({ state, today }: { state: CalendarState; today: DayKey }) {
  return (
    <div className="calendar-nav">
      <div className="row calendar-nav-step">
        <Link className="button ghost" href={calendarHref(state, { anchor: today })} scroll={false}>
          Today
        </Link>
        <Link className="button ghost" href={calendarHref(state, { anchor: stepAnchor(state.view, state.anchor, -1) })} scroll={false}>
          Prev
        </Link>
        <Link className="button ghost" href={calendarHref(state, { anchor: stepAnchor(state.view, state.anchor, 1) })} scroll={false}>
          Next
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
