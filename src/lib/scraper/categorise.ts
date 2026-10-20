import { CATEGORIES, type Category } from "../constants";

export const TYPE_REVIEW_NOTE = "Gather could not infer the event type. Please set it before publishing.";

const HOST_CATEGORY: Record<string, Category> = {
  "birminghamcathedral.com": "Christian",
  "www.birminghamcathedral.com": "Christian",
  "carrslane.co.uk": "Christian",
  "www.carrslane.co.uk": "Christian",
  "meetup.com": "Meetup",
  "www.meetup.com": "Meetup",
  "birmingham.ac.uk": "Student",
  "www.birmingham.ac.uk": "Student",
  "bcu.ac.uk": "Student",
  "www.bcu.ac.uk": "Student",
  "bcusu.com": "Student",
  "www.bcusu.com": "Student",
  "iod.com": "Professional",
  "www.iod.com": "Professional",
  "greaterbirminghamchambers.com": "Professional",
  "www.greaterbirminghamchambers.com": "Professional",
  "birmingham.impacthub.net": "Networking",
  "digbethdiningclub.com": "Meetup",
  "www.digbethdiningclub.com": "Meetup",
  "aston.ac.uk": "Student",
  "www.aston.ac.uk": "Student",
  "astonsu.com": "Student",
  "www.astonsu.com": "Student"
};

const KEYWORDS: { pattern: RegExp; category: Category }[] = [
  { pattern: /\b(church|cathedral|eucharist|prayer|worship|mass)\b/i, category: "Christian" },
  { pattern: /\b(student|university|freshers|careers fair|su\b)\b/i, category: "Student" },
  { pattern: /\b(iod|chamber|director|export|professional)\b/i, category: "Professional" },
  { pattern: /\b(founders|networking|breakfast|impact hub)\b/i, category: "Networking" },
  { pattern: /\b(meetup|open mic|walk)\b/i, category: "Meetup" }
];

export function inferCategory(input: {
  host?: string | null;
  title: string;
  organisationName: string;
}): { category: Category; inferred: boolean } {
  const host = input.host?.toLowerCase() ?? "";
  if (host && HOST_CATEGORY[host]) return { category: HOST_CATEGORY[host], inferred: true };
  const haystack = `${input.title} ${input.organisationName}`;
  for (const row of KEYWORDS) {
    if (row.pattern.test(haystack)) return { category: row.category, inferred: true };
  }
  return { category: CATEGORIES[4], inferred: false };
}
