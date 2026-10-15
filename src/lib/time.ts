const ZONE = "Europe/London";

export function nowUtc(): Date {
  return new Date();
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function eventEnd(startsAt: Date, endsAt: Date | null | undefined): Date {
  if (endsAt) return endsAt;
  return new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);
}

export function startOfWeekMonday(ref: Date): Date {
  const parts = londonParts(ref);
  const noon = londonDate(parts.year, parts.month, parts.day, 12, 0);
  const weekday = londonWeekday(noon);
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(noon);
  monday.setUTCDate(monday.getUTCDate() + mondayOffset);
  const mp = londonParts(monday);
  return londonDate(mp.year, mp.month, mp.day, 0, 0);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function londonParts(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const bits = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );
  return {
    year: Number(bits.year),
    month: Number(bits.month),
    day: Number(bits.day),
    hour: Number(bits.hour === "24" ? "0" : bits.hour),
    minute: Number(bits.minute)
  };
}

export function londonWeekday(date: Date): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    weekday: "short"
  }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

export function londonDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const parts = londonParts(guess);
  const wanted = Date.UTC(year, month - 1, day, hour, minute);
  const got = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return new Date(guess.getTime() + (wanted - got));
}

export function monthGrid(year: number, month: number): Date[][] {
  const first = londonDate(year, month, 1, 0, 0);
  const start = startOfWeekMonday(first);
  const weeks: Date[][] = [];
  let cursor = start;
  for (let w = 0; w < 6; w += 1) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d += 1) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function sameLondonDay(a: Date, b: Date): boolean {
  const pa = londonParts(a);
  const pb = londonParts(b);
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}

export function toDatetimeLocalValue(date: Date): string {
  const p = londonParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export function fromDatetimeLocalValue(value: string): Date {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return londonDate(year, month, day, hour, minute);
}
