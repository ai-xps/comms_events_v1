import type { Category } from "../constants";
import { MEETUP_BIRMINGHAM_FIND_URL, STARTER_PRIORITY_URL, parsePriorityUrls } from "./allowlist";

/**
 * Frozen Birmingham + West Midlands discovery pack (Nov 2026 stretch).
 * Probe before seeding; Priority URL cap is MAX_PRIORITY_URLS (90).
 * Christian slices are listed first so first-wins dedupe keeps faith categories.
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

function ebCity(city: string, path: string, category: Category, label: string): DiscoveryCandidate {
  return {
    url: `https://www.eventbrite.co.uk/d/united-kingdom--${city}/${path}`,
    category,
    label
  };
}

export const DISCOVERY_PACK: DiscoveryCandidate[] = [
  // —— Christian (first — first-wins dedupe) ——
  { url: STARTER_PRIORITY_URL, category: "Christian", label: "Cathedral what’s-on" },
  {
    url: "https://www.achurchnearyou.com/church/7326/service-and-events/events-all/",
    category: "Christian",
    label: "A Church Near You (cathedral parish)"
  },
  { url: `${EB}/religion-and-spirituality--events/`, category: "Christian", label: "EB Brum religion" },
  { url: `${EB}/christianity--events/`, category: "Christian", label: "EB Brum christianity" },
  {
    url: "https://www.eventbrite.com/d/united-kingdom--birmingham/religion-and-spirituality--events/",
    category: "Christian",
    label: "EB.com Brum religion"
  },
  ebCity("solihull", "religion-and-spirituality--events/", "Christian", "EB Solihull religion"),
  ebCity("wolverhampton", "religion-and-spirituality--events/", "Christian", "EB Wolves religion"),
  ebCity("coventry", "religion-and-spirituality--events/", "Christian", "EB Coventry religion"),
  { url: `${AE}/birmingham-uk/religious`, category: "Christian", label: "Allevents Brum religious" },
  { url: `${AE}/solihull/religious`, category: "Christian", label: "Allevents Solihull religious" },
  { url: `${AE}/coventry/religious`, category: "Christian", label: "Allevents Coventry religious" },
  meetup("christian", "Christian"),
  meetup("church", "Christian"),
  meetup("prayer", "Christian"),
  meetup("bible", "Christian"),
  meetup("bible study", "Christian"),
  meetup("worship", "Christian"),
  meetup("worship night", "Christian"),
  meetup("gospel", "Christian"),
  meetup("faith", "Christian"),
  meetup("jesus", "Christian"),
  meetup("catholic", "Christian"),
  meetup("anglican", "Christian"),
  meetup("baptist", "Christian"),
  meetup("pentecostal", "Christian"),
  meetup("evangelical", "Christian"),
  meetup("sunday service", "Christian"),
  meetup("youth church", "Christian"),
  meetup("alpha course", "Christian"),
  meetup("praise", "Christian"),
  meetup("fellowship", "Christian"),

  // —— Networking ——
  {
    url: "https://luma.com/calendar/cal-S60usgWCdXX9MLP",
    category: "Networking",
    label: "Luma reference calendar"
  },
  { url: `${EB}/networking--events/`, category: "Networking", label: "EB networking" },
  { url: `${EB}/startups--events/`, category: "Networking", label: "EB startups" },
  meetup("networking", "Networking"),
  meetup("startup", "Networking"),
  meetup("founders", "Networking"),
  meetup("coworking", "Networking"),
  meetup("entrepreneur", "Networking"),

  // —— Professional ——
  { url: `${EB}/professional--events/`, category: "Professional", label: "EB professional" },
  { url: `${EB}/career--events/`, category: "Professional", label: "EB career" },
  { url: `${AE}/birmingham-uk/business`, category: "Professional", label: "Allevents business" },
  meetup("professional", "Professional"),
  meetup("business", "Professional"),
  meetup("tech", "Professional"),
  meetup("marketing", "Professional"),
  meetup("finance", "Professional"),

  // —— Student ——
  { url: `${EB}/school--events/`, category: "Student", label: "EB school" },
  { url: `${EB}/family-and-education--events/`, category: "Student", label: "EB education" },
  { url: `${AE}/birmingham-uk/education`, category: "Student", label: "Allevents education" },
  meetup("student", "Student"),
  meetup("university", "Student"),
  meetup("freshers", "Student"),

  // —— Volume / Meetup / West Midlands ——
  { url: MEETUP_BIRMINGHAM_FIND_URL, category: "Meetup", label: "Meetup Birmingham find" },
  {
    url: `${MU}?source=EVENTS&location=gb--Birmingham&distance=fiftyMiles`,
    category: "Meetup",
    label: "Meetup 50 miles"
  },
  { url: `${EB}/all-events/`, category: "Meetup", label: "EB Brum all" },
  ebCity("solihull", "all-events/", "Meetup", "EB Solihull all"),
  ebCity("wolverhampton", "all-events/", "Meetup", "EB Wolves all"),
  ebCity("coventry", "all-events/", "Meetup", "EB Coventry all"),
  ebCity("dudley", "all-events/", "Meetup", "EB Dudley all"),
  ebCity("walsall", "all-events/", "Meetup", "EB Walsall all"),
  {
    url: "https://www.eventbrite.com/d/united-kingdom--birmingham/events/",
    category: "Meetup",
    label: "EB.com Brum events"
  },
  { url: `${AE}/birmingham-uk/all`, category: "Meetup", label: "Allevents Brum all" },
  { url: `${AE}/birmingham-uk/music`, category: "Meetup", label: "Allevents music" },
  { url: `${AE}/birmingham-uk/this-weekend`, category: "Meetup", label: "Allevents this weekend" },
  { url: `${AE}/solihull/all`, category: "Meetup", label: "Allevents Solihull" },
  { url: `${AE}/wolverhampton/all`, category: "Meetup", label: "Allevents Wolverhampton" },
  { url: `${AE}/walsall/all`, category: "Meetup", label: "Allevents Walsall" },
  { url: `${AE}/west-bromwich/all`, category: "Meetup", label: "Allevents West Brom" },
  { url: `${AE}/coventry/all`, category: "Meetup", label: "Allevents Coventry" },
  { url: `${AE}/sutton-coldfield/all`, category: "Meetup", label: "Allevents Sutton Coldfield" },
  { url: `${AE}/redditch/all`, category: "Meetup", label: "Allevents Redditch" },
  { url: `${AE}/cannock/all`, category: "Meetup", label: "Allevents Cannock" },
  { url: `${AE}/bromsgrove/all`, category: "Meetup", label: "Allevents Bromsgrove" },
  { url: `${AE}/lichfield/all`, category: "Meetup", label: "Allevents Lichfield" },
  { url: `${AE}/nuneaton/all`, category: "Meetup", label: "Allevents Nuneaton" },
  { url: `${AE}/kidderminster/all`, category: "Meetup", label: "Allevents Kidderminster" },
  { url: `${AE}/warwick/all`, category: "Meetup", label: "Allevents Warwick" },
  { url: `${AE}/stratford-upon-avon/all`, category: "Meetup", label: "Allevents Stratford" },
  { url: `${AE}/stoke-on-trent/all`, category: "Meetup", label: "Allevents Stoke" },
  { url: `${AE}/leicester/all`, category: "Meetup", label: "Allevents Leicester" },
  { url: `${AE}/nottingham/all`, category: "Meetup", label: "Allevents Nottingham" },
  { url: `${EB}/performing-and-visual-arts--events/`, category: "Meetup", label: "EB performing arts" },
  { url: `${EB}/health--events/`, category: "Meetup", label: "EB health" },
  { url: `${EB}/sports-and-fitness--events/`, category: "Meetup", label: "EB sports" },
  {
    url: "https://www.ticketmaster.co.uk/search?q=birmingham",
    category: "Meetup",
    label: "Ticketmaster Birmingham"
  },
  {
    url: "https://www.visitbirmingham.com/whats-on",
    category: "Meetup",
    label: "Visit Birmingham"
  },
  meetup("comedy", "Meetup"),
  meetup("music", "Meetup"),
  meetup("yoga", "Meetup"),
  meetup("board games", "Meetup"),
  meetup("hiking", "Meetup"),
  meetup("book club", "Meetup"),
  meetup("singles", "Meetup"),
  meetup("dance", "Meetup"),
  meetup("football", "Meetup"),
  meetup("parents", "Meetup"),
  meetup("lgbt", "Meetup"),
  meetup("ai", "Meetup")
];

export const DISCOVERY_PACK_URLS = DISCOVERY_PACK.map((row) => row.url);

/** Allowlist-filtered, capped Priority URL list — install this on empty Settings. */
export function frozenDiscoveryUrls(): string[] {
  return parsePriorityUrls(DISCOVERY_PACK_URLS).urls;
}
