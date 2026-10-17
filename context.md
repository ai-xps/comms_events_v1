# Gather — Birmingham Community Events

Context for the build. Distilled 15 October 2026 from the project group chat (14–15 October 2026), the two requirements documents linked in that chat, and the process and architecture sketches shared there. Updated 16 October 2026 with mobile-first UI mockups (logo through calendar): phone layouts are canonical; browser should be inspired by them (see section 16). Updated 17 October 2026 with Guillaume’s 16 October demo feedback (see section 17).

This file is a reference for implementation. It is not a signed specification. The discovery document calls itself finalised, and the chat on 15 October still had comments outstanding. Where sources disagree, both positions are recorded and the item is marked unresolved.

## 1. Purpose

Build a web app for Birmingham community events. It finds events in agreed categories, holds them for a human decision before members see them, and lets members book on and confirm attendance. Cell leaders can book on behalf of their own cell and export who went.

The work sits in an AI test group. IWN confirmed that the scope discussed for the test was cleared to develop an app.

People in the thread:

- Guillaume — scope, requirements documents, UI sketches, and the architecture example.
- Rebecca W — scope check, and the request that members see how many people plan to attend without seeing who they are.
- An — existing alpha (`events.html` and a user portal), a separate longer spec that was still being prepared, and comments on the requirements documents.

A separate comprehensive spec from An was described as standalone and not the Google Doc. It is not included here. Treat this file as the record of what was actually shared by 15 October 2026.

## 2. What the app is

A closed calendar for one community in Birmingham. Accounts are created by an admin and handed out. There is no public sign-up.

The product shape Guillaume pointed at is close to a Luma calendar (members register onto events), with two additions:

- Events are scraped from Birmingham sources.
- Scraped events are not all published. Someone chooses which ones members can book.

Reference calendar: https://luma.com/calendar/cal-S60usgWCdXX9MLP

Working name on the architecture sketch: **Gather — Birmingham Community Events**.

## 3. Scope

### In scope

- Five event categories: Christian, networking, professional, meetups, student events.
- In-person and online events.
- A Birmingham location filter that an admin can change.
- Scrape on a schedule and on a manual run.
- Organisation rules: whitelist, blacklist, and standard (review).
- A pending queue. Authorised reviewers edit fields and approve or discard.
- Manual events, including events the scraper missed, as one-off or weekly recurring.
- Calendar views: day, week, month. Colour by event type. Filter primarily by event type.
- One-click booking for a signed-in member, using name and cell number already stored on the account.
- Delegate booking: a cell leader books a member of their own cell.
- Capacity. A full event cannot take another booking.
- Attendance confirmation by the member, and manual marking by the cell leader.
- Exports of attendee lists and attendance to CSV or Excel.
- User setup by hand, or by import (Excel, or JSON if preferred).

### Explicitly out of this phase

- Public self-registration.
- Email as an identifier. Cell number is the identifier in the written decision log.
- SMS, and any notification channel. Nothing in the requirements asks for messages to be sent.
- A password reset flow.
- A live link to the wider Birmingham department system. Security rules that out for now. Structure arrives as an import file.
- Publishing every scraped event.
- Stopping someone booking two events that overlap.
- One shared calendar covering several cities. Other locations are separate systems. See open questions.

### Not answered

Rebecca asked whether the test is problem 1 from the previous day’s meeting, or problems 1 and 2 together. The thread does not define those problems and does not answer the question. Confirm this before building past the basic scope above.

An asked what the deliverables are besides the app. The only output named in the thread is CSV or Excel. No other deliverable was agreed.

## 4. Decisions

These are written down in the discovery document or stated in the chat. Contested items are in the next section, not treated as settled here.

