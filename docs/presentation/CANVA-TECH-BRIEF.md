# Canva tech brief — Gather stakeholder talk

Day-of deck lives in **Guillaume / Rebecca Canva** (not the cream tester pptx). Paste these colours and beats; keep slides **story + diagrams**, not click-by-click tutorials.

## Visual system (match the live app)

| Token | Hex | Use |
| --- | --- | --- |
| Paper | `#F5F5F7` | Slide background |
| White | `#FFFFFF` | Cards / panels |
| Ink | `#1D1D1F` | Titles and body |
| Soft | `#6E6E73` | Secondary text |
| Line | `#D2D2D7` | Hairline borders |
| Accent | `#0071E3` | Links, CTAs, diagram emphasis |
| Dark panel | `#1D1D1F` | Optional flow diagram on dark |

Type: system / SF-style sans (Canva: Inter is fine as a stand-in; avoid ornate serif for this deck). Wide margins, little prose, lots of air.

## Beats (≤6 slides)

1. **Title** — Gather · closed Birmingham calendar · [Railway demo](https://commseventsv1-production.up.railway.app)
2. **Problem** — cue for **live role-play** (Rebecca script). Member vs chaos of chat / unvetted events / “who was there?” — quotes only, not steps.
3. **Requirements loop** — one diagram (see [`requirements-loop.md`](requirements-loop.md)) + GitHub `https://github.com/ai-xps/comms_events_v1`
4. **Scenarios** — three **titles** only: Member · Cell leader · Admin (videos or live demo carry the how-to)
5. **Next steps** — UX feedback · finish testing · **team hosting** (multi-person deploy) · shared fonts/charts/templates/Git later
6. **Owners / ask** — An / Becca / Guillaume · ask for **10 minutes**

## Do not put on slides

Cell numbers, passwords, seed accounts, member names from production, or tutorial “click here then here” walkthroughs.

## Export pack

Rebuild with `npm run deck:stakeholder` → `Gather-stakeholder.pptx` (same palette; drop frames into Canva if useful).
