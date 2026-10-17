import Link from "next/link";
import { calendarHref, rangeLabel, stepAnchor, type CalendarState, type DayKey } from "@/lib/calendar";
import { Chip } from "./FilterBar";

const VIEWS = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" }
] as const;

export function RangeNav({ state, today }: { state: CalendarState; today: DayKey }) {
  return (
    <div className="calendar-nav">
      <div className="filters" role="group" aria-label="Calendar view">
        {VIEWS.map((v) => (
          <Chip key={v.id} href={calendarHref(state, { view: v.id })} current={state.view === v.id}>
            {v.label}
          </Chip>
        ))}
      </div>
      <div className="row">
        <Link className="button ghost" href={calendarHref(state, { anchor: stepAnchor(state.view, state.anchor, -1) })} scroll={false}>
          Previous
        </Link>
        <Link className="button ghost" href={calendarHref(state, { anchor: today })} scroll={false}>
          Today
        </Link>
        <Link className="button ghost" href={calendarHref(state, { anchor: stepAnchor(state.view, state.anchor, 1) })} scroll={false}>
          Next
        </Link>
      </div>
      <h2 className="range-heading" aria-live="polite">
        {rangeLabel(state.view, state.anchor)}
      </h2>
    </div>
  );
}
