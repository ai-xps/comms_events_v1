# Film guide — keep Gather (for the person recording)

This page is **for you** while you film. The shareable page for viewers is [`keep-gather.html`](keep-gather.html) (open in a browser; send the file or host it).

Picture: one chapter = one take. Pause. Breathe. Then the next chapter.

---

## Free ways to record this MacBook Pro

Pick **one**. All three are free.

| Tool | Cost | Best for | How to start |
| --- | --- | --- | --- |
| **Screenshot toolbar** | Built in | Short takes, easy mic | `⌘⇧5` → **Record Entire Screen** or **Record Selected Portion** → Options → choose microphone |
| **QuickTime Player** | Built in | Simple full-screen demos | Open QuickTime → **File → New Screen Recording** → dropdown beside record → pick mic → Record |
| **OBS Studio** | Free ([obsproject.com](https://obsproject.com)) | Longer film, scenes, webcam corner | Add **Display Capture** + **Audio Input Capture** → Start Recording |

**Recommendation for this tutorial:** start with **`⌘⇧5`**. It is enough. Switch to OBS only if you want a small face cam or many scene cuts.

**Sound tips**

- Use the MacBook mic in a quiet room, or AirPods / a simple USB mic.  
- Speak slightly slower than normal. Pause after each number.  
- Do a 10-second test: record, play back, check level (not whisper, not shout).

**Do not record**

- Passwords, seed output, `.env` contents, real member names.  
- If a secret flashes: stop, cut that take, or blur in iMovie / Preview later.

---

## Windows and websites to have open (before take 1)

Set these up once. Then hide what you do not need for each take.

### Always ready

| Slot | What | Exact thing to open |
| --- | --- | --- |
| A | Browser tab 1 | GitHub project: your filled `PROJECT_URL` from [`project.md`](project.md) (sample demo: `https://github.com/ai-xps/comms_events_v1`) |
| B | Browser tab 2 | This film guide (or a printed voice sheet) — **not** on camera |
| C | Browser tab 3 | [`keep-gather.html`](keep-gather.html) opened as a file (`File → Open File…`) — show near the end |
| D | Cursor | Folder = Gather project on `experiment` / `WORK_LINE` |
| E | Terminal | Cursor’s built-in terminal is fine (one window, large font) |
| F | Local app (later takes) | http://localhost:3000 — only after you have run `npm run dev` |
| G | Live shop (owners only) | https://132.145.68.166.sslip.io — Oracle takes only |

### Desktop hygiene (makes the film look calm)

1. Close Slack / Mail / Calendar popovers.  
2. Hide the Dock for recording if you like: **System Settings → Desktop & Dock → automatically hide**.  
3. In Cursor: increase editor font a notch; hide unused sidebars; Chat panel visible only when you talk about the helper.  
4. In the browser: zoom **125%** for GitHub and the local app so text reads on a phone later.  
5. Use a clean desktop wallpaper (solid or soft blush — no busy photos).  
6. Notification focus: turn on **Do Not Disturb** / Focus.

### On-screen layout (suggested)

```
┌─────────────────────────────┬──────────────────┐
│  Cursor (editor + terminal) │  Browser         │
│  ~60% width                 │  GitHub or app   │
│                             │  ~40% width      │
└─────────────────────────────┴──────────────────┘
```

For “paste into Cursor” takes: Chat panel open, browser showing the step on [`keep-gather.html`](keep-gather.html) or this guide off-camera.

---

## Film order (what goes in the video)

Film in this order. You can cut between takes in iMovie (free on the Mac) later.

| Take | Title on camera | Windows in frame | Approx. length |
| --- | --- | --- | --- |
| 0 | Title card (optional) | `keep-gather.html` hero, or say “Gather — keeping the notebook” | 10–15 s |
| 1 | What this is | Browser: GitHub repo home | 45–60 s |
| 2 | Your login vs the team home | Browser: GitHub (signed in as you) | 45 s |
| 3 | Tools on the counter | Cursor + Terminal (`git --version`, `node --version`) | 40 s |
| 4 | Copy onto this laptop | Terminal clone **or** already-open folder + `git status` | 60 s |
| 5 | Private settings | Show `.env.example` only — **never** filled `.env` | 40 s |
| 6 | Open the shop on this laptop | Terminal commands → browser localhost sign-in | 75 s |
| 7 | You decide; helper helps | Cursor Chat (Agent) — paste a **plan only** prompt | 60 s |
| 8 | Three words: save, share, check | Browser GitHub + short gestures | 60 s |
| 9 | A normal work day | Terminal pull → small talk of a fix → tests | 90 s |
| 10 | Ask for a check | Browser: Pull requests tab (demo or empty list OK) | 45 s |
| 11 | Live shop (owners) — optional | SSH terminal blurred host OK; then live URL | 75 s |
| 12 | Shareable guide | Full screen `keep-gather.html` — scroll steps + questions | 45 s |
| 13 | Soft close | Same HTML or GitHub | 20 s |

**Skip take 11** if the audience is not An / Guillaume. Say “owners update the live shop later” and move on.

---

## Voice readout (say this out loud)

Read one take at a time. If you stumble, stop and re-record that take only.

### Take 0 — title

> Welcome. This is how we keep Gather — our shared community calendar — safe and tidy on GitHub and on your laptop.

### Take 1 — what this is

> Gather’s code lives in a shared notebook on GitHub.  
> GitHub is the website shelf. Your laptop holds your own copy.  
> Cursor is the editor with a chat helper. You stay in charge of what gets saved and posted.  
> Today we walk the path in order: accounts, tools, copy, run, then the daily loop.

### Take 2 — your login vs the team home

> Two different things.  
> First: your own GitHub login — your house key. Never share it.  
> Second: the central team home that owns the project. Everyone is invited there.  
> All day-to-day changes go through that one address. Do not invent a second main copy for the team.

### Take 3 — tools

> Before we cook, tools on the counter.  
> Cursor. Git — that saves a history of every change. Node — that runs the app.  
> In the terminal I check the versions. When both reply with a number, we are ready.

### Take 4 — copy

> Clone means photocopy the shared notebook onto this desk.  
> We clone the daily line — usually called experiment — not main.  
> Then File, Open Folder, and choose Gather.  
> Git status should say we are on experiment.

### Take 5 — private settings

> We copy the example settings file to a private file named .env.  
> That file holds locks for this laptop only — like spare keys in a kitchen drawer.  
> We never show the filled file on camera. We never commit it. We never paste it into chat.

### Take 6 — first local run

> Install, prepare the local data file, seed once, then start the app.  
> Open localhost three thousand.  
> The sign-in page means the shop door opened on this laptop.  
> Seed passwords appear once in the terminal. We do not read them aloud. We do not put them in the film.

### Take 7 — helper

> Open chat in Agent mode.  
> I ask for a short plan first — no file edits yet.  
> The helper may suggest changes. I decide.  
> Commit, push, and pull request only happen when I say those words.

### Take 8 — three words

> Save — write today’s page in your notebook. That is a commit.  
> Share — post the page to the GitHub shelf. That is a push.  
> Ask for a check — leave a note for review. That is a pull request.  
> Daily work stays on experiment. Main stays quiet until a human asks.

### Take 9 — normal day

> Every work day: get other people’s pages first — pull with a fast-forward only.  
> Name one small job in plain words.  
> Smallest change. Then run the tests and the type check.  
> If people will notice, add one line to the changelog.

### Take 10 — ask for a check

> After share, open Pull requests on the project page.  
> Base the letter on experiment.  
> Write a short summary and a test plan.  
> Comments show your name. Be kind and specific.

### Take 11 — live shop (owners only)

> Oracle is the rented computer that serves the public site.  
> SSH is the spare shop key.  
> Code must already be on the shelf.  
> We connect, pull experiment, rebuild, restart Gather, then hard-refresh the live page.  
> We do not push this build to Railway while Railway still expects the old database.  
> We never show the private key or the server .env on camera.

### Take 12 — shareable guide

> This page is the same path in a calm layout — numbered steps and a long “when something feels stuck” section.  
> Open it in any browser. Share the file with the team.  
> It matches what you just saw on film.

### Take 13 — close

> One step at a time. You say save, share, and check.  
> If anything looks destructive: git status, paste the exact message into Cursor, and wait.  
> Thanks for keeping Gather tidy.

---

## Crisp screenshots and still pictures

Use these for slides, the HTML page later, or WhatsApp tips. Same hygiene as the film.

### Capture

1. **`⌘⇧4`** — drag a tight rectangle (best). **`⌘⇧3`** — whole screen (usually too much chrome).  
2. Or **`⌘⇧5`** → Capture Selected Portion.  
3. Prefer one window, not overlapping mess.  
4. Browser zoom **125%**. Cursor font large enough to read on a phone.  
5. Capture on the Retina screen at full size. Do **not** shrink then enlarge later (blurry).  
6. Hide the personal bookmark bar if it shows private tabs.

### After capture (Preview — free)

1. Open the PNG in **Preview**.  
2. **Markup** → rectangle or blur over any secret.  
3. Crop to the useful area (title + the one action).  
4. Export as PNG. Keep filenames plain: `01-github-home.png`, `06-localhost-signin.png`.

### What “nice” looks like

- One idea per image.  
- Soft Gather blush around the subject is fine; avoid busy wallpapers in frame.  
- Same browser width across a sequence so the eye does not jump.  
- No red error text unless the take is “what failure looks like.”  
- Never: passwords, `.env`, real cell numbers, real names.

### Optional polish (still free)

- **Preview** for crop + blur.  
- **Keynote** or **Pages** to place stills on a blush slide, then export images.  
- Avoid heavy filters; crisp and true is better than “designed.”

---

## Checklist five minutes before record

- [ ] Focus / Do Not Disturb on  
- [ ] Mic test played back  
- [ ] GitHub signed in as **you**  
- [ ] Cursor on `experiment`, folder correct  
- [ ] No `.env` visible; seed passwords not in scrollback you will show  
- [ ] `keep-gather.html` opens locally  
- [ ] Voice sheet (this page) on a second device or printed  
- [ ] Water nearby; phone silenced  

---

## After the film

1. Trim silence in **iMovie** (free) or keep raw takes if short.  
2. Upload where the team agrees (not into the git repo unless an owner asks — videos are large).  
3. Point people to [`keep-gather.html`](keep-gather.html) for the written walk.  
4. Recipe shelf stays in [`README.md`](README.md).
