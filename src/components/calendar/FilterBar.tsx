import Link from "next/link";
import { CategoryThumb } from "@/components/CategoryThumb";
import { calendarHref, toggleCategory, type CalendarState } from "@/lib/calendar";
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
  const none = state.categories.length === 0;
  return (
    <div className="calendar-filters">
      <div className="filters" role="group" aria-label="Event type">
        <Chip href={calendarHref(state, { categories: [] })} current={none} pressed={none}>
          All types
        </Chip>
        {categories.map((c) => {
          const on = state.categories.includes(c);
          return (
            <Chip
              key={c}
              href={calendarHref(state, { categories: toggleCategory(state.categories, c) })}
              current={on}
              pressed={on}
            >
              <CategoryThumb category={c} size="sm" />
              <span className="swatch" style={{ background: colours[c] }} />
              {c}
            </Chip>
          );
        })}
      </div>
      <div className="filters" role="group" aria-label="Online or in person">
        <Chip href={calendarHref(state, { format: "" })} current={!state.format} pressed={!state.format}>
          Any format
        </Chip>
        <Chip href={calendarHref(state, { format: "inperson" })} current={state.format === "inperson"} pressed={state.format === "inperson"}>
          In person
        </Chip>
        <Chip href={calendarHref(state, { format: "online" })} current={state.format === "online"} pressed={state.format === "online"}>
          Online
        </Chip>
      </div>
    </div>
  );
}

export function Chip({
  href,
  current,
  pressed,
  children
}: {
  href: string;
  current: boolean;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="chip"
      href={href}
      aria-current={current ? "true" : undefined}
      aria-pressed={pressed}
      scroll={false}
    >
      {children}
    </Link>
  );
}
