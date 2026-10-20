# Agent lessons

One mistake → one rule. Newest first. Keep lines short.

| Date | Mistake | Rule to prevent it |
| --- | --- | --- |
| 2026-10-20 | Shared-cell passwords checked with bcrypt against *every* user; Origin-only CSRF blocked some browser POSTs | Scope password uniqueness to the same `cellNumber`; allow Referer / `Sec-Fetch-Site: same-origin` when Origin is missing. |
| 2026-10-19 | Dumping motion libraries / teal redesign while “using Emil skills” | Emil skills = on demand; keep current product tokens; ask before new UI deps (`docs/EMIL-SKILLS.md`). |
| 2026-10-19 | “Password required” with only `if (!password)` | Trim first — whitespace-only strings are truthy in JS. |
| 2026-10-18 | Assumed Ask mode could write files / commit | If Ask mode: explain only; tell the user to switch to Agent to apply. |
| 2026-10-17 | Login page prerendered at Railway image build (no Postgres) | Pages that need DB at request time: `export const dynamic = "force-dynamic"`. |
| 2026-10-17 | Leftover Meetup Priority URL 400'd whole settings save | Drop disallowed URLs; save the rest; tell the admin. |

When the user corrects you, add a row here before ending the turn.
