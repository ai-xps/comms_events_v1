import Link from "next/link";
import { calendarHref, dayKeyOf, formatDayKey, formatDayLabel, sameDayKey, type CalendarState, type DayKey } from "@/lib/calendar";
import { formatTime } from "@/lib/time";

type GridEvent = { id: string; title: string; startsAt: Date; category: string };

export function MonthGrid({
  state,
  days,
  today,
  events,
  colours,
  canAdd
}: {
  state: CalendarState;
  days: DayKey[];
  today: DayKey;
  events: GridEvent[];
  colours: Record<string, string>;
  canAdd?: boolean;
}) {
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7));
  return (
    <table className="calendar">
      <thead>
        <tr>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <th key={d} scope="col">
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={formatDayKey(week[0])}>
            {week.map((day) => {
              const dayEvents = events.filter((e) => sameDayKey(dayKeyOf(e.startsAt), day));
              const outside = day.month !== state.anchor.month;
              return (
                <td key={formatDayKey(day)} className={outside ? "outside" : undefined}>
                  <div className="day-cell-head">
                    <Link
                      className="daynum"
                      href={calendarHref(state, { view: "day", anchor: day })}
                      aria-label={`${formatDayLabel(day)}, ${dayEvents.length} events. Open day view.`}
                      aria-current={sameDayKey(day, today) ? "date" : undefined}
                    >
                      {day.day}
                    </Link>
                    {canAdd ? (
                      <Link className="day-add" href={`/events/new?d=${formatDayKey(day)}`} aria-label={`Add event on ${formatDayLabel(day)}`}>
                        Add
                      </Link>
                    ) : null}
                  </div>
                  {dayEvents.map((event) => {
                    const labelText = `${formatTime(event.startsAt)} ${event.title}`;
                    return (
                      <Link
                        key={event.id}
                        className="event-link"
                        href={`/events/${event.id}`}
                        title={labelText}
                        style={{ ["--cat" as string]: colours[event.category] }}
                      >
                        <span className="sr-only">{event.category}: </span>
                        {labelText}
                      </Link>
                    );
                  })}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
