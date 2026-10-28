# Gather — Birmingham Community Events

Context for the build. Distilled 15 October 2026 from the project group chat (14–15 October 2026), the two requirements documents linked in that chat, and the process and architecture sketches shared there. Updated 16 October 2026 with mobile-first UI mockups (section 16). Updated 17 October 2026 with Guillaume’s 16 October demo feedback (section 17), tester calendar notes (section 18), and Insights (section 19). Updated 28 October 2026 with the closed build record (section 20).

This file is a reference for implementation. It is not a signed specification. An, Becca and Guillaume have not signed `docs/FUNCTIONAL.md`. The discovery document calls itself finalised, and the chat on 15 October still had comments outstanding. Both sides of an old argument stay in sections 4, 11 and 15. **Section 20 wins** when an earlier section still looks open. Do not implement the older side.

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
- One shared calendar covering several cities. Other locations are separate systems. Section 20.

### Not answered

Rebecca asked whether the test is problem 1 from the previous day’s meeting, or problems 1 and 2 together. The thread does not define those problems and does not answer the question. Confirm this before building past the basic scope above.

An asked what the deliverables are besides the app. The only output named in the thread is CSV or Excel. No other deliverable was agreed.

## 4. Decisions

These rows are what the discovery document or the chat said. Where a row was later contested, section 5 names the call and section 20 is the rule to build.

| ID | Decision | Why it was given |
| --- | --- | --- |
| D01 | No email address on the account. Cell number is the identifier. | Less friction at booking. |
| D02 | No SMS in this phase. | Not required. |
| D03 | Admin sets passwords. There is no member reset flow. The discovery document says the admin can see passwords in plain text. | Discovery log only. The build stores a bcrypt hash. Section 20. |
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

## 5. What was open, and the call now

These points were unresolved on 15–16 October. The old wording stays in sections 4, 11 and 15. The build follows the last column. Detail is in section 20. Do not reopen a row by building the older side.

| Topic | What was open | Call the build follows |
| --- | --- | --- |
| Who can see who is going | Rebecca: a count, no names. The requirements text: name and cell by default, with a switch to a count. A comment: count and initials. Guillaume on 16 October: add “Count and Name + Cell”. | Three admin choices. Default is count only. Initials, or name and cell number, are admin switches. The switch is the deployment choice. Members never see more than the switch allows. Leaders’ exports ignore it (section 7.5). |
| Passwords | Discovery log: plain text an admin can read. A comment and the architecture sketches: a hash. | bcrypt hash only. An admin sets or replaces a password and tells the cell leader. The admin cannot read it back. |
| Login identifier | “Cell number” might mean a phone, a member number, or the cell group. A cell id cannot be the login, because many people share one cell. | `cellNumber` is the personal login id (letters and digits). Several people may share one. The password picks the person, and must be unique among people who share that number. The group is `cellId`. |
| Problem 1 and problem 2 | Rebecca’s question was not answered in the thread. | This build is section 3 only. There is no second problem to invent. |
| Other outputs | Only CSV or Excel was named. | Attendee files and Insights files: CSV, TXT, JSON, XLSX. Reports also export event details for a date range (CSV or Excel). Insights share text is totals plus a link, with no names. |
| Review workload | Any cell leader may review. No speed and no named rota were agreed. | No rota and no deadline. Whitelist publishes on the scrape. Blacklist discards. Standard waits on `/pending` until a person publishes or discards it. |
| Daily run time | 05:00 was a comment. The requirements table said daily plus manual. | Daily at 05:00 Europe/London on the host cron, plus an admin Run now. |
| Event-type filters | Examples were requested. | Christian, Networking, Professional, Student, Meetup. More than one type may be on. Online or in person is a separate filter. |
| Starred events | In the alpha, not in Guillaume’s table. Reply [q] said stars are not the Attend requirement. | Stars are a bookmark, separate from Attend. They drop after the event has ended. |
| Map | Liked, and not in the requirements table. | The map stays on the calendar, including when it has no pins. It sits on Birmingham. |
| Organisation import shape | Flat file, or nested Region → Department → Team → Cell. | The file people are given is flat: Name, Cell number, Cell, Password, Permission. A nested JSON body is still read if it contains `users` or `rows`. Nesting is not required. |
| Stack | Two sketches. Neither was chosen. | Next.js. SQLite file for local and for the Ubuntu target. Railway remains the live demo until the Ubuntu gate in `docs/deploy-ubuntu.md` is green. |
| Cells | A comment said a named invite list is enough. | Cells stay. Comment [a] was not adopted. |

