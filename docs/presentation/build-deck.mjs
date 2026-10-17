/**
 * Builds the 6-slide tester guide.
 * Run: npm run deck
 *
 * Do not put cell numbers, passwords, account names, or other secrets in this file
 * or in the screenshots it embeds.
 */
import PptxGenJS from "pptxgenjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const shot = (name) => join(root, "shots", name);

const PAPER = "F4EEE4";
const WHITE = "FFFDF8";
const INK = "1C1612";
const SOFT = "4A4038";
const LINE = "D9CBB6";
const TERRACOTTA = "8B3A24";

const pres = new PptxGenJS();
pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pres.layout = "WIDE";
pres.author = "Gather";
pres.title = "Gather — a quick look";
pres.subject = "Birmingham community events";

function slide() {
  const s = pres.addSlide();
  s.background = { color: PAPER };
  return s;
}

function footer(s, n) {
  s.addText("Gather  ·  Birmingham", {
    x: 0.5,
    y: 7.12,
    w: 10.5,
    h: 0.22,
    fontFace: "Calibri",
    fontSize: 11,
    color: SOFT
  });
  s.addText(`${n} / 6`, {
    x: 11.6,
    y: 7.12,
    w: 1.2,
    h: 0.22,
    fontFace: "Calibri",
    fontSize: 11,
    color: SOFT,
    align: "right"
  });
}

function heading(s, text) {
  s.addText(text, {
    x: 0.5,
    y: 0.28,
    w: 12.3,
    h: 0.55,
    fontFace: "Georgia",
    fontSize: 28,
    color: INK,
    bold: true
  });
}

function card(s, x, y, w, h) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: WHITE },
    line: { color: LINE },
    rectRadius: 0.12
  });
}

{
  const s = slide();
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 0.18,
    h: 7.5,
    fill: { color: TERRACOTTA },
    line: { color: TERRACOTTA }
  });
  s.addText("Gather", {
    x: 0.7,
    y: 1.85,
    w: 12,
    h: 0.9,
    fontFace: "Georgia",
    fontSize: 54,
    color: INK,
    bold: true
  });
  s.addText("A quick look around", {
    x: 0.7,
    y: 2.75,
    w: 12,
    h: 0.5,
    fontFace: "Georgia",
    fontSize: 28,
    color: TERRACOTTA
  });
  s.addText("A closed calendar for one community in Birmingham. Have a click. Nothing here is a test you can fail.", {
    x: 0.7,
    y: 3.5,
    w: 10.5,
    h: 0.8,
    fontFace: "Calibri",
    fontSize: 20,
    color: SOFT
  });
  s.addText("Open this", {
    x: 0.7,
    y: 4.6,
    w: 3,
    h: 0.28,
    fontFace: "Calibri",
    fontSize: 13,
    color: SOFT,
    bold: true
  });
  s.addText("https://commseventsv1-production.up.railway.app", {
    x: 0.7,
    y: 4.9,
    w: 11,
    h: 0.4,
    fontFace: "Calibri",
    fontSize: 20,
    color: TERRACOTTA
  });
}

{
  const s = slide();
  heading(s, "Sign in");
  s.addText("Your cell leader gives you a cell number and a password. That is the whole door. There is no public sign-up.", {
    x: 0.5,
    y: 0.9,
    w: 6.4,
    h: 0.7,
    fontFace: "Calibri",
    fontSize: 17,
    color: SOFT
  });
  s.addImage({ path: shot("login.png"), x: 7.15, y: 0.95, w: 5.65, h: 5.95 });
  card(s, 0.5, 1.75, 6.4, 4.85);
  const roles = [
    ["Members", "Browse the calendar, click Attend, confirm later if you went."],
    ["Cell leaders", "Look after their own cell, review pending events, see Insights for that cell."],
    ["Admin", "Sets people up, runs the scraper, sees the whole region."]
  ];
  roles.forEach(([title, body], i) => {
    const y = 2.0 + i * 1.4;
    s.addText(title, { x: 0.75, y, w: 5.9, h: 0.35, fontFace: "Georgia", fontSize: 20, color: TERRACOTTA, bold: true });
    s.addText(body, { x: 0.75, y: y + 0.38, w: 5.9, h: 0.7, fontFace: "Calibri", fontSize: 16, color: SOFT });
  });
  footer(s, 2);
}

