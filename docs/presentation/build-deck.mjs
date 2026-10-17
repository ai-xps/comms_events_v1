/**
 * Builds the 6-slide tester guide.
 * Run: node docs/presentation/build-deck.mjs
 * Needs pptxgenjs (devDependency).
 */
import PptxGenJS from "pptxgenjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const shot = (name) => join(root, "shots", name);

const PAPER = "F4EEE4";
const PAPER2 = "EFE6D6";
const WHITE = "FFFDF8";
const INK = "1C1612";
const SOFT = "4A4038";
const LINE = "D9CBB6";
const TERRACOTTA = "8B3A24";

const pres = new PptxGenJS();
pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pres.layout = "WIDE";
pres.author = "Gather";
pres.title = "Gather — tester guide";
pres.subject = "Birmingham community events, 17 October 2026";

function slide() {
  const s = pres.addSlide();
  s.background = { color: PAPER };
  return s;
}

function footer(s, n) {
  s.addText("Gather  ·  Birmingham  ·  17 October 2026", {
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

// 1 — Title
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
    y: 1.7,
    w: 12,
    h: 0.9,
    fontFace: "Georgia",
    fontSize: 54,
    color: INK,
    bold: true
  });
  s.addText("Tester guide", {
    x: 0.7,
    y: 2.55,
    w: 12,
    h: 0.5,
    fontFace: "Georgia",
    fontSize: 28,
    color: TERRACOTTA
  });
  s.addText("Closed calendar for one Birmingham community. Accounts are created by an admin. Members sign in with a cell number and password.", {
    x: 0.7,
    y: 3.3,
    w: 10.5,
    h: 0.8,
    fontFace: "Calibri",
    fontSize: 18,
    color: SOFT
  });
  s.addText("Live demo", {
    x: 0.7,
    y: 4.35,
    w: 3,
    h: 0.28,
    fontFace: "Calibri",
    fontSize: 13,
    color: SOFT,
    bold: true
  });
  s.addText("https://commseventsv1-production.up.railway.app", {
    x: 0.7,
    y: 4.62,
    w: 11,
    h: 0.4,
    fontFace: "Calibri",
    fontSize: 20,
    color: TERRACOTTA
  });
  s.addText("What it does: docs/FUNCTIONAL.md   ·   Weak points: docs/REVIEW.md   ·   17 October 2026", {
    x: 0.7,
    y: 6.7,
    w: 11.5,
    h: 0.3,
    fontFace: "Calibri",
    fontSize: 14,
    color: SOFT
  });
}

// 2 — Sign in
{
  const s = slide();
  heading(s, "Sign in");
  s.addText("Use the cell number and password your cell leader gave you. There is no public sign-up.", {
    x: 0.5,
    y: 0.88,
    w: 6.4,
    h: 0.55,
    fontFace: "Calibri",
    fontSize: 16,
    color: SOFT
  });
  s.addImage({ path: shot("login.png"), x: 7.15, y: 0.95, w: 5.65, h: 5.95 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5,
    y: 1.55,
    w: 6.4,
    h: 4.85,
    fill: { color: WHITE },
    line: { color: LINE },
    rectRadius: 0.12
  });
  s.addText("Demo accounts (this deployment only)", {
    x: 0.7,
    y: 1.7,
    w: 6,
    h: 0.35,
    fontFace: "Calibri",
    fontSize: 15,
    color: INK,
    bold: true
  });
  s.addTable(
    [
      [
        { text: "Role", options: { bold: true, color: INK } },
        { text: "Cell number", options: { bold: true, color: INK } },
        { text: "Password", options: { bold: true, color: INK } }
      ],
      ["Admin", "07000000001", "AdminPass1"],
      ["Cell leader", "07000000002", "LeaderPass1"],
      ["Member", "07000000004", "MemberPass1"]
    ],
    {
      x: 0.7,
      y: 2.15,
      w: 6.0,
      h: 2.1,
      colW: [1.7, 2.2, 2.1],
      border: [{ pt: 0 }, { pt: 0 }, { pt: 0.5, color: LINE }, { pt: 0 }],
      fontFace: "Calibri",
      fontSize: 14,
      color: INK,
      valign: "middle"
    }
  );
  s.addText("Admin sees every page. Cell leaders see Insights for their own cell, pending review, and their members. Members see the calendar, bookings, and Attend.", {
    x: 0.7,
    y: 4.4,
    w: 6.0,
    h: 1.6,
    fontFace: "Calibri",
    fontSize: 15,
    color: SOFT
  });
  footer(s, 2);
}

