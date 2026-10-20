import Link from "next/link";
import { CategoryThumb } from "@/components/CategoryThumb";
import { categoryAccentStyle } from "@/lib/category-art";
import { dayKeyOf, formatDayKey, formatDayLabel, sameDayKey, type CalendarView, type DayKey } from "@/lib/calendar";
import { formatTime } from "@/lib/time";

type ListEvent = {
  id: string;
  title: string;
  startsAt: Date;
  category: string;
  placeName: string | null;
  online: boolean;
  sourceKey?: string | null;
};

export function DatedList({
  days,
  today,
  events,
  colours,
  view,
  canAdd
}: {
  days: DayKey[];
  today: DayKey;
  events: ListEvent[];
  colours: Record<string, string>;
  view: CalendarView;
  canAdd?: boolean;
}) {
  const hasAny = events.length > 0;
  return (
    <div className="dated-list">
      {!hasAny ? (
        <p className="muted">
          {view === "week"
            ? "No events in this week. Try All types."
            : "No events on this day. Try All types."}
        </p>
      ) : null}
      {days.map((day) => {
        const dayEvents = events.filter((e) => sameDayKey(dayKeyOf(e.startsAt), day));
        return (
          <section key={formatDayKey(day)} className="dated-group" aria-current={sameDayKey(day, today) ? "date" : undefined}>
            <h3>
              {formatDayLabel(day)}
              {sameDayKey(day, today) ? <span className="today-tag">Today</span> : null}
              {canAdd ? (
                <Link className="day-add heading-add" href={`/events/new?d=${formatDayKey(day)}`}>
                  Add
                </Link>
              ) : null}
            </h3>
            {dayEvents.length === 0 ? (
              <p className="muted">No events.</p>
            ) : (
              <div className="list">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    className="card event-card"
                    href={`/events/${event.id}`}
                    style={categoryAccentStyle(colours[event.category])}
                  >
                    <CategoryThumb category={event.category} size="md" />
                    <span className="event-card-body">
                      <span className="event-card-meta">
                        <span className="swatch" style={{ background: colours[event.category] }} />
                        {event.category}
                      </span>
                      <span className="event-title">{event.title}</span>
                      <span className="muted">
                        {formatTime(event.startsAt)} · {event.online ? "Online" : event.placeName}
                        {event.sourceKey ? " · From scrape" : ""}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
