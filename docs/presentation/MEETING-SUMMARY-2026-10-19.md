# Meeting summary — Rebecca W + Guillaume D (19 Oct 2026)

Source: Telegram `video1796138201.mp4` (~19 min). Speakers: **Rebecca W**, **Guillaume D**. Topic: stakeholder **presentation** for Gather (Philip Tribe / Birmingham events), not an Emil Kowalski talk.

Whisper ASR has name slips (`sell`→cell, `Genshin`/`Guinci`→community names, `Anhyung`→An). Intent below is corrected where clear.

## Verdict

Build a **short, diagram-led, slightly technical** talk (ask for **10 minutes**). Problem via **live role-play**. Requirements via **one flow diagram**. Scenarios via **videos** (Guillaume). Next steps via Rebecca. Aim to prep **same day**.

## What they agreed

### Presentation shape

1. **Keep it light** but a bit more technical than a department talk (audience is the AI team). Prefer **diagrams**, not dense text.
2. **Problem (~1 min) — live role-play** (not a prerecorded sketch). One member voice asking: which event tonight? Who’s going? Chat gossip vs reality; bad/unvetted listing; after the fact “who was there?” / wasted trip. Rebecca will **write the script**; can play member ↔ cell-leader dialogue.
3. **Requirements / design — one diagram slide**: scope & user stories → AI requirement capture → requirements doc → AI app generator → loop back to validate. Tiny doc thumbs OK; no reading the full stories aloud. Show **GitHub** address (how the app was built / shared).
4. **Scenarios — videos** (Guillaume records after loading cell structure):
   - **Member:** login → spot event → see who’s going → Attend → (optional) mark didn’t attend.
   - **Cell leader:** check week → scraper → add missing event → book a member → mark attendance for someone without signal.
   - **Admin:** keep simple — configure scrape / blacklist org / whitelist URL / which categories / attendee visibility (name vs initials vs cell); stress **admin creates accounts** (no public sign-up).
5. **Next steps (Rebecca):** improve UX; feedback (whitelist); finish testing / bugs; **team hosting** (more than one person can deploy / change requirements — not single-person support); later: shared fonts/charts/templates/Git standard for other apps.
6. **Ask Guillaume:** request **10 minutes** (5 is too tight). Presentation date still TBD (group chat).

### Owners (from the call)

| Who | Owns |
| --- | --- |
| Rebecca | Problem script; next-steps slide; flesh dialogue |
| Guillaume | Ask for 10 min; load cell structure into the tool; record three scenario videos; help requirements/GitHub diagram |
| An (implied) | App + GitHub; UX polish they can demo |

### Day-of

Someone who “played” member / leader / admin can **narrate** while videos play — not a click-by-click tutorial on slides.

## Suggestions → Gather (product + docs)

| Suggestion from call | Gather action |
| --- | --- |
| Diagram-first, tech-ish slides | Stakeholder Canva/deck: cool Apple/tech look; no tutorial walkthrough slides |
| Live role-play problem | Script in checklist; not forged as done |
| Requirements loop + GitHub | `requirements-loop.md` + GitHub URL on one slide |
| Scenario videos | Guillaume; live Railway as backup |
| Admin: scrape config, blacklist, visibility, closed accounts | Already in product — demo, don’t lecture |
| Load cell structure | Guillaume admin import |
| Team hosting / multi-deploy | Call out in next steps; not build in this pass |
| Finish testing / UX feedback | Smoke + open bugs; UX restyle if An ships Apple/tech pass |

## Not this video

This is **not** Emil Kowalski “Agents with Taste”. Emil skills for Gather remain in [`docs/EMIL-SKILLS.md`](../EMIL-SKILLS.md) (separate track).

## Artefacts

- Raw ASR: `.tmp-vid/transcript.txt` (local, gitignored)
- Related plan: stakeholder Apple/tech UX + Canva brief
