# Emil Kowalski design skills — how Gather uses them

Vendor copy of [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT — see [`.cursor/skills/EMIL-KOWALSKI-LICENSE.txt`](../.cursor/skills/EMIL-KOWALSKI-LICENSE.txt)).

A **skill** is a playbook in a drawer. The agent opens it when you ask (or when the task clearly matches). It is **not** always-on like `AGENTS.md` or teach-An.

## How to invoke

In Cursor Agent chat:

1. Type `/` and pick the skill name, **or**
2. Say clearly: “use the `mobile-native` skill” / “run `review-animations` on the calendar”.

Many of these skills start with a one-line “I’m ready…” reply until you ask a concrete question — that is intentional.

## Gather guardrails (always)

When any Emil skill is active on this repo:

- Keep **current product tokens** in `src/app/globals.css` (cool paper, system-blue accent, SF-style stack). Do not invent a second palette, purple SaaS, or §16 teal IA unless the user asks.
- Prefer **CSS** already in the app before adding Motion/Framer, Sonner, or other libraries (`pick-ui-library` → **Ask first**).
- Respect **reduced motion** and Karpathy simplicity: sometimes the right animation is **none**.
- Do not change booking, auth, or privacy behaviour for “feel”.

## Which skill when

| Skill | Use for Gather when… | Fit now |
| --- | --- | --- |
| `mobile-native` | Phone feels like a website: taps, zoom on inputs, safe-area, sticky hover | **High** |
| `animate` | You ask to add a specific web motion (dialog, chip press) | Medium |
| `animation-performance` | Motion stutters / janks on a real phone | Medium |
| `review-animations` | Review a motion PR or CSS transitions | Medium |
| `improve-animations` / `find-animation-opportunities` | Audit the whole UI for motion work | Low unless asked |
| `animation-vocabulary` | “What’s the name of that bounce when…” | Anytime |
| `emil-design-eng` / `break-ui` / `apple-design` | Taste / craft pass on UI | Medium — keep parish tokens |
| `prototype` | Explicitly want several UI variants to compare | Ask first |
| `ask-sonner` | Adding toast notifications | Ask first (Gather uses banners today) |
| `pick-ui-library` | Choosing a dependency | Ask first; prefer existing stack |
| `animate-expo` / `write-swift` | React Native / Swift | **Low** (Gather is Next.js web) |

## Example prompts

- “Use **mobile-native**: fix calendar Menu and form inputs so iPhone doesn’t zoom / feel sticky.”
- “Use **animate**: Attend button press feedback, current product tokens only, CSS if possible.”
- “Use **review-animations** on `AttendancePrompt` and the dialog CSS.”
- “Use **animation-vocabulary**: what’s the name for staggered list cards appearing?”

## Not a substitute for

- Product rules → `AGENTS.md`, `DECISIONS.md`
- Teaching An → `.cursor/rules/teach-an.mdc`
- Live role smoke → `.cursor/skills/gather-smoke`