| ID | Decision | Why it was given |
| --- | --- | --- |
| D01 | No email address on the account. Cell number is the identifier. | Less friction at booking. |
| D02 | No SMS in this phase. | Not required. |
| D03 | Admin sets passwords. There is no reset flow. The discovery document says the admin can see passwords in plain text, so they can support members and load people as they already exist. | See the security note in section 11. The later architecture sketch shows password hashes instead. |
| D04 | Overlapping bookings are allowed. The system does not warn or block. | Stated as permitted. |
| D05 | Accounts are created by an admin and credentials are given to cell leaders. Members do not register themselves and do not pick their own cell. | Stops a member landing in the wrong cell, and matches the structure already held elsewhere. |
| D06 | User import is a file (Excel or JSON). Permission or duty is a column so the import sets access. Permissions can be changed later. | A small restructure can also be edited by hand. |
| D07 | No integration with the wider Birmingham department system in this phase. | Security. An import file is the source for now. |
| D08 | External ticket sites can still be used, and the member still books in this app. | The region needs to see who plans to go, even when the host’s own site takes the real registration. |
| D09 | Every cell leader may review scraped events. There is no single designated reviewer. | Reply on the requirements document. |
| D10 | Another city is another deployment with its own calendar. Location is an admin parameter so a copy of the system can target somewhere else. | Reply on the requirements document. Leicester, Sheffield, Coventry, and Nottingham were the examples. |
| D11 | Whitelist organisations auto-publish. Blacklist organisations are discarded. Everyone else waits for review. | Requirements document and Guillaume’s later flowchart. An earlier process sketch sends everything to review. |
| D12 | Each occurrence of a weekly event has its own attendee list. Deleting a recurring event can remove this occurrence or all future occurrences. | Discovery document. |

Requirements were described as a starting point, and comments were still open on 15 October. They are modifiable.

## 5. Unresolved

Do not implement these by picking a side silently.

**Who can see who is going.** Three positions exist:

- Rebecca: show how many people in the region plan to attend. Do not show who they are.
- An, in chat: that count was already in the spec being prepared.
- The readable requirements document: show name and cell number to everyone by default. An admin can switch non-admins to a total count only.
- A comment on the discovery document: keep a count and initials, not a full register. The same comment says book-on and an attendance badge already exist in An’s app.
- Guillaume, after trying the demo on 16 October: add a third choice, “Count and Name + Cell”, next to “Count only” and “Count and initials” (section 17).

The admin toggle is the only mechanism written as a requirement. Since 16 October it has three choices: count only, count and initials, count and name + cell. The build defaults to count only (`DECISIONS.md`). Which choice this deployment should run with is still not agreed; it is an admin setting, not a code change.

**Passwords.** The discovery document and its decision log say plain text, visible to admin. A comment on that document says the admin should reset a password without seeing it. The architecture sketches say a password hash and, on one sketch, Supabase Auth. Guillaume offered the hashed architecture as an example that could work, after the plain-text decision. The written decision and the later sketch disagree.

**Login identifier.** “Cell number” is used in two senses:

- Booking copy and decision D01: cell number is the basic detail stored on the person, and the thing they log in with, in place of email.
- Import columns and cell assignment: Cell is the group they belong to. The database sketch stores both a cell number and a cell id.

A cell id cannot be the login, because many people share one cell. Confirm whether cell number means a phone number, a member number, or something else, and what the unique login is.

**Problem 1 and problem 2.** Unanswered. See section 3.

**Other outputs.** Unanswered beyond CSV and Excel.

**Review workload.** Any cell leader may review the queue. Nothing was agreed about how quickly pending events, including whitelisted ones if they still pass through the queue, get published. A comment asked whether a named GYJN resource and a frequency are needed. Only the permission answer was given.

**Daily run time.** A comment asked for a refresh at 05:00 so the queue is ready for people later in the day, and noted that a manual “run now” can take a while. The requirements text says daily plus manual. The clock time is a comment, not the requirements table.

**Event-type filter examples.** A comment asked for examples and said other filters should be possible. No list was added.

**Starred events.** In An’s current user portal, a member can star an event. Starred events stay easy to reach, are not remembered after the event is over, and can feed other stats. A comment asked for this on top of one-click booking. It is not in Guillaume’s requirements table.

**Map.** An’s alpha shows where events are. Maps were failing to load when it was shared. Guillaume liked the map. It is not in the requirements table.

**Organisation import shape.** Guillaume’s file is flat: Name, Cell, Duty, plus Password and Permission for account setup. An asked for a nested source, Region → Department → Team → Cell, as JSON in and JSON out, so a later restructure has one place to change. Guillaume accepted Excel or JSON as the import, and did not adopt a live lookup.

**Stack.** Two sketches were shared. Neither was chosen. See section 9.

**Cells as a concept.** A comment on the discovery introduction said a named invite list is enough for now and that cells add operations that are not needed yet. The rest of both documents is built around cells. The chat treats cells as in scope.

## 6. Roles

Accounts exist only because an admin created them. A person has one cell. Permission can change after import.

| Role | Does | Sees |
| --- | --- | --- |
| Admin | Users, cell assignment, passwords, scraper settings, organisation lists, event-type colours, location parameter. Can add and edit events. | All data. The discovery document includes plain-text passwords. See section 11. |
| Cell leader | Reviews and edits pending events, publishes or discards them, adds and edits calendar events, registers any member of their own cell, marks attendance for those members, exports reports. | Events, and member data for their own cell. |
| User (member) | Signs in, views the calendar, books with one click, confirms attendance on the event page or when prompted at the next sign-in. | The calendar, their own bookings, and whatever attendee visibility the admin has set. |