// 3 — Calendar
{
  const s = slide();
  heading(s, "Find an event");
  s.addText("Month, week and day follow the date you pick. All types and Any format clear the filter. The map stays on the page.", {
    x: 0.5,
    y: 0.85,
    w: 12.3,
    h: 0.4,
    fontFace: "Calibri",
    fontSize: 16,
    color: SOFT
  });
  s.addImage({ path: shot("calendar-today.png"), x: 0.5, y: 1.35, w: 7.4, h: 5.5 });
  s.addImage({ path: shot("calendar-map.png"), x: 8.05, y: 1.35, w: 4.8, h: 3.55 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.05,
    y: 5.05,
    w: 4.8,
    h: 1.8,
    fill: { color: WHITE },
    line: { color: LINE },
    rectRadius: 0.1
  });
  s.addText(
    [
      { text: "Try: ", options: { bold: true, color: INK } },
      { text: "Week and Day for today. Christian, then All types. Online, then Any format — the map should still be there.", options: { color: SOFT } }
    ],
    { x: 8.2, y: 5.2, w: 4.5, h: 1.5, fontFace: "Calibri", fontSize: 14 }
  );
  footer(s, 3);
}

// 4 — Event
{
  const s = slide();
  heading(s, "Attend, then confirm");
  s.addImage({ path: shot("event.png"), x: 0.5, y: 1.05, w: 7.6, h: 5.75 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.3,
    y: 1.15,
    w: 4.55,
    h: 5.55,
    fill: { color: WHITE },
    line: { color: LINE },
    rectRadius: 0.12
  });
  const points = [
    ["Attend", "Records that you plan to go. Capacity is checked."],
    ["Did you go?", "After the event, say whether you went. That is attendance, not the click."],
    ["Star", "A bookmark. It drops after the event ends."],
    ["Who sees names", "Admin chooses count only, initials, or name + cell."]
  ];
  points.forEach(([title, body], i) => {
    const y = 1.4 + i * 1.25;
    s.addText(title, { x: 8.5, y, w: 4.15, h: 0.32, fontFace: "Georgia", fontSize: 18, color: TERRACOTTA, bold: true });
    s.addText(body, { x: 8.5, y: y + 0.32, w: 4.15, h: 0.7, fontFace: "Calibri", fontSize: 15, color: SOFT });
  });
  footer(s, 4);
}

// 5 — Insights
{
  const s = slide();
  heading(s, "Insights (admin and cell leaders)");
  s.addText("Same numbers on the page, in the file, and in a short share. Cells with fewer than three people show as <3.", {
    x: 0.5,
    y: 0.85,
    w: 12.3,
    h: 0.4,
    fontFace: "Calibri",
    fontSize: 16,
    color: SOFT
  });
  s.addImage({ path: shot("insights-kpis.png"), x: 0.5, y: 1.35, w: 6.7, h: 5.5 });
  s.addImage({ path: shot("insights-share.png"), x: 7.4, y: 1.35, w: 5.45, h: 5.5 });
  footer(s, 5);
}

// 6 — What to try
{
  const s = slide();
  heading(s, "What to try  ·  what this is not");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5,
    y: 1.05,
    w: 6.2,
    h: 5.7,
    fill: { color: WHITE },
    line: { color: LINE },
    rectRadius: 0.12
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.95,
    y: 1.05,
    w: 5.85,
    h: 5.7,
    fill: { color: WHITE },
    line: { color: LINE },
    rectRadius: 0.12
  });
  s.addText("Please try", {
    x: 0.75,
    y: 1.25,
    w: 5.7,
    h: 0.4,
    fontFace: "Georgia",
    fontSize: 20,
    color: TERRACOTTA,
    bold: true
  });
  s.addText(
    [
      { text: "Week and Day show this week’s / today’s events.", options: { breakLine: true } },
      { text: "Christian, then All types, restores every type.", options: { breakLine: true } },
      { text: "The map is still there after Online, then Any format.", options: { breakLine: true } },
      { text: "Attend as a member. Confirm later if asked.", options: { breakLine: true } },
      { text: "Add an event: place on the map, Event Link, publish — you should land back on pending.", options: { breakLine: true } },
      { text: "Insights: download CSV, copy the summary. Members should not see Insights." }
    ],
    { x: 0.75, y: 1.8, w: 5.7, h: 4.6, fontFace: "Calibri", fontSize: 16, color: INK, paraSpaceAfter: 10 }
  );
  s.addText("Not in this phase", {
    x: 7.2,
    y: 1.25,
    w: 5.4,
    h: 0.4,
    fontFace: "Georgia",
    fontSize: 20,
    color: TERRACOTTA,
    bold: true
  });
  s.addText(
    [
      { text: "Public sign-up, email or SMS from Gather, member password reset.", options: { breakLine: true } },
      { text: "Live website scrape (fixtures only).", options: { breakLine: true } },
      { text: "Phone-first redesign (section 16) — this demo is the cream paper look.", options: { breakLine: true } },
      { text: "Share opens your own app. Gather does not send the message.", options: { breakLine: true } },
      { text: "Sign-off on docs/FUNCTIONAL.md is still for Guillaume." }
    ],
    { x: 7.2, y: 1.8, w: 5.4, h: 4.6, fontFace: "Calibri", fontSize: 16, color: INK, paraSpaceAfter: 10 }
  );
  footer(s, 6);
}

const out = join(root, "Gather-tester-guide.pptx");
await pres.writeFile({ fileName: out });
console.log(`Wrote ${out}`);