## 6. Roles

Accounts exist only because an admin created them. A person has one cell. Permission can change after import.

| Role | Does | Sees |
| --- | --- | --- |
| Admin | Users, cell assignment, passwords, scraper settings, organisation lists, event-type colours, location parameter. Can add and edit events. | All data. Passwords are hashes and cannot be read back. Section 20. |
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
- Manual add and edit: type the place as text, Find on map (Nominatim, Birmingham), or pick the point on a map. Raw latitude and longitude boxes stay under details. Online sits next to Event Link.

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

Sign-in is the personal cell number plus password, as closed in section 20. The cell group is not the username.

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

Both drawings were offered as examples that could work. The stack the build uses is in section 20 (Next.js and a SQLite file). The names on the sketches (Cloudflare, Supabase, Vercel, Fleet) were not adopted. Build the behaviour in sections 6–8 and the rules in section 20.

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

**Passwords.** The discovery decision log accepted plain text so an admin could set passwords and match an existing structure. That need is met by setting the password at create time and telling the cell leader. The build stores bcrypt hashes only. Plain text is not implemented. Anyone who can read the database or a backup still cannot sign in as a member without breaking the hash.

**Attendance data.** Name, cell, and whether someone plans to attend or attended is personal data about members. The default is count only (section 20). With “count and name + cell” switched on, every signed-in member can read the name and cell number of everyone booked on an event. That is a deliberate admin choice, and the person switching it on should know members can see each other’s numbers. Exports are separate from the member toggle: admin exports everyone, a cell leader exports their own cell. Cell leaders are limited to their own cell in the requirements.

**Scraper.** Demo events run unless `SCRAPE_FIXTURES=0`. Live fetch is admin Priority URLs only, https ICS or JSON-LD on a host allowlist (no `.ics` wildcard). Body and event caps apply. A later Save freezes scrape updates; Publish does not. Unclassified live events stay pending. It does not collect member data from those sites. Organisation whitelist / blacklist / pending still decide what members see.

**Accounts.** There is no public registration and no self-serve cell move. That is deliberate, so the cell on the account stays the cell in the import.

**Build choices (17 October).** Passwords stay hashed. Logging out, resetting a password, or deactivating a person increments `sessionVersion`, so every cookie issued before that is refused. Event Link only stores `http://` or `https://`. Category colours only store `#rrggbb`. The scheduled scrape accepts `Authorization: Bearer` only, compared in constant time. Spreadsheet exports prefix cells that look like formulas. Login `next=` only accepts a path on this app.

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
| Mobile UI redesign boards (logo, login, home, menu, search, list, details, bookings, calendar), shared 16 October 2026 | Captured in section 16; images under `docs/design-mockups/`. Flow reference. Shipped colour and tabs are section 20. |
| Project group chat, 16 October 2026 22:30–22:34 | Guillaume’s demo feedback with annotated screenshots of the event form and the attendee-visibility setting. Captured in section 17. |
| https://docs.google.com/document/d/1Zgv9Tr-KZCnxm58otiJZxUqo5aCNcOQM2-uxiJzd5Ys/edit | Demo feedback document. Guillaume proposed it on 16 October as the place for comments instead of the chat. |

Working notes from the chat: comments on the Google docs should be made from a named account, not an anonymous one. From 16 October, product feedback goes in the demo feedback document above rather than the chat.

## 14. Assumptions and limitations

- Through 15 October 2026 this file stopped at the chat and the two documents. Later sections add the boards, Guillaume’s demo notes, tester notes, Insights, and the closed build record in section 20. A comment left only in the Google demo doc is not a change until it is copied into section 20 or `DECISIONS.md`. An’s longer standalone spec, if any, is still outside unless folded in later.
- “Finalised” on the discovery document means the draft was written up. It does not mean the comment threads were closed.
- GYJN, HYJN, and IWN are left as written. They are roles or forms of address in the community. They are not redefined here.
- The discovery papers did not list keyword strings, source URLs, or organisation names. The five type names, the import columns, and the shipped colours are in section 20. F02’s scraper “keywords” were never a separate list: the five categories are the filter.
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
| [p] [q] | One-click booking | This is good and ok, but we can do better by adding starred events for the members. | Once they find an event they want to attend they click Attend. Later on they need to confirm they actually attended. That’s what this requirement is about (not about starred events). | Attend records intent. Confirmation is later. Stars are a separate bookmark (section 20), not part of this requirement. |