Cell leader is a permission, not a separate product. The same permission covers reviewing the queue, self-booking, and delegate booking.

Import columns called for across the thread:

- Name, Cell, Password for account creation.
- Permission, or Duty, so the file sets what the person can do.
- A structure export was described as Name, Cell, Duty.

JSON was accepted as an alternative to Excel. If JSON is used, nesting Region → Department → Team → Cell was An’s proposal for keeping the hierarchy. The agreed minimum is still the flat fields above.

## 7. Behaviour

### 7.1 Finding events

The scraper targets Birmingham events in the five categories, in person and online. An admin can:

- Turn each event type on or off.
- Set the run to daily, and run it immediately.
- Keep a master list of organisations.
- Add specific URLs that should be scraped first.
- Change the location filter.

Organisation rule, as in the requirements and in Guillaume’s flowchart:

- Whitelist: publish onto the calendar without waiting.
- Blacklist: discard.
- Standard: create a pending event.

Pending events are ordered by day and time. Before publishing, name, organisation, type, time, and the other event fields can be edited. Approval publishes. Rejection discards. After publishing or discarding from the pending review, the reviewer goes back to the pending review so they can carry on through the queue (Guillaume, 16 October).

Admin and cell leaders can also create an event by hand, once or weekly.

Location differs by source (Guillaume, 16 October):

- Scraped events keep the latitude and longitude the scraper pulls. Guillaume called that “quite good”.
- Manual add and edit: type the place as text and pick the point on a map. Raw latitude and longitude boxes are not the main way in. Typing an address and looking it up (geocoding) was also suggested; it needs an external lookup service and is not in this build.

The link to the host’s own page is labelled **Event Link** (was “Host URL”).

Sources named on the architecture sketch, as examples rather than a fixed list: Eventbrite, Meetup, local church sites, university sites, professional networks, and other Birmingham event sites an admin configures.

### 7.2 Calendar

Members get day, week, and month. Event type has an admin-defined colour. The primary filter is event type.

The interface sketch labelled Gather shows a member calendar with those type chips, month/week/day, and an add-event action, plus navigation for dashboard, calendar, events, pending review, my bookings, attendance, members, reports, and scraper settings. Pending review, members, reports, and scraper settings are leader and admin work. The sketch does not say which items a member sees.

Later mobile redesign boards (section 16) propose a member path: home landing → event search by category → list → details/map → bookings/saved → calendar day/week/month with a day list under the grid. Use those for phone UI; inspire browser from the same flows.

### 7.3 Booking

A signed-in member selects an event and confirms in one click. The booking stores the name and cell number already on the account.

If the event is at capacity, the member sees that it is full and no booking is added. A cell leader booking for someone else hits the same capacity check.

A cell leader may book themselves or any member of their own cell. They do not book members of another cell.

Two bookings that overlap in time are both kept.

If the host event needs its own ticket or registration, the member can do that through the Event Link and still books here so the region can see intent.

### 7.4 Attendance

After the event, the member confirms on the event page, or the next sign-in asks them to confirm. A cell leader can mark attendance for members of their cell. Booking and attendance are separate: a booking records intent; attendance is confirmed later.

The architecture sketch also lists attendance reminders on the scheduler. No channel exists for that in the requirements (no SMS, no email). A reminder is not agreed. The agreed prompt is at the next sign-in.

### 7.5 Reporting

An admin or a cell leader selects an event and sees the attendee list (admin: everyone; cell leader: own cell). The member-facing toggle (count only, count and initials, count and name + cell) controls what members see, not what leaders see. They export CSV or Excel for that event. A weekly series does not merge occurrences into one list.

### 7.6 Users

An admin adds a person by hand or by file. The file creates the account, assigns the cell, sets the password, and sets permission. There is no reset flow in the requirements. People sign in with the identifier and password they were given.

The process sketch describes sign-in as cell number plus password. See the open question in section 5 before treating that as the username.

## 8. Process

Guillaume’s flowchart (shared 14 October, 16:45) is the clearest single path. Two tracks run side by side.

**Events**

1. Scheduled or manual scraper.
2. Fetch Birmingham events.
3. Apply the organisation rule.
4. Whitelist publishes. Blacklist discards. Standard becomes a pending event.
5. An admin or other authorised reviewer approves or discards the pending event, then returns to the pending review for the next one.
6. Approved events appear on the calendar.

