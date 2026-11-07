/**
 * Thin Apple/tech stakeholder export for Canva drop-in.
 * Run: npm run deck:stakeholder
 *
 * No cell numbers, passwords, or member secrets.
 */
import PptxGenJS from "pptxgenjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const shot = (name) => join(root, "shots", name);

const PAPER = "F5F5F7";
const WHITE = "FFFFFF";
const INK = "1D1D1F";
const SOFT = "6E6E73";
const LINE = "D2D2D7";
const ACCENT = "0071E3";
const DARK = "1D1D1F";

const GITHUB = "https://github.com/ai-xps/comms_events_v1";
const RAILWAY = "https://commseventsv1-production.up.railway.app";

const pres = new PptxGenJS();
pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pres.layout = "WIDE";
pres.author = "Gather";
pres.title = "Gather — stakeholder";
pres.subject = "Birmingham community events";

function slide(bg = PAPER) {
  const s = pres.addSlide();
  s.background = { color: bg };
  return s;
}

function footer(s, n, total = 6) {
  s.addText("Gather  ·  Birmingham", {
    x: 0.5,
    y: 7.12,
    w: 10.5,
    h: 0.22,
    fontFace: "Calibri",
    fontSize: 11,
    color: SOFT
  });
  s.addText(`${n} / ${total}`, {
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
    y: 0.32,
    w: 12.3,
    h: 0.5,
    fontFace: "Calibri",
    fontSize: 28,
    color: INK,
    bold: true
  });
}

function panel(s, x, y, w, h, fill = WHITE) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: LINE },
    rectRadius: 0.1
  });
}

// 1 Title
{
  const s = slide();
  s.addText("Gather", {
    x: 0.5,
    y: 2.2,
    w: 12.3,
    h: 0.9,
    fontFace: "Calibri",
    fontSize: 54,
    color: INK,
    bold: true
  });
  s.addText("Closed Birmingham community calendar", {
    x: 0.5,
    y: 3.2,
    w: 12.3,
    h: 0.4,
    fontFace: "Calibri",
    fontSize: 22,
    color: SOFT
  });
  s.addText(RAILWAY, {
    x: 0.5,
    y: 4.0,
    w: 12.3,
    h: 0.35,
    fontFace: "Calibri",
    fontSize: 16,
    color: ACCENT
  });
  footer(s, 1);
}

// 2 Problem
{
  const s = slide();
  heading(s, "Problem — live role-play");
  panel(s, 0.5, 1.1, 5.9, 5.4);
  panel(s, 6.9, 1.1, 5.9, 5.4);
  s.addText("Member", {
    x: 0.75,
    y: 1.3,
    w: 5.4,
    h: 0.35,
    fontFace: "Calibri",
    fontSize: 18,
    color: ACCENT,
    bold: true
  });
  s.addText(
    "Which event tonight? Who’s going? Chat says maybe — but was it vetted? Afterward: who was actually there?",
    {
      x: 0.75,
      y: 1.9,
      w: 5.4,
      h: 4.0,
      fontFace: "Calibri",
      fontSize: 18,
      color: INK
    }
  );
  s.addText("Cell leader", {
    x: 7.15,
    y: 1.3,
    w: 5.4,
    h: 0.35,
    fontFace: "Calibri",
    fontSize: 18,
    color: ACCENT,
    bold: true
  });
  s.addText(
    "Listings appear from the web. Some need review. Members book late or offline. We need one controlled place.",
    {
      x: 7.15,
      y: 1.9,
      w: 5.4,
      h: 4.0,
      fontFace: "Calibri",
      fontSize: 18,
      color: INK
    }
  );
  footer(s, 2);
}

