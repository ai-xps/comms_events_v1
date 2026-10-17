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
| Member attendee view | Default `COUNT`. Admin may switch to `COUNT_AND_INITIALS` or `COUNT_AND_NAME_CELL`. With `COUNT_AND_NAME_CELL`, every member sees the name and cell number of everyone booked on that event. | Reply [e] points at the written privacy toggle. Guillaume asked for the name + cell choice on 16 October (`context.md` section 17, G1). Default stays `COUNT` because Rebecca asked for numbers without identities and the default is not agreed. |
| Manual event location | Place is free text. Admin and cell leaders click a map on the event form to set latitude and longitude. Scraped coordinates are kept as pulled. No address lookup. | Guillaume, 16 October (G2). A geocoding service would add a third-party dependency and cost; the map click needs neither. |
| Event Link | The host page field is labelled Event Link. Stored as `externalUrl`. | Guillaume, 16 October (G3). Label change only, no schema change. |
| Pending review flow | Publishing or discarding a pending event returns the reviewer to `/pending`. | Guillaume, 16 October (G4). |
| Exports | Ignore the member display setting. Admin: every booking. Cell leader: own cell only. Members: 403. | A cell leader needs names for reporting (F07). |
| Attend vs confirm vs star | Attend records intent. Later confirmation records that they went. Stars are a separate bookmark, dropped when the event has ended. | Reply [q], plus the existing alpha. |
| Region | This deployment is Birmingham only. `locationLabel` is kept for a later copy. | Reply [k]. |
| Scraper schedule | Daily at 05:00 Europe/London, plus a manual run. Fixture provider only. | Reply [m]. Live HTTP scraping is out of this build. |
| Filters | Christian, Networking, Professional, Student, Meetup. Online or in person is a stored field, not a new category. | Reply [o]. |
| Scope | `context.md` section 3 only. No second problem. | Prompt. |
| Calendar navigation | Day and week follow `d=YYYY-MM-DD` (default today). Previous/Next step by the current view. The map stays visible with zero pins. | Tester feedback, 17 October (`context.md` section 18). |
| Security headers | CSP as in `next.config.ts`, HSTS, nosniff, frame deny, strict-origin-when-cross-origin, Permissions-Policy off for camera/mic/geo. `script-src` keeps `'unsafe-inline'` because of Next hydration. Event Link is http(s) only. | Review 17 October. Nonce-based CSP is production-hardening work. |
| Sessions | Signed cookie carries `sessionVersion`. Logout, password reset and deactivation bump it, which signs the person out everywhere. | Review 17 October. Trade-off: one logout ends every device. |
| Insights access | Admin: region, optional cell. Cell leader: own cell. Members: no page. | Product call 17 October. |
| Insights sharing | Share drop-down opens the person’s own app (WhatsApp, Email, Teams, Telegram, Copy, device share). Totals only, no names. D02 unchanged. | Product call 17 October. |
| Export formats | Insights and attendee files: CSV, TXT, JSON, XLSX. Formula-looking cells are prefixed. | F07 plus 17 October Insights work. |
