# Gather — what it does

Closed calendar for one Birmingham community. Accounts are created by an admin. Members sign in with a cell number and password. Cell leaders review a pending queue and look after their own cell.

This is not a signed specification. Rows marked **Awaiting sign-off** have no recorded agreement in the chat or documents.

Applied: 17 October 2026, `experiment` branch. Live smoke on https://commseventsv1-production.up.railway.app the same day.

## Accounts and sign-in

| What it does | Who | Agreed by | Why |
| --- | --- | --- | --- |
| Admin creates every account (form or file). No public sign-up. | Admin | Discovery reply [g]; D05 | Stops a member picking the wrong cell. |
| Sign-in is cell number + password. Passwords stored as bcrypt hashes. Admin sets or replaces; never reads back. | Everyone | D01; architecture sketch; `DECISIONS.md` | Identifier without email. Hashing over plain text. |
| Roles: admin, cell leader, member. | Admin | Import columns reply [i] | Matches the existing structure. |
| Logout, password reset and deactivation sign the person out everywhere. | Everyone | Review 17 Oct | A copied cookie must not keep working. |
| Login `next=` only accepts a path on this app. | Everyone | Review 17 Oct | Stops a crafted link sending someone to a lookalike site. |

## Calendar

| What it does | Who | Agreed by | Why |
| --- | --- | --- | --- |
| Month, week and day. Filters: type and online/in person. Colour by type. | Everyone | Requirements; reply [o]; tester 17 Oct | Find an event, then Attend. |
| Day and week follow a selected date. Previous / Today / Next step by the view. | Everyone | Tester 17 Oct | The 1st-of-month pin made week and day look empty. |
| All types / Any format clear the filter. | Everyone | Tester 17 Oct | Choosing Christian then All types must restore every type. |
| Map of events with a place; stays on screen when empty. | Everyone | Guillaume liked the map; tester 17 Oct | Location is part of finding an event. |

## Events and review

| What it does | Who | Agreed by | Why |
| --- | --- | --- | --- |
| Scraper, daily 05:00 Europe/London plus Run now. Demo harvest unless `SCRAPE_FIXTURES=0`. Optional https ICS/JSON-LD from allowlisted Priority URLs (body and event caps). Whitelist / blacklist / pending. Discarded rows stay discarded. Human-edited rows are not overwritten. Unclassified live events stay pending. | Admin | D11; reply [m]; scraper-final 17 Oct | Human choice before members see an event. |
| Pending queue: edit, publish, discard. Cards show new vs updated, org, type, time, Event Link. Publish/discard return to pending. | Admin, cell leader | D09; Guillaume 16 Oct G4; scraper 8 17 Oct | Keep working through the queue. |
| Manual add: place as text, click the map for a pin. Event Link (http/https). | Admin, cell leader | Guillaume 16 Oct G2, G3 | Scraped coordinates stay; typing lat/lng is not the main way in. |
| Confirm before delete, discard, deactivate. | Admin, cell leader | Review 17 Oct | Destructive actions were one click. |

## Booking and attendance

| What it does | Who | Agreed by | Why |
| --- | --- | --- | --- |
| Attend records intent. Confirm later that they went. Stars are a bookmark, dropped after the event. | Member | Reply [q] | Three different acts. |
| Cell leader books a member of their own cell. Capacity is checked; last place is locked. | Cell leader | F04; review 17 Oct | One booking per person per event; no double-take of the last seat. |
| Members see count, initials, or name + cell, as the admin sets. Default count only. | Member | Reply [e]; Guillaume 16 Oct G1 | Privacy toggle. Name + cell is a deliberate admin choice. |
| Exports of one event: CSV or Excel. Admin everyone; cell leader own cell; members 403. | Admin, cell leader | F07 | Reporting. |

## Insights

| What it does | Who | Agreed by | Why |
| --- | --- | --- | --- |
| Insights page: headline figures and charts for activity, attendance, type, format, cell, time of day, review funnel. | Admin (region), cell leader (own cell) | Product call 17 Oct | Leaders asked to see activity and attendance, and to take it away as a file or a message. |
| Export drop-down: CSV, TXT, JSON, XLSX. Same numbers as the page. | Admin, cell leader | F07 extended 17 Oct | One calculation, several files. |
| Share drop-down: WhatsApp, Email, Teams, Telegram, Copy, device share. Totals only. | Admin, cell leader | Product call 17 Oct; D02 held | The person’s own app sends it. Gather does not send messages. |

## Admin

| What it does | Who | Agreed by | Why |
| --- | --- | --- | --- |
| Members, import, scraper settings, organisation rules, audit log. | Admin | Requirements | Closed system. |
| Audit covers publish/discard, booking, export, import, password reset, activate/deactivate, Insights export/share, attendee-visibility change. | Admin | Architecture sketches | Who did what. |

## Out of this phase

Public sign-up, email/SMS from Gather, member password reset, live website scrape, §16 phone UI, Prisma migrations, production backups.

## Sign-off

An, Becca and Guillaume. Dates left blank until they choose to sign.

| Name | Date | Notes |
| --- | --- | --- |
| An | | |
| Becca | | |
| Guillaume | | |