**People and bookings**

1. Admin creates users or imports the file.
2. Cell and credentials are assigned.
3. The member signs in, browses and filters, and selects an event.
4. A cell leader can instead select a member of their cell and book for them.
5. Both paths check capacity. Full events stop. Otherwise the booking is confirmed and stored with an attendance status.
6. Attendance is confirmed and the record is updated.
7. The cell leader reviews attendance and exports CSV or Excel.

An earlier, coarser sketch sends every scraped event to a cell leader and only then publishes. Use the three-way organisation rule above when they differ. Whitelist auto-publish is the later and more specific statement.

## 9. Architecture sketches

Both drawings were offered as examples that could work. They are not a chosen design. Build against the behaviour in sections 6–8, and treat the platform names as options.

### Sketch A — 15 October, “an example of an architecture that could work”

| Part | What the sketch shows |
| --- | --- |
| Users | Browser on desktop or mobile, over HTTPS. |
| Frontend | Cloudflare Pages. React or Next.js. Hosts the web app. |
| Backend | Cloudflare Workers. JSON over HTTPS. |
| Data and auth | Supabase. PostgreSQL, authentication, role management, and optional file storage. The sketch labels password hashing and an encrypted database connection. |
| Backend areas | Authentication and authorisation. Event management (create, update, pending review, recurrence). Booking and attendance (capacity, tracking). User and cell management. Scraper. Reports and exports. |
| Stored data | Users and cells. Events and bookings. Attendance. Organisations (whitelist and blacklist). Scraper settings. Audit logs. |
| Optional files | Event images, export files, user-import uploads. |
| Arrows | Solid: user request and data. Blue dashed: external data and scheduled tasks. Green dashed: authentication and secure access. |

### Sketch B — process diagram, right-hand architecture

| Part | What the sketch shows |
| --- | --- |
| Frontend | Responsive web app: calendar, event detail, booking, administration. |
| API | Authentication, role-based access, business logic, events, booking and attendance, reporting. |
| Services | Scraper (daily run, fetch, categorise, filter, organisation rules, pending events). Organisation rules (whitelist auto-publish, blacklist discard, standard pending). File processing (Excel user import, CSV and Excel export, validation). Scheduler (daily scraper, recurrence, attendance reminders, maintenance). |
| Database | PostgreSQL. |
| Hosting | A cloud host, with Fleet and Vercel named as examples. HTTPS, backups, monitoring, logging, custom domain. |
| External sources | Eventbrite, Meetup, local church sites, university sites, professional networks, other Birmingham sources. |

A third, looser sketch groups the same ideas as: users; a responsive frontend and backend API; background jobs (scheduler, scraper and normaliser, Excel import and export, allow and deny rules); external sites plus hosting, monitoring, and backups; PostgreSQL holding organisations and audit logs, events and recurrence, bookings and attendance, and users and cells.

### Data the sketches agree on

These entities show up in both detailed sketches. Field lists come from sketch B’s database notes, except where sketch A adds something.

| Entity | Fields or contents named on the sketches |
| --- | --- |
| User | Name, cell number, password (hash on the sketch), role, cell id. |
| Cell | Cell details, assigned users. |
| Event | Details, type or category, recurrence, capacity, status (pending or published). |
| Booking | Event id, user id, booking date, attendance status. |
| Organisation | Name, status: whitelist, blacklist, or standard. |
| Audit log | User actions, system events, scraper runs. Named on the sketches only. Not in the requirements table. |

Audit logging is a property of the sketches, not a numbered requirement. It is worth keeping if the build records who published an event, who changed a permission, and what a scraper run did. It is not a reason to expand the product.

## 10. What already exists

An has an alpha, shared on 14 October as `events.html` and a user-portal screenshot. It is the current app style, not the agreed build.

- A map of event locations. It may fail to load. Guillaume wanted the map kept in mind.
- Starred events, surfaced for the member and dropped when the event is finished.
- Book-on and an attendance badge were described, in a document comment, as already present. The comment argued for count plus initials rather than a full register.

That alpha is a feel for the member side. Guillaume’s screenshots were the member calendar: the admin scrapes and adds events onto the calendar members book against. They are not a separate admin-only product.

## 11. Security and data handling

The thread is explicit about a few constraints. Record them as trade-offs, not as encouragement to store secrets in the clear.

**Department systems stay disconnected.** User and cell structure is imported. The app does not read or write the wider Birmingham department system. That was a security decision, not a temporary technical limit to route around.

