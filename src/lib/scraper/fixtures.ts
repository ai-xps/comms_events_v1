import { addDays, londonDate, londonParts } from "../time";
import type { ScrapedEvent } from "./types";

function at(daysFromToday: number, hour: number, minute = 0) {
  const now = new Date();
  const p = londonParts(now);
  const base = londonDate(p.year, p.month, p.day, hour, minute);
  return addDays(base, daysFromToday);
}

export function fixtureEvents(): ScrapedEvent[] {
  return [
    {
      sourceKey: "st-philips-sung-eucharist-sun",
      title: "Sung Eucharist at St Philip’s Cathedral",
      organisationName: "St Philip’s Cathedral",
      category: "Christian",
      startsAt: at(3, 11, 0),
      endsAt: at(3, 12, 15),
      online: false,
      placeName: "St Philip’s Cathedral, Colmore Row",
      lat: 52.4814,
      lng: -1.8985,
      externalUrl: "https://birminghamcathedral.com",
      notes: "Sunday morning service. External registration is not required."
    },
    {
      sourceKey: "carrs-lane-lunchtime-prayer",
      title: "Lunchtime prayer at Carrs Lane",
      organisationName: "Carrs Lane Church",
      category: "Christian",
      startsAt: at(1, 12, 30),
      endsAt: at(1, 13, 0),
      online: false,
      placeName: "Carrs Lane Church Centre",
      lat: 52.4795,
      lng: -1.8938
    },
    {
      sourceKey: "bham-tech-meetup-oct",
      title: "Birmingham Tech Meetup",
      organisationName: "Birmingham Tech Meetup",
      category: "Meetup",
      startsAt: at(5, 18, 30),
      endsAt: at(5, 21, 0),
      online: false,
      placeName: "The Custard Factory, Digbeth",
      lat: 52.4747,
      lng: -1.8848,
      externalUrl: "https://www.meetup.com"
    },
    {
      sourceKey: "bham-founders-breakfast",
      title: "Founders’ breakfast, Jewellery Quarter",
      organisationName: "Birmingham Tech Meetup",
      category: "Networking",
      startsAt: at(8, 8, 0),
      endsAt: at(8, 9, 30),
      online: false,
      placeName: "1000 Trades, Frederick Street",
      lat: 52.4865,
      lng: -1.9122
    },
    {
      sourceKey: "spam-events-crypto-night",
      title: "Unlimited crypto riches night",
      organisationName: "Spam Events Ltd",
      category: "Networking",
      startsAt: at(4, 19, 0),
      endsAt: at(4, 22, 0),
      online: true,
      placeName: null,
      lat: null,
      lng: null,
      notes: "This source is on the blacklist."
    },
    {
      sourceKey: "spam-events-webinar",
      title: "Guaranteed leads webinar",
      organisationName: "Spam Events Ltd",
      category: "Professional",
      startsAt: at(6, 12, 0),
      endsAt: at(6, 13, 0),
      online: true
    },
    {
      sourceKey: "uob-careers-fair",
      title: "University of Birmingham autumn careers fair",
      organisationName: "University of Birmingham",
      category: "Student",
      startsAt: at(9, 10, 0),
      endsAt: at(9, 16, 0),
      online: false,
      placeName: "Great Hall, University of Birmingham",
      lat: 52.4508,
      lng: -1.9305,
      externalUrl: "https://www.birmingham.ac.uk"
    },
    {
      sourceKey: "bcu-student-union-open-mic",
      title: "BCU student union open mic",
      organisationName: "Birmingham City University",
      category: "Student",
      startsAt: at(2, 19, 0),
      endsAt: at(2, 22, 0),
      online: false,
      placeName: "The Loft, BCU Students’ Union",
      lat: 52.4826,
      lng: -1.8854
    },
    {
      sourceKey: "iod-west-mids-lunch",
      title: "Institute of Directors West Midlands lunch",
      organisationName: "IoD West Midlands",
      category: "Professional",
      startsAt: at(11, 12, 0),
      endsAt: at(11, 14, 30),
      online: false,
      placeName: "The Grand Hotel, Colmore Row",
      lat: 52.4818,
      lng: -1.9007,
      externalUrl: "https://www.iod.com"
    },
    {
      sourceKey: "chamber-export-clinic",
      title: "Greater Birmingham Chambers export clinic",
      organisationName: "Greater Birmingham Chambers of Commerce",
      category: "Professional",
      startsAt: at(7, 9, 30),
      endsAt: at(7, 11, 0),
      online: false,
      placeName: "Chamber HQ, Harborne Road",
      lat: 52.4722,
      lng: -1.9284
    },
    {
      sourceKey: "impact-hub-bham-circle",
      title: "Impact Hub Birmingham circle",
      organisationName: "Impact Hub Birmingham",
      category: "Networking",
      startsAt: at(10, 17, 30),
      endsAt: at(10, 19, 30),
      online: false,
      placeName: "Impact Hub, Digbeth",
      lat: 52.4756,
      lng: -1.8871
    },
    {
      sourceKey: "online-prayer-network",
      title: "West Midlands online prayer hour",
      organisationName: "Carrs Lane Church",
      category: "Christian",
      startsAt: at(4, 20, 0),
      endsAt: at(4, 21, 0),
      online: true,
      placeName: null,
      lat: null,
      lng: null,
      notes: "Join by the host’s own link. Still click Attend here."
    },
    {
      sourceKey: "digbeth-first-friday",
      title: "Digbeth First Friday walk",
      organisationName: "Digbeth Dining Club",
      category: "Meetup",
      startsAt: at(12, 18, 0),
      endsAt: at(12, 21, 0),
      online: false,
      placeName: "Floodgate Street, Digbeth",
      lat: 52.4759,
      lng: -1.8841
    },
    {
      sourceKey: "aston-su-freshers-panel",
      title: "Aston SU living in Birmingham panel",
      organisationName: "Aston Students’ Union",
      category: "Student",
      startsAt: at(6, 16, 0),
      endsAt: at(6, 18, 0),
      online: false,
      placeName: "Aston Students’ Union",
      lat: 52.4866,
      lng: -1.8899
    },
    {
      sourceKey: "no-coords-poetry",
      title: "Birmingham poetry night (venue TBC)",
      organisationName: "Birmingham Tech Meetup",
      category: "Meetup",
      startsAt: at(14, 19, 30),
      endsAt: at(14, 22, 0),
      online: false,
      placeName: "To be confirmed",
      lat: null,
      lng: null,
      notes: "No coordinates yet — stays off the map."
    }
  ];
}