## 16. Mobile boards (16 October) — flow reference

Added from the Gather redesign mockups (logo through calendar). These boards are a flow reference. Section 20 is the shipped colour, navigation, and copy. Do not restyle the app to the teal AFTER frames.

Mockup boards (repo copies):

| Board | File |
| --- | --- |
| 1–2 Logo + Login | [`docs/design-mockups/01-logo-login.png`](docs/design-mockups/01-logo-login.png) |
| 3–4 Home + Menu | [`docs/design-mockups/02-home-menu.png`](docs/design-mockups/02-home-menu.png) |
| 5–6 Search + List | [`docs/design-mockups/03-search-list.jpg`](docs/design-mockups/03-search-list.jpg) |
| 7–8 Details + Bookings | [`docs/design-mockups/04-details-bookings.png`](docs/design-mockups/04-details-bookings.png) |
| 9–10 Calendar | [`docs/design-mockups/05-calendar.png`](docs/design-mockups/05-calendar.png) |

### How to use these for implementation

- **Phone:** Follow the flow in section 20 (welcome, kinds on Home, list, details, bookings, calendar). Do not copy teal buttons, Forgot password, or Notify Me off the boards.
- **Browser:** Keep the logo, the catchphrase, category colours, list cards, and the calendar-as-day-filter pattern. Expand the layout (calendar and list can sit side by side; desktop nav alongside the phone tabs). Colour is the blush / berry lock in section 20. The teal buttons on the boards were not adopted.
- **Before frames** are an older cream parish look, kept on the boards for contrast. They are not the shipped UI.
- Product rules in sections 3–7 and section 20, and `DECISIONS.md`, win over mockup labels (Attend rather than a public Login product, cell leader rather than GSN, no member password reset).

### Brand and visual system (from boards)

- **Logo:** Map-pin outline with three stylised people inside (heads as coloured dots; shoulders as arcs). Colours in the mark: orange / teal / warm accent.
- **Wordmark:** `GATHER` in spaced sans-serif; mockups show letter colour alternating orange/teal (or solid). Identifiable at top of screens.
- **Logo meaning (as written on the board):**
  1. Map icon — emphasise event locations.
  2. People in the middle — gathering / evangelism (“gathering the fruits”).
- **Palette on the boards:** Clean white / light grey surfaces; teal (primary CTA and active nav); orange (brand / Professional / saved). That palette is the sketch. The shipped palette is section 20 (blush paper, warm ink, berry).
- **Typography:** Modern sans-serif for UI (mockups move away from serif display on these screens).
- **Catchphrase:** “Find, Book, Gather.” / “Find. Book. Gather. The heart of Birmingham’s events, in your pocket.”

### 1. Logo ideas

- Mark: map pin + three people.
- Wordmark under the mark.
- Use consistently on login, home, and as a home link in headers.

### 2. Login page

**Board AFTER frame (colour is not shipped):**

- White background; centred logo + `GATHER`.
- Greeting: “Welcome back!”
- Catchphrase: “Find, Book, Gather.”
- Short help on the board says GSN. Shipped copy says cell leader (section 20).
- Fields: Cell number (phone icon), Password (lock icon); rounded inputs.
- Mockup shows “Forgot?”. That control is out of this phase. An admin sets passwords.
- Primary CTA on the board: a teal pill. The shipped button is berry.
- Callouts on board: identifiable logo, catchphrase, modern design.

**BEFORE** on the board: cream card, serif Gather, terracotta button. That frame is historical. It is not the shipped UI.

### 3. Home screen

**Board AFTER frame (colour is not shipped):** Landing-style home, not the calendar as the first screen.

- Hamburger (or later bottom tabs) top right.
- Centred logo + `GATHER`.
- Birmingham line-art / landmark collage (hero illustration).
- Copy: “Find. Book. Gather. The heart of Birmingham’s events, in your pocket.”
- Teal CTA: e.g. “Get Started” / “Explore Brum”.
- **Scroll down → Event Search** (annotation on board).

**BEFORE:** Menu + Sign out chrome; long filter chip stacks; month grid as the whole home.

