# Gather — closed calls

## UI restyle (visual only)

Parish-noticeboard surface: cream paper, ink, terracotta accent; Fraunces + Source Sans 3. Current nav = 2px terracotta underline (never a filled black pill). At ≤700px the header is wordmark | Menu | Sign out; Menu opens a slide-down panel of the same role-scoped links (Esc + outside click close; focus returns to Menu). Selected chips: white fill, 1.5px terracotta border. Spacing scale `--space-1`…`--space-6` = 4 / 8 / 12 / 16 / 24 / 32px; cards radius 22px, shadow `0 2px 10px rgba(28,22,18,0.06)`. Leaflet uses terracotta `circleMarker`s in a `.map-card` below the calendar with `isolation: isolate`. Attendance dialog is letter-on-desk (dim overlay, equal-width Attended / Didn’t attend). No booking, role, route, or API changes.

Where `context.md` and the discovery-document comments disagree, this build follows the values below. See `context.md` section 15 for the source threads.

| Call | Decision | Why |
| --- | --- | --- |
| Passwords | Stored only as bcrypt hashes. An admin sets or replaces a password and never reads one back. | Reply [c] asked for plain text so the team can set passwords and load the existing structure. Setting the password at create time, replacing it later, and telling the cell leader the new password meets that need. Readable storage does not. |
| Login | `cellNumber` is a unique personal number (digits after stripping spaces, dashes, and brackets). The group is `cellId`. | D01 uses cell number as the identifier. Many people share a cell, so the group cannot be the login. |
| Import columns | Name, Cell number, Cell, Password, Permission. Permission is `admin`, `cell leader`, or `member`. | Reply [i]. |
| Accounts | Admin creates every account. Password is given to the cell leader. No public sign-up and no invite. | Reply [g]. Comment [a] (drop cells for an invite list) has no reply and is not adopted. |
| Member attendee view | Default `COUNT`. Admin may switch to `COUNT_AND_INITIALS`. Members never see names or cell numbers. | Reply [e] points at the written privacy toggle, not at comment [d]’s initials-only view. |
| Exports | Ignore the member display setting. Admin: every booking. Cell leader: own cell only. Members: 403. | A cell leader needs names for reporting (F07). |
| Attend vs confirm vs star | Attend records intent. Later confirmation records that they went. Stars are a separate bookmark, dropped when the event has ended. | Reply [q], plus the existing alpha. |
| Region | This deployment is Birmingham only. `locationLabel` is kept for a later copy. | Reply [k]. |
| Scraper schedule | Daily at 05:00 Europe/London, plus a manual run. Fixture provider only. | Reply [m]. Live HTTP scraping is out of this build. |
| Filters | Christian, Networking, Professional, Student, Meetup. Online or in person is a stored field, not a new category. | Reply [o]. |
| Scope | `context.md` section 3 only. No second problem. | Prompt. |