// 3 Requirements loop
{
  const s = slide(DARK);
  s.addText("Requirements loop", {
    x: 0.5,
    y: 0.32,
    w: 12.3,
    h: 0.5,
    fontFace: "Calibri",
    fontSize: 28,
    color: WHITE,
    bold: true
  });
  const steps = [
    { t: "Scope &\nstories", x: 0.4 },
    { t: "AI\ncapture", x: 2.85 },
    { t: "Req\ndoc", x: 5.3 },
    { t: "AI app\ngenerator", x: 7.75 },
    { t: "Validate", x: 10.2 }
  ];
  steps.forEach((step, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: step.x,
      y: 2.2,
      w: 2.2,
      h: 1.6,
      fill: { color: "2C2C2E" },
      line: { color: ACCENT },
      rectRadius: 0.1
    });
    s.addText(step.t, {
      x: step.x,
      y: 2.55,
      w: 2.2,
      h: 1.0,
      fontFace: "Calibri",
      fontSize: 16,
      color: WHITE,
      align: "center",
      bold: true
    });
    if (i < steps.length - 1) {
      s.addText("→", {
        x: step.x + 2.15,
        y: 2.7,
        w: 0.5,
        h: 0.5,
        fontFace: "Calibri",
        fontSize: 22,
        color: ACCENT,
        align: "center"
      });
    }
  });
  s.addText("Validate loops back into capture.", {
    x: 0.5,
    y: 4.2,
    w: 12.3,
    h: 0.35,
    fontFace: "Calibri",
    fontSize: 16,
    color: "A1A1A6"
  });
  s.addText(GITHUB, {
    x: 0.5,
    y: 5.0,
    w: 12.3,
    h: 0.35,
    fontFace: "Calibri",
    fontSize: 16,
    color: ACCENT
  });
  try {
    s.addImage({ path: shot("calendar-month.png"), x: 9.6, y: 5.4, w: 3.2, h: 1.4 });
  } catch {
    /* optional thumb */
  }
  s.addText("Gather  ·  Birmingham", {
    x: 0.5,
    y: 7.12,
    w: 10.5,
    h: 0.22,
    fontFace: "Calibri",
    fontSize: 11,
    color: "A1A1A6"
  });
  s.addText("3 / 6", {
    x: 11.6,
    y: 7.12,
    w: 1.2,
    h: 0.22,
    fontFace: "Calibri",
    fontSize: 11,
    color: "A1A1A6",
    align: "right"
  });
}

// 4 Scenario titles
{
  const s = slide();
  heading(s, "Scenarios — demo on video or live");
  const cards = [
    { title: "Member", body: "Find event · see who’s going · Attend" },
    { title: "Cell leader", body: "Scrape · add · book · attendance" },
    { title: "Admin", body: "Whitelist · visibility · accounts" }
  ];
  cards.forEach((c, i) => {
    const x = 0.5 + i * 4.2;
    panel(s, x, 1.3, 3.9, 4.5);
    s.addText(c.title, {
      x: x + 0.25,
      y: 1.7,
      w: 3.4,
      h: 0.5,
      fontFace: "Calibri",
      fontSize: 24,
      color: ACCENT,
      bold: true
    });
    s.addText(c.body, {
      x: x + 0.25,
      y: 2.5,
      w: 3.4,
      h: 2.5,
      fontFace: "Calibri",
      fontSize: 18,
      color: INK
    });
  });
  footer(s, 4);
}

// 5 Next steps
{
  const s = slide();
  heading(s, "Next steps");
  const items = [
    "Improve UX from team feedback",
    "Finish testing (bugs + smoke)",
    "Team hosting — more than one person can deploy and change requirements",
    "Later: shared fonts, charts, templates, and Git standards across apps"
  ];
  items.forEach((text, i) => {
    panel(s, 0.5, 1.15 + i * 1.25, 12.3, 1.1);
    s.addText(`${i + 1}.  ${text}`, {
      x: 0.8,
      y: 1.4 + i * 1.25,
      w: 11.7,
      h: 0.6,
      fontFace: "Calibri",
      fontSize: 20,
      color: INK
    });
  });
  footer(s, 5);
}

// 6 Owners
{
  const s = slide();
  heading(s, "Owners · ask for 10 minutes");
  const owners = [
    { who: "Rebecca", what: "Problem role-play script · next-steps narrative" },
    { who: "Guillaume", what: "10-min ask · cell import · scenario videos · Canva" },
    { who: "An", what: "Product · GitHub · tech brief · loop visual" }
  ];
  owners.forEach((o, i) => {
    panel(s, 0.5, 1.2 + i * 1.5, 12.3, 1.3);
    s.addText(o.who, {
      x: 0.8,
      y: 1.4 + i * 1.5,
      w: 3,
      h: 0.4,
      fontFace: "Calibri",
      fontSize: 20,
      color: ACCENT,
      bold: true
    });
    s.addText(o.what, {
      x: 4,
      y: 1.4 + i * 1.5,
      w: 8.5,
      h: 0.8,
      fontFace: "Calibri",
      fontSize: 18,
      color: INK
    });
  });
  footer(s, 6);
}

await pres.writeFile({ fileName: join(root, "Gather-stakeholder.pptx") });
console.log("Wrote docs/presentation/Gather-stakeholder.pptx");
