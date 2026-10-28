import { londonDate, londonParts, londonWeekday } from "../time";
import type { ScrapedEvent } from "./types";

/** Add calendar days in Europe/London, keeping the wall-clock time (safe across the 25 Oct change). */
export function addLondonCalendarDays(date: Date, days: number): Date {
  const p = londonParts(date);
  const noon = new Date(Date.UTC(p.year, p.month - 1, p.day, 12, 0));
  noon.setUTCDate(noon.getUTCDate() + days);
  const n = londonParts(noon);
  return londonDate(n.year, n.month, n.day, p.hour, p.minute);
}

function nextLondonWeekday(weekday: number, hour: number, minute: number): Date {
  const now = new Date();
  const p = londonParts(now);
  let candidate = londonDate(p.year, p.month, p.day, hour, minute);
  for (let i = 0; i < 8; i += 1) {
    if (londonWeekday(candidate) === weekday && candidate.getTime() > now.getTime()) return candidate;
    candidate = addLondonCalendarDays(candidate, 1);
  }
  return candidate;
}

function dayKey(date: Date): string {
  const p = londonParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

function at(daysFromToday: number, hour: number, minute = 0) {
  const p = londonParts(new Date());
  const base = londonDate(p.year, p.month, p.day, hour, minute);
  return addLondonCalendarDays(base, daysFromToday);
}

/**
 * Demo harvest. Keys are prefixed `fixture-` so they never collide with seed rows.
 * Event Links are real host pages (not site roots), except one deliberate blank.
 */
export function fixtureEvents(): ScrapedEvent[] {
  if (process.env.SCRAPE_FIXTURES === "0") return [];
  const sunday = nextLondonWeekday(0, 11, 0);
  const fridayPrayer = nextLondonWeekday(5, 12, 30);
  const prayerWeeks = [0, 1, 2, 3].map((week) => {
    const startsAt = addLondonCalendarDays(fridayPrayer, week * 7);
    return {
      sourceKey: `fixture-carrs-lane-prayer-${dayKey(startsAt)}`,
      title: "Lunchtime prayer at Carrs Lane",
      organisationName: "Carrs Lane Church",
      category: "Christian" as const,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 30 * 60 * 1000),
      online: false,
      placeName: "Carrs Lane Church Centre",
      lat: 52.4795,
      lng: -1.8938,
      externalUrl: "https://www.carrslane.co.uk/whats-on/"
    };
  });

  return [
    {
      sourceKey: `fixture-st-philips-eucharist-${dayKey(sunday)}`,
      title: "Sung Eucharist at St Philip’s Cathedral",
      organisationName: "St Philip’s Cathedral",
      category: "Christian",
      startsAt: sunday,
      endsAt: new Date(sunday.getTime() + 75 * 60 * 1000),
      online: false,
      placeName: "St Philip’s Cathedral, Colmore Row",
      lat: 52.4814,
      lng: -1.8985,
      externalUrl: "https://birminghamcathedral.com/worship/regular-worship/",
      notes: "Sunday morning service. External registration is not required."
    },
    ...prayerWeeks,
    {
      sourceKey: "fixture-bham-tech-meetup",
      title: "Birmingham Tech Meetup",
      organisationName: "Birmingham Tech Meetup",
      category: "Meetup",
      startsAt: at(5, 18, 30),
      endsAt: at(5, 21, 0),
      online: false,
      placeName: "The Custard Factory, Digbeth",
      lat: 52.4747,
      lng: -1.8848,
      externalUrl: "https://www.meetup.com/find/?keywords=birmingham+tech&location=gb--birmingham"
    },
    {
      sourceKey: "fixture-founders-breakfast",
      title: "Founders’ breakfast, Jewellery Quarter",
      organisationName: "Birmingham Tech Meetup",
      category: "Networking",
      startsAt: at(8, 8, 0),
      endsAt: at(8, 9, 30),
      online: false,
      placeName: "1000 Trades, Frederick Street",
      lat: 52.4865,
      lng: -1.9122,
      externalUrl: "https://www.meetup.com/find/?keywords=founders+birmingham&location=gb--birmingham"
    },
    {
      sourceKey: "fixture-spam-crypto-night",
      title: "Unlimited crypto riches night",
      organisationName: "Spam Events Ltd",
      category: "Networking",
      startsAt: at(4, 19, 0),
      endsAt: at(4, 22, 0),
      online: true,
      placeName: null,
      lat: null,
      lng: null,
      externalUrl: "https://www.meetup.com/find/?keywords=crypto&location=gb--birmingham",
      notes: "This source is on the blacklist."
    },
    {
      sourceKey: "fixture-spam-webinar",
      title: "Guaranteed leads webinar",
      organisationName: "Spam Events Ltd",
      category: "Professional",
      startsAt: at(6, 12, 0),
      endsAt: at(6, 13, 0),
      online: true,
      externalUrl: "https://www.meetup.com/find/?keywords=webinar&location=gb--birmingham"
    },
    {
      sourceKey: "fixture-uob-careers-fair",
      title: "University of Birmingham autumn careers fair",
      organisationName: "University of Birmingham",
      category: "Student",
      startsAt: at(9, 10, 0),
      endsAt: at(9, 16, 0),
      online: false,
      placeName: "Great Hall, University of Birmingham",
      lat: 52.4508,
      lng: -1.9305,
      externalUrl: "https://www.birmingham.ac.uk/study/student-experience/careers"
    },
    {
      sourceKey: "fixture-bcu-open-mic",
      title: "Open mic night",
      organisationName: "Birmingham City University",
      category: "Student",
      startsAt: at(2, 19, 0),
      endsAt: at(2, 22, 0),
      online: false,
      placeName: "The Loft, BCU Students’ Union",
      lat: 52.4826,
      lng: -1.8854,
      externalUrl: "https://www.bcusu.com/events/"
    },
    {
      sourceKey: "fixture-tech-open-mic",
      title: "Open mic night",
      organisationName: "Birmingham Tech Meetup",
      category: "Meetup",
      startsAt: at(13, 19, 30),
      endsAt: at(13, 22, 0),
      online: false,
      placeName: "The Woodman, Easy Row",
      lat: 52.479,
      lng: -1.908,
      externalUrl: "https://www.meetup.com/find/?keywords=open+mic+birmingham&location=gb--birmingham",
      notes: "Same title as the BCU night, different organiser."
    },
    {
      sourceKey: "fixture-iod-lunch",
      title: "Institute of Directors West Midlands lunch",
      organisationName: "IoD West Midlands",
      category: "Professional",
      startsAt: at(11, 12, 0),
      endsAt: at(11, 14, 30),
      online: false,
      placeName: "The Grand Hotel, Colmore Row",
      lat: 52.4818,
      lng: -1.9007,
      externalUrl: "https://www.iod.com/events/"
    },
    {
      sourceKey: "fixture-chamber-export",
      title: "Greater Birmingham Chambers export clinic",
      organisationName: "Greater Birmingham Chambers of Commerce",
      category: "Professional",
      startsAt: at(7, 9, 30),
      endsAt: at(7, 11, 0),
      online: false,
      placeName: "Chamber HQ, Harborne Road",
      lat: 52.4722,
      lng: -1.9284,
      externalUrl: "https://www.greaterbirminghamchambers.com/events/"
    },
    {
      sourceKey: "fixture-impact-hub",
      title: "Impact Hub Birmingham circle",
      organisationName: "Impact Hub Birmingham",
      category: "Networking",
      startsAt: at(10, 17, 30),
      endsAt: at(10, 19, 30),
      online: false,
      placeName: "Impact Hub, Digbeth",
      lat: 52.4756,
      lng: -1.8871,
      externalUrl: "https://birmingham.impacthub.net/events/"
    },
    {
      sourceKey: "fixture-online-prayer",
      title: "West Midlands online prayer hour",
      organisationName: "Carrs Lane Church",
      category: "Christian",
      startsAt: at(4, 20, 0),
      endsAt: at(4, 21, 0),
      online: true,
      placeName: null,
      lat: null,
      lng: null,
      externalUrl: "https://www.carrslane.co.uk/whats-on/",
      notes: "Join by the host’s own link. Still click Attend here."
    },
    {
      sourceKey: "fixture-digbeth-friday",
      title: "Digbeth First Friday walk",
      organisationName: "Digbeth Dining Club",
      category: "Meetup",
      startsAt: at(12, 18, 0),
      endsAt: at(12, 21, 0),
      online: false,
      placeName: "Floodgate Street, Digbeth",
      lat: 52.4759,
      lng: -1.8841,
      externalUrl: "https://digbethdiningclub.com/"
    },
    {
      sourceKey: "fixture-aston-panel",
      title: "Aston SU living in Birmingham panel",
      organisationName: "Aston Students’ Union",
      category: "Student",
      startsAt: at(6, 16, 0),
      endsAt: at(6, 18, 0),
      online: false,
      placeName: "Aston Students’ Union",
      lat: 52.4866,
      lng: -1.8899,
      externalUrl: "https://www.astonsu.com/events/"
    },
    {
      sourceKey: "fixture-poetry-tbc",
      title: "Birmingham poetry night (venue TBC)",
      organisationName: "Birmingham Tech Meetup",
      category: "Meetup",
      startsAt: at(14, 19, 30),
      endsAt: at(14, 22, 0),
      online: false,
      placeName: "To be confirmed",
      lat: null,
      lng: null,
      notes: "No Event Link and no coordinates yet — stays off the map."
    }
  ].map((event) => ({ ...event, needsTypeReview: false })) as ScrapedEvent[];
}