{
  const s = slide();
  heading(s, "Find something");
  s.addText("Month, week or day. Filter by type if you like. The map stays at the bottom even when a day is quiet.", {
    x: 0.5,
    y: 0.85,
    w: 12.3,
    h: 0.4,
    fontFace: "Calibri",
    fontSize: 17,
    color: SOFT
  });
  s.addImage({ path: shot("calendar-today.png"), x: 0.5, y: 1.35, w: 7.4, h: 5.5 });
  s.addImage({ path: shot("calendar-map.png"), x: 8.05, y: 1.35, w: 4.8, h: 3.55 });
  card(s, 8.05, 5.05, 4.8, 1.8);
  s.addText("Try week and day for today. Tap a type, then All types — everything should come back.", {
    x: 8.25,
    y: 5.22,
    w: 4.4,
    h: 1.45,
    fontFace: "Calibri",
    fontSize: 16,
    color: SOFT
  });
  footer(s, 3);
}

{
  const s = slide();
  heading(s, "Attend, then say if you went");
  s.addImage({ path: shot("event.png"), x: 0.5, y: 1.05, w: 7.6, h: 5.75 });
  card(s, 8.3, 1.15, 4.55, 5.55);
  const points = [
    ["Attend", "Means you plan to go. That is it."],
    ["Did you go?", "After the event, a quiet prompt. Yes, no, or later."],
    ["Star", "A bookmark. It drops once the event is over."],
    ["Names", "Members usually see a count. An admin can choose initials, or name and cell."]
  ];
  points.forEach(([title, body], i) => {
    const y = 1.4 + i * 1.25;
    s.addText(title, { x: 8.5, y, w: 4.15, h: 0.32, fontFace: "Georgia", fontSize: 18, color: TERRACOTTA, bold: true });
    s.addText(body, { x: 8.5, y: y + 0.34, w: 4.15, h: 0.7, fontFace: "Calibri", fontSize: 16, color: SOFT });
  });
  footer(s, 4);
}

{
  const s = slide();
  heading(s, "Insights, if you lead");
  s.addText("Admin sees the region. Cell leaders see their own cell. Members do not see this page. A file or a short share uses the same numbers as the screen.", {
    x: 0.5,
    y: 0.85,
    w: 12.3,
    h: 0.5,
    fontFace: "Calibri",
    fontSize: 16,
    color: SOFT
  });
  s.addImage({ path: shot("insights-kpis.png"), x: 0.5, y: 1.45, w: 6.7, h: 5.4 });
  s.addImage({ path: shot("insights-share.png"), x: 7.4, y: 1.45, w: 5.45, h: 5.4 });
  footer(s, 5);
}

{
  const s = slide();
  heading(s, "Have a play");
  card(s, 0.5, 1.05, 6.2, 5.7);
  card(s, 6.95, 1.05, 5.85, 5.7);
  s.addText("Nice ones to tap", {
    x: 0.75,
    y: 1.28,
    w: 5.7,
    h: 0.4,
    fontFace: "Georgia",
    fontSize: 20,
    color: TERRACOTTA,
    bold: true
  });
  s.addText(
    [
      { text: "Week and day for today.", options: { breakLine: true } },
      { text: "A type chip, then All types.", options: { breakLine: true } },
      { text: "Scroll to the map.", options: { breakLine: true } },
      { text: "Open an event and click Attend.", options: { breakLine: true } },
      { text: "If you can add events: drop a pin, add a link, publish — you should land back on pending." }
    ],
    { x: 0.75, y: 1.85, w: 5.7, h: 4.5, fontFace: "Calibri", fontSize: 17, color: INK, paraSpaceAfter: 12 }
  );
  s.addText("Not this round", {
    x: 7.2,
    y: 1.28,
    w: 5.4,
    h: 0.4,
    fontFace: "Georgia",
    fontSize: 20,
    color: TERRACOTTA,
    bold: true
  });
  s.addText(
    [
      { text: "No public sign-up, email or texts from Gather.", options: { breakLine: true } },
      { text: "Share opens your own app. Gather does not send the message.", options: { breakLine: true } },
      { text: "The phone-first look is still to come. This demo is the cream paper one.", options: { breakLine: true } },
      { text: "If something feels off, say so. That is the point of looking." }
    ],
    { x: 7.2, y: 1.85, w: 5.4, h: 4.5, fontFace: "Calibri", fontSize: 17, color: INK, paraSpaceAfter: 12 }
  );
  footer(s, 6);
}

const out = join(root, "Gather-tester-guide.pptx");
await pres.writeFile({ fileName: out });
console.log(`Wrote ${out}`);
