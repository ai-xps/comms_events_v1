import Link from "next/link";
import { dayKeyOf, formatDayKey, formatDayLabel, sameDayKey, type DayKey } from "@/lib/calendar";
import { formatTime } from "@/lib/time";

type ListEvent = { id: string; title: string; startsAt: Date; category: string; placeName: string | null; online: boolean };

export function DatedList({
  days,
  today,
  events,
  colours
}: {
  days: DayKey[];
  today: DayKey;
  events: ListEvent[];
  colours: Record<string, string>;
}) {
  return (
    <div className="dated-list">
      {days.map((day) => {
        const dayEvents = events.filter((e) => sameDayKey(dayKeyOf(e.startsAt), day));
        return (
          <section key={formatDayKey(day)} className="dated-group" aria-current={sameDayKey(day, today) ? "date" : undefined}>
            <h3>
              {formatDayLabel(day)}
              {sameDayKey(day, today) ? <span className="today-tag">Today</span> : null}
            </h3>
            {dayEvents.length === 0 ? (
              <p className="muted">No events.</p>
            ) : (
              <div className="list">
                {dayEvents.map((event) => (
                  <Link key={event.id} className="card" href={`/events/${event.id}`}>
                    <span className="swatch" style={{ background: colours[event.category] }} /> {event.category}
                    <span className="event-title">{event.title}</span>
                    <span className="muted">
                      {formatTime(event.startsAt)} · {event.online ? "Online" : event.placeName}
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
