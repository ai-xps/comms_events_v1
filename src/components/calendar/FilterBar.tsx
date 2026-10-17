import Link from "next/link";
import { calendarHref, type CalendarState } from "@/lib/calendar";
import type { Category } from "@/lib/constants";

export function FilterBar({
  state,
  categories,
  colours
}: {
  state: CalendarState;
  categories: Category[];
  colours: Record<string, string>;
}) {
  return (
    <>
      <div className="filters" role="group" aria-label="Event type">
        <Chip href={calendarHref(state, { category: "" })} current={!state.category}>
          All types
        </Chip>
        {categories.map((c) => (
          <Chip key={c} href={calendarHref(state, { category: c })} current={state.category === c}>
            <span className="swatch" style={{ background: colours[c] }} />
            {c}
          </Chip>
        ))}
      </div>
      <div className="filters" role="group" aria-label="Online or in person">
        <Chip href={calendarHref(state, { format: "" })} current={!state.format}>
          Any format
        </Chip>
        <Chip href={calendarHref(state, { format: "inperson" })} current={state.format === "inperson"}>
          In person
        </Chip>
        <Chip href={calendarHref(state, { format: "online" })} current={state.format === "online"}>
          Online
        </Chip>
      </div>
    </>
  );
}

export function Chip({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link className="chip" href={href} aria-current={current ? "true" : undefined} scroll={false}>
      {children}
    </Link>
  );
}