**Passwords.** The discovery decision log accepts plain-text passwords because the data is basic, the admin is the help desk, and accounts must match an existing structure. A comment on the same document rejects that, and the architecture sketches assume hashing. Plain-text storage means anyone who can read the database, a backup, or an admin screen can use every account. Hashing still allows an admin to set or reset a password and to bulk-create accounts. It removes the ability to look a password up and read it back. Do not implement plain text unless that decision is confirmed again in light of the later sketch.

**Attendance data.** Name, cell, and whether someone plans to attend or attended is personal data about members. The visibility default is unresolved (section 5). With “count and name + cell” switched on, every signed-in member can read the name and cell number of everyone booked on an event. That is a deliberate admin choice, and the person switching it on should know members can see each other’s numbers. Exports are separate from the member toggle: admin exports everyone, a cell leader exports their own cell. Cell leaders are limited to their own cell in the requirements.

**Scraper.** It collects public event information from third-party sites. It does not collect member data from those sites. Which sites and URLs are in scope is an admin setting (whitelist, blacklist, targeted URLs).

**Accounts.** There is no public registration and no self-serve cell move. That is deliberate, so the cell on the account stays the cell in the import.

## 12. Requirements index

From the discovery document (version 1.0, 14 October 2026, status “Finalised (Discovery Phase)”). Priority is theirs.

| ID | Requirement | Priority | Acceptance, as written |
| --- | --- | --- | --- |
| F01 | Admin user upload | High | Admin can upload Excel with name, cell, password. Later comments add permission. |
| F02 | Scraper targeting | High | System pulls Birmingham events based on keywords. |
| F03 | Weekly recurrence | Medium | Events can repeat weekly with a unique attendee list per occurrence. |
| F04 | Delegate booking | High | Cell leaders can register members of their own cell. |
| F05 | Master organisation list | Medium | Admin can blacklist and whitelist organisations. |
| F06 | Attendance prompt | Medium | Users are prompted to confirm attendance when they sign in. |
| F07 | Data export | Medium | Cell leaders can export attendee lists to CSV or Excel. |

The shorter requirements document (the one Guillaume described as easier to read) covers the same behaviour in five sections: roles and access, scraper, event and calendar management, booking and attendance, reporting and data. Its comment replies are decisions D08, D09, and D10.

## 13. Sources

| Source | What it is |
| --- | --- |
| Project group chat, 14–15 October 2026 | Scope, import rules, UI reactions, Luma, architecture hand-off. Comments on the requirements were still outstanding on 15 October at 13:39. |
| https://docs.google.com/document/d/1KPPV2KqVOQUlMX1YAkISCbMcS0rzFYtClTtoyI6HHoM/edit | Discovery document, version 1.0, 14 October 2026. Decision log and F01–F07. |
| https://docs.google.com/document/d/1TerpyG1-7-dWxVTVhT0NQUJIuWzDKDJwaqxRV10HkrI/edit | Shorter requirements write-up, shared 14 October at 15:45. |
| https://luma.com/calendar/cal-S60usgWCdXX9MLP | Prior calendar Guillaume had tried. Similarity target, plus scrape-and-choose. |
| https://consensusdeep.com/ | Suggested during the chat as an AI requirements tool. No decision to adopt it. |
| Architecture and process images in the chat, 14 October 15:33–16:45 and 15 October 13:02 | Member UI, flowchart, and the two system sketches summarised above. |
| Mobile UI redesign boards (logo, login, home, menu, search, list, details, bookings, calendar), shared 16 October 2026 | Captured in section 16; images under `docs/design-mockups/`. Phone canonical; browser inspired by the same. |
| Project group chat, 16 October 2026 22:30–22:34 | Guillaume’s demo feedback with annotated screenshots of the event form and the attendee-visibility setting. Captured in section 17. |
| https://docs.google.com/document/d/1Zgv9Tr-KZCnxm58otiJZxUqo5aCNcOQM2-uxiJzd5Ys/edit | Demo feedback document. Guillaume proposed it on 16 October as the place for comments instead of the chat. |

Working notes from the chat: comments on the Google docs should be made from a named account, not an anonymous one. From 16 October, product feedback goes in the demo feedback document above rather than the chat.

## 14. Assumptions and limitations