**Browser inspire:** Same hero brand + CTA strip; then search/categories or calendar in a wider column — do not dump every filter chip into the first viewport.

### 4. Hamburger menu

**Board frame:**

- Semi-transparent dark overlay over home.
- Links: Event Search, Event Calendar, My Bookings, Saved Events (active item teal pill).
- Sign out at bottom with exit icon.

**Questions the board asked, and the call:**

- Teal “hover” highlight — a phone has no hover. Shipped UI uses a selected state and a pressed state (section 20).
- Menu panel fully opaque vs semi-transparent — the shipped Menu is the leader and admin list. It does not use a translucent dark overlay as the main nav.
- Bottom bar vs hamburger — phone tabs are Home, Calendar, Bookings. Menu holds leader and admin tools. The five-icon bar (Home, Search, Calendar, Bookings, Saved) was not adopted.

### Bottom tab bar (on the board)

Five icons: Home, Search, Calendar, Bookings, Saved. The shipped phone tabs dropped Search as its own tab (kinds live on Home) and dropped Saved as its own tab (stars stay on the event and the calendar).

### 5. Event search

Header: logo + hamburger. Title: “What kind of event are you looking for?”

**Option 1:** Vertical pill list of categories (Christian, Networking, Professional, Student, Meetup) with icons; select highlights; teal **Continue**.

**Option 2:** Search field (“Search events, locations, or keywords…”) + circular colour-coded category icons; tap category goes straight to list (no Continue). The shipped Home uses kind chips and an online / in person filter. There is no separate keyword step.

Categories match product types in section 3.

### 6. Event list (by category)

- Back to search; logo taps home.
- Title e.g. “Professional Events”.
- Filters: All / Online / In Person (start on All).
- Cards: date block (e.g. OCT 16 FRI), title, time, place, attendee avatars (privacy: what members see follows the admin toggle in section 5 — count, initials, or name + cell).
- Star = saved; check = booked.
- Tap card → event details.
- Phone tabs are Home, Calendar, Bookings (section 20). The five-icon bar on the board, including a separate Saved tab, was not adopted. Stars stay on the event and on the calendar.

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
- The board asked whether a shared day should show one date. Shipped bookings use Upcoming and Past.
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
- The board asked whether Day view is needed. Day stays. Week is the default. Previous / Today / Next sit on the calendar chrome.

**Browser inspire for 9–10:** Calendar and day list side by side, or wider month grid with optional titles in cells without losing the day-list pattern on narrow widths.

### Open UX questions (carry into build / decisions)

| Topic | Call |
| --- | --- |
| Primary mobile nav | Phone tabs: Home, Calendar, Bookings. Menu holds leader and admin tools. Section 20. |
| Event search | Signed-in Home is the kind chooser plus the upcoming list. `/search` redirects there. |
| Search bar on category step | Kind chips and an online / in person filter. No separate keyword step. |
| Day calendar view | Kept. Week is the default. Month stays a grid. Day and week are a time grid. |
| “Today” control placement | Previous / Today / Next, on the calendar chrome. |
| Duplicate date boxes in bookings list | Upcoming and Past groups. A date shows with its events. |
| Map tap | The map stays on the calendar. A separate “open in Apple or Google Maps” control is not required. |
| Forgot password / Notify Me | Out of this phase. Admin sets passwords. No SMS and no email from Gather. |
| Member attendee avatars on cards | Follow the three-way toggle. Faces or names only when name + cell is on. |
| GSN vs cell leader copy | Product language is cell leader. |

### Relationship to the shipped UI

Section 16 records the boards. The shipped look is section 20: blush paper, warm ink, berry buttons, phone tabs Home / Calendar / Bookings. The boards still explain the flow (welcome, kinds, list, details, bookings, calendar). They do not set the colour, and they do not add Forgot password or Notify Me.

## 17. Demo feedback — Guillaume, 16 October 2026

