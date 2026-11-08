import type { Category } from "../constants";
import { MEETUP_BIRMINGHAM_FIND_URL, STARTER_PRIORITY_URL, parsePriorityUrls } from "./allowlist";

/**
 * Birmingham + West Midlands discovery pack — probe, then seed Priority URLs.
 * Aimed at ~500 unique November events across the five Gather types.
 */
export type DiscoveryCandidate = {
  url: string;
  category: Category;
  label: string;
};

const EB = "https://www.eventbrite.co.uk/d/united-kingdom--birmingham";
const MU = "https://www.meetup.com/find/";
const AE = "https://allevents.in";

function meetup(keywords: string, category: Category, label?: string): DiscoveryCandidate {
  return {
    url: `${MU}?keywords=${encodeURIComponent(keywords)}&location=gb--Birmingham`,
    category,
    label: label ?? `Meetup ${keywords}`
  };
}

export const DISCOVERY_PACK: DiscoveryCandidate[] = [
  // —— Christian ——
  { url: STARTER_PRIORITY_URL, category: "Christian", label: "Cathedral what’s-on" },
  { url: `${EB}/religion-and-spirituality--events/`, category: "Christian", label: "Eventbrite religion" },
  { url: `${AE}/birmingham-uk/religious`, category: "Christian", label: "Allevents religious" },
  meetup("christian", "Christian"),
  meetup("church", "Christian"),
  meetup("prayer", "Christian"),
  meetup("bible", "Christian"),
  meetup("worship", "Christian"),
  meetup("gospel", "Christian"),
  meetup("faith", "Christian"),

  // —— Networking ——
  {
    url: "https://luma.com/calendar/cal-S60usgWCdXX9MLP",
    category: "Networking",
    label: "Luma reference calendar"
  },
  { url: `${EB}/networking--events/`, category: "Networking", label: "Eventbrite networking" },
  { url: `${EB}/startups--events/`, category: "Networking", label: "Eventbrite startups" },
  { url: `${AE}/birmingham-uk/networking`, category: "Networking", label: "Allevents networking" },
  meetup("networking", "Networking"),
  meetup("startup", "Networking"),
  meetup("founders", "Networking"),
  meetup("coworking", "Networking"),
  meetup("women", "Networking"),
  meetup("entrepreneur", "Networking"),

  // —— Professional ——
  { url: `${EB}/professional--events/`, category: "Professional", label: "Eventbrite professional" },
  { url: `${EB}/career--events/`, category: "Professional", label: "Eventbrite career" },
  { url: `${EB}/business--events/`, category: "Professional", label: "Eventbrite business" },
  { url: `${AE}/birmingham-uk/business`, category: "Professional", label: "Allevents business" },
  meetup("professional", "Professional"),
  meetup("business", "Professional"),
  meetup("careers", "Professional"),
  meetup("tech", "Professional"),
  meetup("marketing", "Professional"),
  meetup("finance", "Professional"),
  meetup("law", "Professional"),

  // —— Student ——
  { url: `${EB}/school--events/`, category: "Student", label: "Eventbrite school" },
  { url: `${EB}/family-and-education--events/`, category: "Student", label: "Eventbrite education" },
  { url: `${AE}/birmingham-uk/education`, category: "Student", label: "Allevents education" },
  meetup("student", "Student"),
  meetup("university", "Student"),
  meetup("freshers", "Student"),
  meetup("campus", "Student"),

  // —— Meetup / city-wide + West Midlands ——
  { url: MEETUP_BIRMINGHAM_FIND_URL, category: "Meetup", label: "Meetup Birmingham find" },
  {
    url: `${MU}?source=EVENTS&location=gb--Birmingham&distance=fiftyMiles`,
    category: "Meetup",
    label: "Meetup 50 miles"
  },
  { url: `${EB}/all-events/`, category: "Meetup", label: "Eventbrite.co.uk all" },
  {
    url: "https://www.eventbrite.com/d/united-kingdom--birmingham/events/",
    category: "Meetup",
    label: "Eventbrite.com Birmingham"
  },
  { url: `${EB}/community--events/`, category: "Meetup", label: "Eventbrite community" },
  { url: `${EB}/music--events/`, category: "Meetup", label: "Eventbrite music" },
  { url: `${EB}/food-and-drink--events/`, category: "Meetup", label: "Eventbrite food" },
  { url: `${AE}/birmingham-uk/all`, category: "Meetup", label: "Allevents Birmingham all" },
  { url: `${AE}/birmingham-uk/music`, category: "Meetup", label: "Allevents music" },
  { url: `${AE}/birmingham-uk/this-weekend`, category: "Meetup", label: "Allevents this weekend" },
  { url: `${AE}/birmingham-uk/next-week`, category: "Meetup", label: "Allevents next week" },
  { url: `${AE}/solihull/all`, category: "Meetup", label: "Allevents Solihull" },
  { url: `${AE}/wolverhampton/all`, category: "Meetup", label: "Allevents Wolverhampton" },
  { url: `${AE}/walsall/all`, category: "Meetup", label: "Allevents Walsall" },
  { url: `${AE}/west-bromwich/all`, category: "Meetup", label: "Allevents West Bromwich" },
  { url: `${AE}/coventry/all`, category: "Meetup", label: "Allevents Coventry" },
  { url: `${AE}/sutton-coldfield/all`, category: "Meetup", label: "Allevents Sutton Coldfield" },
  {
    url: "https://www.ticketmaster.co.uk/search?q=birmingham",
    category: "Meetup",
    label: "Ticketmaster Birmingham search"
  },
  {
    url: "https://www.visitbirmingham.com/whats-on",
    category: "Meetup",
    label: "Visit Birmingham what’s-on"
  },
  meetup("comedy", "Meetup"),
  meetup("music", "Meetup"),
  meetup("yoga", "Meetup"),
  meetup("board games", "Meetup"),
  meetup("language", "Meetup"),
  meetup("photography", "Meetup"),
  meetup("hiking", "Meetup"),
  meetup("book club", "Meetup")
];

export const DISCOVERY_PACK_URLS = DISCOVERY_PACK.map((row) => row.url);

/** Allowlist-filtered, capped Priority URL list — install this on empty Settings. */
export function frozenDiscoveryUrls(): string[] {
  return parsePriorityUrls(DISCOVERY_PACK_URLS).urls;
}