- Through 15 October 2026 this file stopped at the chat and the two documents. Section 16 (16 October 2026) adds the mobile redesign boards. Section 17 adds Guillaume’s 16 October chat feedback. Comments added later to the demo feedback document are not folded in until someone copies them here. An’s longer standalone spec, if any, is still outside unless folded in later.
- “Finalised” on the discovery document means the draft was written up. It does not mean the comment threads were closed.
- GYJN, HYJN, and IWN are left as written. They are roles or forms of address in the community. They are not redefined here.
- Keyword lists, source URLs, organisation names, colour values, and the exact Excel or JSON schema were not supplied. F02’s “keywords” were not listed.
- The scraper will depend on third-party sites that can change or block access. Which sites are allowed is an admin decision (targeted URLs, whitelist, blacklist), and it is not a licence to ignore those sites’ terms.
- Capacity, double booking, and external-ticket events can disagree with the host’s real remaining places. This app’s capacity is its own limit, for regional visibility. It does not reserve a seat on the host site.
- A multi-city Midlands product is out of scope. A location parameter exists so a second deployment can point at another city and keep a separate calendar.

## 15. Discovery document comment threads

From the 15 October 2026 export of [Requirements](https://docs.google.com/document/d/1KPPV2KqVOQUlMX1YAkISCbMcS0rzFYtClTtoyI6HHoM/edit?tab=t.0). Markers [a]–[q] are Google Doc comments. The export does not name who wrote each note. Closed-build calls that override a reply are in `DECISIONS.md`, not here.

| Thread | On | Comment | Reply | Outcome in this document |
| --- | --- | --- | --- | --- |
| [a] | High-touch cell-leader oversight | Later add — a named invite list is enough. Cells add ops you don’t need yet. | None | Unadopted. Cells stay in scope. |
| [b] [c] | Admin can see plain-text passwords | Don’t. Admin can reset without seeing secrets. | It’s ok we can set pwd ourselves since it’s not a critical app. We only use basic info for registering to events. And it means we can load to existing structure. It prevents members setting their profile to the wrong cell and we can set them up as they exist in other systems. | Document keeps D03 (plain text). The build hashes passwords; an admin still sets and replaces them. |
| [d] [e] | User booking | Overlap — book-on + attendance badge already in yours. Keep it count + initials, not a full register. | The other document is better to understand this requirement. | Follow the written privacy toggle (name/cell vs total count), not initials-only. |
| [f] [g] | No public self-registration | Already in yours — invite-only, admin-created names. | No invite, we set all accounts up and distribute pwd to CL. | No invite. Admin creates accounts; passwords go to the cell leader. |
| [h] [i] | Excel columns | Is this the complete list of things you need? | Name, Cell, Password, Permission | Those four columns are complete. |
| [j] [k] | Birmingham geographic constraint | We can add the other areas in the region too. | We can have it as a filter but this tool will only be for Birmingham region. If it works well we can look to duplicate for other regions but it will only be for Birmingham for now. If we were to deploy it to other regions, they would have their own system, admin, calendar, etc. | Birmingham only. Later regions are separate deployments. |
| [l] [m] | Manual Run Now | That could take a while frankly — there needs to be a daily refresh at 5am so that it is prepped for later updates. | Yes that’s good. It’s good to be able to run it manually as well if we want to change some settings on the scraper. | Daily at 05:00, plus a manual run. |
| [n] [o] | Filter primarily by event type | Give examples please, and I think others can be used for it too. | Christian, Networking, Professional, Student, Meetup | Those five types. No further filter dimensions in the reply. |
| [p] [q] | One-click booking | This is good and ok, but we can do better by adding starred events for the members. | Once they find an event they want to attend they click Attend. Later on they need to confirm they actually attended. That’s what this requirement is about (not about starred events). | Attend records intent. Confirmation is later. Stars are not this requirement. |

## 16. Mobile-first UI design direction (phone canonical; browser inspired)

Added from the Gather redesign mockups (logo through calendar). **Phone layouts are the source of truth.** Browser / desktop should reuse the same brand, flow, and hierarchy — with more width (side-by-side calendar + list, fuller filters) — not a separate product look.

Mockup boards (repo copies):

| Board | File |
| --- | --- |
| 1–2 Logo + Login | [`docs/design-mockups/01-logo-login.png`](docs/design-mockups/01-logo-login.png) |
| 3–4 Home + Menu | [`docs/design-mockups/02-home-menu.png`](docs/design-mockups/02-home-menu.png) |
| 5–6 Search + List | [`docs/design-mockups/03-search-list.jpg`](docs/design-mockups/03-search-list.jpg) |
| 7–8 Details + Bookings | [`docs/design-mockups/04-details-bookings.png`](docs/design-mockups/04-details-bookings.png) |
| 9–10 Calendar | [`docs/design-mockups/05-calendar.png`](docs/design-mockups/05-calendar.png) |

### How to use these for implementation

- **Phone:** Match structure and density of the “AFTER” frames where shown.
- **Browser:** Keep logo, teal/orange accents, catchphrase, category colours, list cards, calendar-as-day-filter pattern; expand layout (e.g. calendar left / event list right; desktop nav instead of or alongside hamburger).
- **Before frames** in the boards are the current Gather parish / cream UI for contrast, not the target.
- Product rules in sections 3–7 and `DECISIONS.md` still win over mockup labels when they conflict (e.g. Attend vs “Login” wording, cell leader language, no public password reset unless decided later).

### Brand and visual system (from boards)

- **Logo:** Map-pin outline with three stylised people inside (heads as coloured dots; shoulders as arcs). Colours in the mark: orange / teal / warm accent.
- **Wordmark:** `GATHER` in spaced sans-serif; mockups show letter colour alternating orange/teal (or solid). Identifiable at top of screens.
- **Logo meaning (as written on the board):**
  1. Map icon — emphasise event locations.
  2. People in the middle — gathering / evangelism (“gathering the fruits”).
- **Palette direction:** Clean white / light grey surfaces; teal (primary CTA and active nav); orange (brand / Professional / saved); supporting category colours (e.g. Christian red, Student blue, Meetup purple); green for booked/check.
- **Typography:** Modern sans-serif for UI (mockups move away from serif display on these screens).
- **Catchphrase:** “Find, Book, Gather.” / “Find. Book. Gather. The heart of Birmingham’s events, in your pocket.”

### 1. Logo ideas

- Mark: map pin + three people.
- Wordmark under the mark.
- Use consistently on login, home, and as a home link in headers.

### 2. Login page

**Target (AFTER):**

- White background; centred logo + `GATHER`.
- Greeting: “Welcome back!”
- Catchphrase: “Find, Book, Gather.”
- Short help: sign in with cell number and password from your GSN / cell leader (mockup says GSN; existing product copy uses cell leader — keep product language unless GSN is adopted).
- Fields: Cell number (phone icon), Password (lock icon); rounded inputs.
- Mockup shows “Forgot?” — **not in current product scope** (admin sets passwords; no member reset). Treat as aspirational unless `DECISIONS.md` changes.
- Primary CTA: teal pill **Login** / Sign in.
- Callouts on board: identifiable logo, catchphrase, modern design.

**BEFORE** on the board: cream card, serif Gather, terracotta button (current shipped parish style).

### 3. Home screen

**Target (AFTER):** Landing-style home, not the calendar as the first screen.

- Hamburger (or later bottom tabs) top right.
- Centred logo + `GATHER`.
- Birmingham line-art / landmark collage (hero illustration).
- Copy: “Find. Book. Gather. The heart of Birmingham’s events, in your pocket.”
- Teal CTA: e.g. “Get Started” / “Explore Brum”.
- **Scroll down → Event Search** (annotation on board).

**BEFORE:** Menu + Sign out chrome; long filter chip stacks; month grid as the whole home.

**Browser inspire:** Same hero brand + CTA strip; then search/categories or calendar in a wider column — do not dump every filter chip into the first viewport.

### 4. Hamburger menu

**Target:**

- Semi-transparent dark overlay over home.
- Links: Event Search, Event Calendar, My Bookings, Saved Events (active item teal pill).
- Sign out at bottom with exit icon.

**Open design questions on the board:**

- Teal “hover” highlight — mobile has no hover; use clear **selected / pressed** state instead.
- Menu panel fully opaque vs semi-transparent?
- **Alternative:** bottom icon bar instead of hamburger (see below).

### Bottom tab bar (alternative navigation)

Five icons: Home, Search, Calendar, Bookings, Saved.  
Board asks: prefer bottom bar over hamburger? Unresolved — pick one primary pattern for phone; browser can use a top nav mirroring the same five destinations.

### 5. Event search

Header: logo + hamburger. Title: “What kind of event are you looking for?”

**Option 1:** Vertical pill list of categories (Christian, Networking, Professional, Student, Meetup) with icons; select highlights; teal **Continue**.

**Option 2:** Search field (“Search events, locations, or keywords…”) + circular colour-coded category icons; tap category goes straight to list (no Continue). Board asks whether search bar should be included.

Categories match product types in section 3.

### 6. Event list (by category)

- Back to search; logo taps home.
- Title e.g. “Professional Events”.
- Filters: All / Online / In Person (start on All).
- Cards: date block (e.g. OCT 16 FRI), title, time, place, attendee avatars (privacy: what members see follows the admin toggle in section 5 — count, initials, or name + cell).
- Star = saved; check = booked.
- Tap card → event details.
- Optional bottom tab bar (same open question).

### 7. Event details and map

- Back + centred logo.
- Date line (e.g. FRI 13 OCT), title, time, place, description.
- Tags: category + Online / In Person.
- Status / actions as circular controls: Booked (check), Saved (star), Notify Me (bell) — **Notify Me** is not in current scope (no SMS/email); treat as future unless decided.
- Map embed with pin; board asks: tap map / icon opens device Maps app?
- Bottom nav with Bookings active when coming from bookings flow.

### 8. My bookings / saved events

- Logo + title “My Bookings” (or Saved Events equivalent).
- **One list view, separated by date headers** (annotation).
- Rows: date box, title, time, place, category dots, star + booked check.
- Board asks: if several events share a day, remove duplicate date boxes?
- Same bottom nav pattern.

### 9. Calendar — monthly

- Logo; back; title “Events Calendar”.
- Segmented Day / Week / Month (active teal).
- Month grid; coloured dots under days with events (by type).
- Selected day circled; **list of that day’s events below** (not squashed into grid cells) — annotation: click day to see list so titles are not cut off on the grid.
- Event row: date block, title, time, place, tags, star, booked.

### 10. Calendar — weekly

- Same chrome and Day / Week / Month control.
- Week range label (e.g. Oct 12–18, 2026); one row of days with dots.
- Selected day → list below (“Friday, Oct 16 TODAY”).
- Board asks: do we need a Day view? Should “Today” be repositioned?

**Browser inspire for 9–10:** Calendar and day list side by side, or wider month grid with optional titles in cells without losing the day-list pattern on narrow widths.

### Open UX questions (carry into build / decisions)

| Topic | Options / note |
| --- | --- |
| Primary mobile nav | Hamburger overlay vs bottom five-icon bar |
| Event search | Option 1 (pills + Continue) vs Option 2 (search + icon grid) |
| Search bar on category step | Include or not |
| Day calendar view | Keep, simplify, or drop |
| “Today” control placement | On weekly (and monthly) chrome |
| Duplicate date boxes in bookings list | Keep per row vs once per day group |
| Map tap | Deep-link to Apple/Google Maps |
| Forgot password / Notify Me | Shown in mockups; **out of current product scope** unless newly decided |
| Member attendee avatars on cards | Follow the three-way toggle (count / initials / name + cell). Avatars with faces or names only when name + cell is on. |
| GSN vs cell leader copy | Mockup vs existing Gather language |

### Relationship to the shipped parish-noticeboard UI

The live demo (cream paper, Fraunces, terracotta) remains what testers use until this direction is implemented. Section 16 is the **target visual and IA** for the next UI pass: phone-first from these boards; browser follows the same language.

## 17. Demo feedback — Guillaume, 16 October 2026

From the project chat, 16 October 2026 22:30–22:34, after trying the Railway demo. Guillaume annotated two screenshots: the scraper settings control “What members see for attendees”, and the add/edit event form. Further feedback goes in the [demo feedback document](https://docs.google.com/document/d/1Zgv9Tr-KZCnxm58otiJZxUqo5aCNcOQM2-uxiJzd5Ys/edit).

| # | What he said | Where it lands | Built |
| --- | --- | --- | --- |
| G1 | Under “Count only” and “Count and initials”: “Count and Name + Cell — could we add this option please?” | Section 5 (visibility), section 11 (attendance data), `DECISIONS.md` member attendee view | Third admin choice. Members see each booker’s name and cell number when it is on. Default stays count only. |
| G2 | “The latitude longitude is quite good when pulling event from the scrapper. I am wondering if we could add an option to enter the address or select it on the map for when we add an event manually?” Latitude and longitude were crossed out on the annotated form. | Section 7.1 | Manual add/edit: place as text plus click-to-pick on a map. Scraper coordinates unchanged. Address lookup not built (needs a geocoding service). |
| G3 | Annotated form: rename “Host URL”. | Section 7.1, 7.3 | Labelled **Event Link** on the form and event page. |
| G4 | “When publishing events from the Pending review screen, it would be good to be able to go back to the pending review.” | Section 7.1, section 8 step 5 | Publish and discard from a pending event both return to the pending review. |
| G5 | “I am thinking we can use this document to make comments instead of posting here.” | Section 13 | Demo feedback document added as a source. |

Not raised in this feedback, and still open: everything in section 5 except the toggle’s choices, and the section 16 design questions.