From the project chat, 16 October 2026 22:30–22:34, after trying the Railway demo. Guillaume annotated two screenshots: the scraper settings control “What members see for attendees”, and the add/edit event form. Further feedback goes in the [demo feedback document](https://docs.google.com/document/d/1Zgv9Tr-KZCnxm58otiJZxUqo5aCNcOQM2-uxiJzd5Ys/edit).

| # | What he said | Where it lands | Built |
| --- | --- | --- | --- |
| G1 | Under “Count only” and “Count and initials”: “Count and Name + Cell — could we add this option please?” | Section 5 (visibility), section 11 (attendance data), `DECISIONS.md` member attendee view | Third admin choice. Members see each booker’s name and cell number when it is on. Default stays count only. |
| G2 | “The latitude longitude is quite good when pulling event from the scrapper. I am wondering if we could add an option to enter the address or select it on the map for when we add an event manually?” Latitude and longitude were crossed out on the annotated form. | Section 7.1 | Manual add/edit: place as text, Find on map (Nominatim, Birmingham), or click a pin. Scraper coordinates unchanged. Nominatim is best-effort. There is no paid geocoder. |
| G3 | Annotated form: rename “Host URL”. | Section 7.1, 7.3 | Labelled **Event Link** on the form and event page. |
| G4 | “When publishing events from the Pending review screen, it would be good to be able to go back to the pending review.” | Section 7.1, section 8 step 5 | Publish and discard from a pending event both return to the pending review. |
| G5 | “I am thinking we can use this document to make comments instead of posting here.” | Section 13 | Demo feedback document added as a source. |

The open points from this evening are closed in section 5 and section 20, including the section 16 board questions.

## 18. Tester feedback — calendar, 17 October 2026

Relayed without a name. Three reports, all on the calendar.

| Report | Cause | Fix |
| --- | --- | --- |
| Day and week views come up empty even when events are on the month | Both views were pinned to the 1st of the displayed month. Previous/Next only moved by month. | A `d=YYYY-MM-DD` anchor. Day is that London day; week is Monday–Sunday around it. Previous/Next step by the current view. A Today button and a range heading say which dates you are looking at. |
| After choosing a type (for example Christian), All types does not clear the filter | The All types link reused the current category. | One `calendarHref` helper. Empty overrides drop the param. |
| Playing with the filters makes the map at the bottom disappear | With no located events, the map was replaced by a one-line note, and Leaflet was rebuilt on every render. | The map always stays. Empty views sit on Birmingham with a note. Markers swap in a layer group. |

## 19. Insights and sharing

Admins and cell leaders have **Insights**. Members do not. An admin sees the region and can pick a cell. A cell leader is pinned to their own cell.

Headline figures and charts (Attend clicks over time, attendance outcomes, type, format, cell, day-and-time, review funnel, busiest events) all come from one calculation, so the page, the file you download, and the share text agree.

Export drop-down: Summary, Weekly trend, By event type, By cell, Per-event attendance, Attendee list (names, same scope as F07), or Everything. Formats: CSV, TXT, JSON, XLSX. Every export is written to the audit log.

Share drop-down: WhatsApp, Email, Microsoft Teams, Telegram, Copy, or the device’s own share menu. The message is totals plus a link back to Insights. It never includes names or cell numbers. The person’s own app sends it. Gather does not hold messaging accounts, so D02 (no SMS or notification channel in this phase) still holds.

Cells with fewer than three people are shown as “fewer than 3” on charts so no one can be singled out.

## 20. Closed build record (28 October 2026)

This section is the operational spec. It records what the code and `DECISIONS.md` already do. It is a community calendar for a demo, not an NHS clinical system. Attendance is personal data about members. It is not a patient record.

Where this section and an earlier section disagree, follow this section.

### 20.1 What one pass includes

Ship and maintain this, in this order. Do not start a later item by dropping an earlier one.

1. Accounts, hashed passwords, three roles, flat import.
2. Calendar (week default, month, day), five types, online / in person, map that stays up.
3. Attend, capacity, cancel, delegate booking, attendance confirmation, stars.
4. Pending review, organisation rules, manual events, weekly series.
5. Exports and Insights for admin and cell leader.
6. Host cron at 05:00 Europe/London, plus admin Run now.

Explicitly out of this pass: public sign-up, member password reset, email or SMS sent by Gather, a link to the wider Birmingham department system, overlap warnings, a second city in this database, HTML scraping of ordinary web pages, the teal palette on the section 16 boards, Forgot password, Notify Me.

### 20.2 Data

Times are stored as instants and shown in Europe/London. Week starts Monday.

| Entity | Fields that matter |
| --- | --- |
| User | `name`, `cellNumber` (login id, not unique), `passwordHash`, `role` (`admin`, `cell leader`, `member`), `cellId`, `active`, `sessionVersion`. |
| Cell | `name`. One person has one cell. |
| Event | `title`, `organisationName`, `category`, `startsAt`, `endsAt`, `online`, `placeName`, `lat`, `lng`, `externalUrl`, `notes`, `capacity`, `status` (`PENDING`, `PUBLISHED`, `DISCARDED`), `recurrence` (`NONE` or `WEEKLY`), `seriesId`, `sourceKey`, `humanEditedAt`. |
| Booking | `eventId`, `userId`, `bookedById`, `bookedAt`, `attendance` (`UNCONFIRMED`, then `ATTENDED` or `ABSENT`). One row per person per event. |
| Organisation | `name`, `nameKey`, `status` (`WHITELIST`, `BLACKLIST`, `STANDARD`). |
| Star | `userId`, `eventId`. Removed after the event end. |
| Audit log | `at`, `actorId`, `action`, `entityType`, `entityId`, `summary`. Append-only. |

`capacity` empty means no limit. `capacity` 0 means full. A save cannot set capacity below the number of bookings already on that event.

`sourceKey` is unique. Live ICS and JSON-LD use `live:<host>:<uid>`. Demo rows use a `fixture-` key. A later scrape updates that row in place. It does not create a second copy. A discarded row stays discarded. A row with `humanEditedAt` set (a later Save, not Publish alone) is skipped. The same key in one run: the fixture wins over the live row.

A weekly series creates 24 occurrences, seven UTC days apart, sharing one `seriesId`. Each occurrence has its own bookings. Delete can remove this occurrence, or this one and every later one in the series. Display is Europe/London, so the clock time on the noticeboard can shift by one hour across the spring or autumn clock change. That shift is accepted. The series does not grow past those 24 rows by itself.

### 20.3 Booking rules

- Attend stores intent. A second Attend by the same person on the same event does not add a second row.
- The last place is taken inside one database write, so two people cannot both take it.
- A full event refuses the booking. Leaders booking for their cell hit the same check.
- Cancel: a member may cancel their own place. A cell leader may cancel a place in their own cell. An admin may cancel any place. The row is removed. The audit log keeps the fact that it was cancelled.
- Overlapping events are both kept. The app does not warn.
- A cell leader does not book or cancel someone in another cell. An admin may book anyone.

### 20.4 Scraper and the 05:00 job

The Next.js process does not schedule itself. The host runs cron at 05:00 Europe/London:

```cron
0 5 * * * /path/to/app/scripts/scrape-cron.sh
```

That script calls the scrape with `Authorization: Bearer <CRON_SECRET>`, compared in constant time. Admin Run now uses an admin session and is marked manual. One scrape runs at a time (`ScrapeLock`). A failed feed is recorded and does not stop the other feeds.

Demo fixtures run unless `SCRAPE_FIXTURES=0`. Live fetch is admin Priority URLs only: https ICS or JSON-LD, host allowlist, no `.ics` wildcard. Caps: 512 KiB body, 200 events per URL, 500 per run. Private addresses are blocked. `SCRAPE_LIVE=0` or an empty URL list skips the network. The scraper does not collect member data from those sites.

### 20.5 Security and privacy

- Session cookie is httpOnly, SameSite lax, signed, and lasts 12 hours. Logout, password replacement, and deactivation bump `sessionVersion`, so older cookies die on every device. Trade-off: one logout signs out every device.
- Mutations check `APP_ORIGIN`. Login `next=` accepts only a path on this app.
- Five failed logins on the same cell number inside 15 minutes lock that number for 15 minutes. The error text does not say whether the number exists.
- An import file is read for that request. Only the hash is stored. If any row fails, nobody from that file is created. Cap: 2 MB and 2,000 rows.
- Spreadsheet cells that look like formulas are prefixed.
- Event Link is `http://` or `https://` only. A Zoom link counts when it is one of those. Category colours are `#rrggbb` only.
- Audit log: admin only, newest 200 rows on the page. There is no edit and no delete of a log row in the app. Deleting a member clears the actor on their old rows; the rows stay.
- Member view default `COUNT`. `COUNT_AND_NAME_CELL` shows every signed-in member the name and cell number of everyone booked. That is a deliberate admin choice. Exports ignore the switch: admin sees everyone, cell leader sees their own cell, members get 403.
- Insights share text has totals and a link. It has no names and no cell numbers. Cells with fewer than three people show as “fewer than 3”.
- No public registration. No write to any wider Birmingham department system.

### 20.6 Look and access

Shipped colour, in `src/app/globals.css`: blush paper `#FDF2F0`, warm ink `#3D2A2C`, berry `#A8434D` (button gradient `#C45C66` → `#A8434D`). Warm ink on blush paper is about 12:1. White on solid berry is about 5:1. White on the lighter gradient end `#C45C66` is about 4:1, so small white text does not sit on that colour alone. Buttons use the gradient at a heavy weight and at least 48px tall. The focus ring is a 3px berry outline, 2px outside the control, on links, buttons, and fields. On a coarse pointer (a finger), nav, chips, and day cells are at least 44px tall. Hover styles apply to a fine pointer (a mouse). A press uses `:active`. If the person has asked the device to reduce motion, the press does not scale. The current page and the selected chip expose `aria-current` or `aria-pressed`. A category is a word as well as a colour. The week grid shows event titles in the blocks. The month grid uses the day list so titles are not only coloured dots.

Phone tabs for a member: Home, Calendar, Bookings. Leader and admin tools live in Menu. Signed-out `/` is the welcome door, then sign-in. A sign-in with no `next=` returns to `/`. Copy says cell leader, not GSN.

### 20.7 Run it locally

From the repo root, with Node 20 or later:

```bash
npm install
mkdir -p prisma/data
npx prisma db push
npm run db:seed
npm run dev
```

`DATABASE_URL` is `file:./data/gather.db` (the file lands under `prisma/data/`). Copy `.env.example` to `.env`. Set `SESSION_SECRET`, `CRON_SECRET`, and `APP_ORIGIN=http://localhost:3000`. Open http://localhost:3000. The seed prints cell numbers and starting passwords once in the terminal. The app does not show them again. Re-running seed does nothing if the admin already exists. `npm run db:reset` wipes the local file and seeds again.

Do not point this SQLite build at a Postgres `DATABASE_URL`. `scripts/start.sh` refuses that. The live Railway demo stays on its last Postgres deploy until the Ubuntu gate is green.

### 20.8 How to tell it works

Run `npm test` and `npm run typecheck`. Then walk three people:

| Who | Pass looks like |
| --- | --- |
| Member | Signs in from the cell-number list. Week calendar shows events. All types clears a type filter. Attend once, then Attend again, still one booking. Confirm attendance. Star an event. No Import, Scraper, Audit, or Insights in the nav. |
| Cell leader | Pending tiles by day. Discard returns to `/pending`. Can book a member of their own cell and cannot book another cell. Export is their cell only. `/import` is a sentence, not the form. Insights is their cell only. |
| Admin | Creates or imports Name, Cell number, Cell, Password, Permission. Replacing a password does not reveal the old one. Member view defaults to count only. Run now does not duplicate a fixture already stored. Audit shows the run. Insights can cover the region. |

Browser coverage for discard copy, a CSV download, and an empty far-future month is `npm run test:e2e`. The live smoke list is `docs/REVIEW.md`. A green test run is an engineering check. It is not the signature on `docs/FUNCTIONAL.md`.

### 20.9 If it breaks

| Symptom | Look here |
| --- | --- |
| App will not start | `DATABASE_URL` must be a SQLite file. Postgres URLs are refused. |
| Nobody can sign in | Seed output, or an admin sets a new password. Five failures lock that cell number for 15 minutes. |
| 05:00 scrape did not run | Host cron and `CRON_SECRET`. The app does not schedule itself. One run at a time. |
| The same event appears twice | `sourceKey` should have updated the old row. A blank `sourceKey` is a hand-made event and is not matched to a scrape. |
| Last place taken twice | The booking write lock in `src/lib/booking.ts`. |
| Members see names | Admin attendee view is not on count only. |
| Disk or host loss | `docs/deploy-ubuntu.md` backup and restore, and `docs/incident-card.md`. |

Operator docs: `README.md` (local), `docs/deploy-ubuntu.md` (host, cron, backups), `docs/incident-card.md` (what to do when it is down), `DECISIONS.md` (why a call was made), `docs/CHANGELOG.md` (what each build shipped). Comments added to the Google demo doc after 16 October are not a second spec. A change counts when it is in section 20 or `DECISIONS.md`.
