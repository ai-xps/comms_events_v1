# Gather — closed calls

## UI restyle (visual only)

Parish-noticeboard surface: cream paper, ink, terracotta accent; Fraunces + Source Sans 3. Current nav = 2px terracotta underline (never a filled black pill). At ≤700px the header is wordmark | Menu | Sign out; Menu opens a slide-down panel of the same role-scoped links (Esc + outside click close; focus returns to Menu). Selected chips: white fill, 1.5px terracotta border. Spacing scale `--space-1`…`--space-6` = 4 / 8 / 12 / 16 / 24 / 32px; cards radius 22px, shadow `0 2px 10px rgba(28,22,18,0.06)`. Leaflet uses terracotta `circleMarker`s in a `.map-card` below the calendar with `isolation: isolate`. Attendance dialog is letter-on-desk (dim overlay, equal-width Attended / Didn’t attend). No booking, role, route, or API changes.

Where `context.md` and the discovery-document comments disagree, this build follows the values below. See `context.md` section 15 for the source threads.

| Call | Decision | Why |
| --- | --- | --- |
| Passwords | Stored only as bcrypt hashes. An admin sets or replaces a password and never reads one back. | Reply [c] asked for plain text so the team can set passwords and load the existing structure. Setting the password at create time, replacing it later, and telling the cell leader the new password meets that need. Readable storage does not. |
| Login | `cellNumber` is a unique personal number (digits after stripping spaces, dashes, and brackets). The group is `cellId`. The login screen is a dropdown of **active** cell numbers (no names) plus a typed password. | D01. Testers 17 Oct evening asked for a dropdown. **Trade-off:** anyone who opens `/login` can see every active number. Closed demo only. |
| Import columns | Name, Cell number, Cell, Password, Permission. Permission is `admin`, `cell leader`, or `member`. | Reply [i]. |
| Accounts | Admin creates every account. Password is given to the cell leader. No public sign-up and no invite. | Reply [g]. Comment [a] (drop cells for an invite list) has no reply and is not adopted. |
| Member attendee view | Default `COUNT`. Admin may switch to `COUNT_AND_INITIALS` or `COUNT_AND_NAME_CELL`. With `COUNT_AND_NAME_CELL`, every member sees the name and cell number of everyone booked on that event. | Reply [e] points at the written privacy toggle. Guillaume asked for the name + cell choice on 16 October (`context.md` section 17, G1). Default stays `COUNT` because Rebecca asked for numbers without identities and the default is not agreed. |
| Manual event location | Place is free text. Find on map (Nominatim, Birmingham viewbox) or click the map. Coordinates stay behind details. Scraped coordinates are kept as pulled. Online sits next to Event Link. | Guillaume G2 plus 17 Oct evening: address or pin, not lat/lng first. Nominatim is best-effort, OSM usage, no paid geocoder. |
| Event Link | The host page field is labelled Event Link. Stored as `externalUrl`. | Guillaume, 16 October (G3). Label change only, no schema change. |
| Pending review flow | Save, publish, discard, or Back on a pending event returns to `/pending`. The queue is grouped by London day as tiles. | Guillaume G4; 17 Oct evening tiles-by-day. |
| Exports | Ignore the member display setting. Admin: every booking. Cell leader: own cell only. Members: 403. | A cell leader needs names for reporting (F07). |
| Attend vs confirm vs star | Attend records intent. Later confirmation records that they went. Stars are a separate bookmark, dropped when the event has ended. | Reply [q], plus the existing alpha. |
| Region | This deployment is Birmingham only. `locationLabel` is kept for a later copy. | Reply [k]. |
| Scraper schedule | Daily at 05:00 Europe/London, plus a manual run. | Reply [m]. |
| Scraper sources | Demo harvest (`fixture-` keys) runs unless `SCRAPE_FIXTURES=0`. Admin Priority URLs must be https on the host allowlist (no `.ics` wildcard). Caps: 512 KiB body, 200 events per URL, 500 per run. Private/loopback IPs blocked (loopback only in non-production). Discarded rows stay discarded. A later form Save sets `humanEditedAt` and the scrape skips those fields; Publish alone does not freeze. Unclassified live events stay pending even if Meetup is off or the org is whitelisted. Empty URL list or `SCRAPE_LIVE=0` skips the network. | 17 Oct scraper-final: freeze, caps, atomic lock, settings reject bad URLs. |
| Filters | Christian, Networking, Professional, Student, Meetup. More than one type can be on (`types=`). Online or in person is a stored field, not a new category. Month/Week/Day are view tabs, not type chips. | Reply [o]; tester 17 Oct evening multi-select. |
| Scope | `context.md` section 3 only. No second problem. | Prompt. |
| Calendar navigation | Day and week follow `d=YYYY-MM-DD` (default today). Previous/Next step by the current view. The map stays visible with zero pins. | Tester feedback, 17 October (`context.md` section 18). |
| Security headers | CSP as in `next.config.ts`, HSTS, nosniff, frame deny, strict-origin-when-cross-origin, Permissions-Policy off for camera/mic/geo. `script-src` keeps `'unsafe-inline'` because of Next hydration. Event Link is http(s) only. | Review 17 October. Nonce-based CSP is production-hardening work. |
| Sessions | Signed cookie carries `sessionVersion`. Logout, password reset and deactivation bump it, which signs the person out everywhere. | Review 17 October. Trade-off: one logout ends every device. |
| Insights access | Admin: region, optional cell. Cell leader: own cell. Members: no page. | Product call 17 October. |
| Insights sharing | Share drop-down opens the person’s own app (WhatsApp, Email, Teams, Telegram, Copy, device share). Totals only, no names. D02 unchanged. | Product call 17 October. |
| Export formats | Insights and attendee files: CSV, TXT, JSON, XLSX. Reports also export **event details** for a date range (CSV/Excel). Formula-looking cells are prefixed. | F07 plus 17 October Insights work; tester 17 Oct evening range export. |
