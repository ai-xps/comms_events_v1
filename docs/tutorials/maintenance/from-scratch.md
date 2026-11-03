# Gather from scratch

**First:** fill or read the [project card](project.md) (`HOST`, `ORG`, `REPO`, `WORK_LINE`, `PROJECT_URL`, `CLONE_URL`).

Want Cursor to walk you one step at a time? Paste a box from **[intro-prompt.md](intro-prompt.md)** (first day or daily). This page is the full recipe if you prefer to read.

- Sign in with **your own** GitHub account.  
- The shared notebook lives under the **central** `ORG` / `REPO` (you must be invited).  
- Sample `ai-xps` on the card is a **placeholder** for this Gather copy only.

You need: a laptop, **your** GitHub login with access to `PROJECT_URL`, and **no** project folder yet.

Work on **`WORK_LINE`** (usually `experiment`). Do not start on `main`.

Each chapter: **What** → **Do this** → **Paste this into Cursor** → **Done when** → **If it fails**.

---

## A. Accounts and tools

**What.** Put the kitchen tools on the counter before you cook.

**Do this**

1. Create or use **your own** GitHub account (do not share it).  
2. Ask the owner to **invite you** to the central `ORG` / `REPO` ([project.md](project.md)). Accept the invite as yourself.  
3. Confirm you can open `PROJECT_URL` while signed in as **you**.  
4. Install [Cursor](https://cursor.com) (the editor with a chat helper).  
5. Install [Git](https://git-scm.com) (saves a history of every change).  
6. Install [Node 20 or later](https://nodejs.org) (runs the app).  
7. In Cursor: sign in to GitHub as **you** (same person as the invite).

**Paste this into Cursor**

```
I have a new laptop and no Gather folder. Check I have git and node. Tell me the next click if something is missing. Do not invent passwords.
```

**Done when.** Terminal shows a git version and a node version (`git --version`, `node --version`).

**If it fails.** Command not found → install that tool, close the terminal, open a new one, try again.

---

## B. Get a copy of Gather (clone)

**What.** Photocopy the shared notebook onto your desk.

**Do this**

1. Open Terminal (or Cursor’s terminal).  
2. Go to the folder where you keep projects.  
3. Paste (swap in `CLONE_URL` and `WORK_LINE` from [project.md](project.md)):

```bash
git clone -b WORK_LINE CLONE_URL gather
```

Example with the sample card filled:

```bash
git clone -b experiment https://github.com/ai-xps/comms_events_v1.git gather
```

4. In Cursor: **File → Open Folder** → choose the new `gather` folder.

**Paste this into Cursor**

```
This folder should be the Gather project on the WORK_LINE from docs/tutorials/maintenance/project.md. Confirm with git status. If I am on main, switch to WORK_LINE without deleting anything.
```

**Done when.** `git status` says you are on `WORK_LINE` (usually `experiment`).

**If it fails.** “Permission denied” or 404 → ask the project owner to add your user. Do not invent a new address.

---

## C. First local run

**What.** Fill the notebook and open the shop on your laptop only.

**Do this**

1. Copy `.env.example` to `.env` (same folder).  
2. In `.env`, keep these ideas (edit the secret strings to long random text):  
   - `DATABASE_URL` — where the local data file lives  
   - `SESSION_SECRET` — lock for sign-in cookies  
   - `CRON_SECRET` — lock for the timed scrape door  
   - `APP_ORIGIN` — `http://localhost:3000` for local  
3. Paste:

```bash
npm install
mkdir -p prisma/data
npx prisma db push
npm run db:seed
npm run dev
```

4. Open http://localhost:3000  
5. Seed passwords print **once in the terminal**. Do not paste them into chat, docs, or a pull request.

**Paste this into Cursor**

```
Set up a local Gather from .env.example. Run install, db push, seed, and dev. Do not commit .env. Tell me the URL to open.
```

**Done when.** The Gather sign-in page loads in the browser.

**If it fails.** Port in use → stop the other `npm run dev`, or ask Cursor which process holds 3000. Never commit `.env`.

---

## D. Cursor is the helper — you are the adult

**What.** You describe the job. The chat helper edits files. You decide save, share, and review letters. The **central web page** for comments is `PROJECT_URL` (see [review-and-comment.md](review-and-comment.md)).

**Do this**

1. Open Chat in Cursor.  
2. Choose **Agent** (the mode that can edit files).  
3. Paste a clear job (see boxes below).  
4. Read the proposed changes before you say yes.

**Paste this into Cursor**

```
Read docs/CHANGELOG.md. In five short sentences, how do we change Gather carefully? Do not edit files yet.
```

**Done when.** You get five plain sentences and no file edits.

**If it fails.** Wrong mode → switch to Agent. If it starts editing too soon → say “stop — plan only.”

---

## E. Fix a bug (daily loop)

**What.** Fix one broken shelf label — not rebuild the kitchen.

**Do this**

1. Write the bug in plain words (add a screenshot if you have one).  
2. Ask Cursor to **plan in 3 steps**, then wait.  
3. Say **go** for the smallest change.  
4. Run:

```bash
npm test
npm run typecheck
```

5. Add one line to `docs/CHANGELOG.md` if people will notice.  
6. Add one line to `docs/REVIEW.md` if testers should re-check.

**Paste this into Cursor**

```
Bug: [paste your bug here]. Plan in 3 steps, then wait. After I say go: smallest change, tests, changelog. Do not commit unless I ask.
```

**Done when.** Tests and typecheck pass; the bug looks fixed in the browser.

**If it fails.** Red test lines → paste them into Cursor. Do not skip checks.

---

## F. Save, share, ask for a check

**What.**

- **Save on this laptop (commit)** — write today’s page in your notebook.  
- **Share (push)** — post that page to the shelf at `HOST`.  
- **Ask for a check (pull request)** — leave a note on `PROJECT_URL`: “please review these pages.”

You must say the words. The helper must not do this alone.

**Do this** (only after you say so)

```bash
git status
git add path/to/changed/files
git commit -m "why this change, not a file list"
git push -u origin HEAD
```

Base the review letter on **`WORK_LINE`**, not `main`.  
Then comment and review: [review-and-comment.md](review-and-comment.md).  
Extra Git situations: [git-in-pictures.md](git-in-pictures.md).

**Paste this into Cursor**

```
Show git status and a one-sentence commit message. Wait. After I say commit, commit only these files. After I say push, push WORK_LINE. After I say PR, open a PR onto WORK_LINE with a short summary and test plan. Use docs/tutorials/maintenance/project.md for names.
```

**Done when.** The web project shows your new commits (and a review letter if you asked for one).

**If it fails.** Push rejected → `git pull --ff-only origin WORK_LINE`, then push again. Never force-push `main`.

---

## G. Get other people’s pages (pull)

**What.** Before you write, fetch new pages from the shelf.

**Do this**

```bash
git checkout WORK_LINE
git pull --ff-only origin WORK_LINE
```

**Paste this into Cursor**

```
Update my WORK_LINE from origin with a fast-forward only (see docs/tutorials/maintenance/project.md). If it cannot, stop and explain in plain words.
```

**Done when.** `git status` is clean and up to date with `origin/WORK_LINE`.

**If it fails.** Red conflict text → stop. Paste it into Cursor. Do not invent a rebase. See [situation 9](git-in-pictures.md#9-git-says-we-both-wrote-on-the-same-line).

---

## H. Live server (Oracle) — skip on day one

**What.** Update the public shop window after code is already on the shelf. Needs a special key (SSH).

Want Cursor to walk one step at a time? Paste **Prompt C** from [intro-prompt.md](intro-prompt.md) (Oracle actions).

**Do this** (An / Guillaume only)

1. Connect: `ssh -i ~/.ssh/gather_oracle_ed25519 ubuntu@132.145.68.166`  
2. Then:

```bash
cd /var/www/gather
git pull --ff-only origin experiment
npm ci
npx prisma generate
npm run build
sudo systemctl restart gather
```

3. Hard-refresh https://132.145.68.166.sslip.io  

Do **not** push this SQLite build to Railway while Railway still uses Postgres.

**Paste this into Cursor**

```
Write the exact SSH commands to update Oracle to origin/experiment and restart gather. Do not change Railway. Do not print .env.
```

**Done when.** On the server, `git rev-parse --short HEAD` matches the web project, and the site shows the new behaviour.

**If it fails.** Site looks old → hard-refresh (or private window). Confirm the short code on the server matches the shelf.

---

## FAQ

| Question | Answer |
| --- | --- |
| Where is the team address? | [project.md](project.md) — fill once; `ai-xps` is only a sample. |
| My account vs central home? | You log in as yourself. The repo lives under the central `ORG`. You get invited there. |
| How do I comment on work? | [review-and-comment.md](review-and-comment.md) on the pull request at `PROJECT_URL` (shows your name). |
| Cursor vs VS Code? | Cursor is VS Code plus the chat helper. Same folder. |
| No access to `PROJECT_URL`? | Ask the owner to invite **your** GitHub username to the central repo. |
| Why `WORK_LINE` / `experiment`? | Daily work lives there. `main` stays quiet until a human asks. |
| Can AI commit alone? | No. You say commit / push / PR. |
| Where do passwords live? | Terminal seed output and `.env` only — never in a PR or a comment. |
| Tests failed? | Paste the red lines into Cursor. Do not skip checks. |
| Oracle looks old? | Hard-refresh. Check the short code on the server. |
| Meetup still empty? | Use the Birmingham find URL, then Run now — not only the bare homepage. |
| Broke my laptop copy? | Do not force-push. Paste the exact git error into Cursor. |

## Film later

One chapter = one take. Pause on each **Paste this into Cursor** box. Blur passwords and `.env`.
