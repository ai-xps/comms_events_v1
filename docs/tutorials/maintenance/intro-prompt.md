# Intro prompt — GitHub and keeping Gather

For someone new to GitHub and to this folder. You do not need to know the words yet.

Picture: **GitHub** is the post-office shelf. **Your laptop** is your copy of the notebook. **Cursor** is a helper who can write pages — you still decide what gets saved and posted.

Fill **[project.md](project.md)** first (`HOST`, `ORG`, `REPO`, `WORK_LINE`). Sample `ai-xps` is only a placeholder.

Then pick one box. Paste it into Cursor **Chat**, mode **Agent**. The helper should print the full list, then do **action 1 only**, and wait.

| Box | When |
| --- | --- |
| **Prompt A** | First day on this laptop |
| **Prompt B** | Laptop folder already works; daily care |
| **Prompt C** | Update the **live shop window** (Oracle) — An / Guillaume only |

- Full recipe (read yourself): [from-scratch.md](from-scratch.md) (chapter **H** = Oracle)  
- Git situations: [git-in-pictures.md](git-in-pictures.md)  
- Comments on a change: [review-and-comment.md](review-and-comment.md)  
- Live server detail: [`docs/deploy-ubuntu.md`](../../deploy-ubuntu.md) · quick card: [`docs/incident-card.md`](../../incident-card.md)

---

## Prompt A — first day (copy this)

Use this if you have **not** opened Gather on this laptop yet.

```
I am new to GitHub and to keeping this Gather codebase. I am not a programmer. Teach me like a patient kitchen teacher.

Read these files before you speak:
- docs/tutorials/maintenance/project.md
- docs/tutorials/maintenance/intro-prompt.md
- docs/tutorials/maintenance/from-scratch.md
- docs/tutorials/maintenance/git-in-pictures.md
- docs/tutorials/maintenance/review-and-comment.md
- AGENTS.md (the Ask first and Never lists)

Rules:
- No jargon. If you must use a tech word, define it in the same sentence, then add one notebook/kitchen/post picture.
- One action at a time. Number it. Then wait for me to say done or paste an error.
- Do not skip ahead. Do not edit files until that action needs a file change.
- Do not commit, push, or open a pull request unless I say those words.
- Never print, invent, or ask me to paste passwords, .env, or real member data.
- Use names from docs/tutorials/maintenance/project.md. Do not invent a second team address. Sample ai-xps is a placeholder only.
- Work on WORK_LINE (usually experiment). Do not start on main.
- If I am already part-way through, ask where I am, then continue from the next undone action. Do not restart.

Start by:
1. Asking whether this laptop already has a Gather folder, GitHub access, and a running local site.
2. Printing the numbered action list from intro-prompt.md (First-day actions).
3. Doing only the next undone action. Tell me what to click or paste. Tell me how I will know it worked. Tell me what to paste back if it fails.
```

**Done when.** Cursor asks where you are, shows the numbered list, and waits on one action.

---

## Prompt B — already set up (copy this)

Use this if the Gather folder already opens on this laptop.

```
I already have the Gather folder. Walk me through daily care of this codebase, in order, for a newbie.

Read docs/tutorials/maintenance/intro-prompt.md (Daily actions), project.md, from-scratch.md chapters E–G, git-in-pictures.md, AGENTS.md.

Same rules as the first-day intro: no jargon, one action at a time, wait, no commit/push/PR unless I say so, no secrets, stay on WORK_LINE.

Print the Daily actions list, then start at action 1 (get other people’s pages) unless I say I already pulled today.
```

**Done when.** Cursor shows the daily list and waits on “get other people’s pages,” or the next step you named.

---

## Prompt C — live shop (Oracle) (copy this)

Use this only if you are an **owner** (An / Guillaume), the change is already on the GitHub shelf on `WORK_LINE`, and someone asked you to update the **public** site.

**Oracle** is the rented computer in the cloud that serves https://132.145.68.166.sslip.io.  
**SSH** is a special door key from your laptop into that computer. Picture: a spare shop key — not for day-one practice.

```
I am an owner. Walk me through updating the live Gather shop on Oracle, in order, for a careful newbie.

Read:
- docs/tutorials/maintenance/intro-prompt.md (Oracle actions)
- docs/tutorials/maintenance/from-scratch.md chapter H
- docs/incident-card.md
- docs/CHANGELOG.md (Oracle row)
- AGENTS.md (Ask first / Never — especially Railway)

Rules:
- No jargon. Define each tech word once, then one shop/key picture.
- One action at a time. Wait for me to say done or paste an error.
- Do not run SSH or server commands until I say go for that action.
- Do not print, invent, or ask me to paste .env, CRON_SECRET, SESSION_SECRET, or passwords.
- Do not change Railway. Do not push SQLite to Railway.
- Pull only origin/WORK_LINE (usually experiment). Do not invent a rebase or force-push.
- If I do not have the SSH key, stop and say who to ask. Do not invent a new key.

Start by:
1. Asking whether the code is already pushed to origin/WORK_LINE, and whether I have the Oracle SSH key on this laptop.
2. Printing the Oracle actions list from intro-prompt.md.
3. Doing only the next undone action. Exact commands I can copy. How I know it worked. What to paste back if it fails.
```

**Done when.** Cursor checks shelf + key, shows the Oracle list, and waits on one action.

---

## First-day actions (in order)

The helper walks these. You can also follow them yourself.

### 1. Fill the address card

**What.** One shared address book so nobody invents a second home.

**Picture.** Write the shop address on the fridge before you cook.

**You do.** Open [project.md](project.md). Confirm `PROJECT_URL` and `WORK_LINE`. If it still says `YOUR_ORG`, ask the owner to fill it.

**Done when.** You can open `PROJECT_URL` in the browser (or you know you still need an invite).

**If it fails.** Page not found → you are not invited yet, or the names are still placeholders. Ask the owner. Do not guess a new address.

### 2. Your own GitHub login

**What.** GitHub is the website that holds the shared notebook.

**Picture.** Your own house key. Never share it.

**You do.** Create or use **your** GitHub account. Ask the owner to invite **your** username to the central `ORG` / `REPO`. Accept the invite as yourself.

**Done when.** While signed in as you, `PROJECT_URL` opens.

**If it fails.** 404 or access denied → invite not accepted yet. Stop. Tell the owner your GitHub username.

### 3. Put the tools on the counter

**What.** Three tools: **Cursor** (editor with a chat helper), **Git** (saves a history of every change), **Node** (runs the app).

**Picture.** Mixing bowl, oven, and timer before you bake.

**You do.** Install Cursor, Git, and Node 20 or later. In Cursor, sign in to GitHub as **you**.

**Paste if stuck**

```
I have a new laptop and no Gather folder. Check I have git and node. Tell me the next click if something is missing. Do not invent passwords.
```

**Done when.** A terminal shows a git version and a node version.

**If it fails.** “Command not found” → install that tool, close the terminal, open a new one, try again.

### 4. Copy the notebook onto your desk (clone)

**What.** **Clone** means photocopy the shared notebook from the shelf onto this laptop.

**Picture.** Taking a library book home. The library still has the original.

**You do.** In a terminal, go to the folder where you keep projects. Swap in values from [project.md](project.md):

```bash
git clone -b WORK_LINE CLONE_URL gather
```

Then in Cursor: **File → Open Folder** → the new `gather` folder.

**Done when.** `git status` says you are on `WORK_LINE` (usually `experiment`).

**If it fails.** Permission denied → you are not on the central repo yet. Do not invent a new clone address.

### 5. Secret local settings (do not share)

**What.** A file named `.env` holds locks for this laptop only (database place, sign-in cookie lock, scrape lock, local web address).

**Picture.** Spare keys in a kitchen drawer — not on the noticeboard.

**You do.** Copy `.env.example` to `.env`. Put long random text in the secret fields. Keep `APP_ORIGIN` as `http://localhost:3000` for local. Never commit this file. Never paste it into chat.

**Done when.** `.env` exists on your laptop and is not in the “files to save” list.

**If it fails.** Helper tries to commit `.env` → say **stop**. That file stays private.

### 6. First local run

**What.** Install ingredients, make the local data file, open the shop on this laptop only.

**Picture.** Stock the cupboard, then unlock the door for a practice service.

**You do.**

```bash
npm install
mkdir -p prisma/data
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000  
Seed passwords print **once in the terminal**. Do not paste them into chat, docs, or a review letter.

**Done when.** The Gather sign-in page loads.

**If it fails.** Port in use → stop the other `npm run dev`. Tests later; this step is only “the door opens.”

### 7. You are the adult; Cursor is the helper

**What.** You describe the job. The helper may edit files. You say when to save, share, or ask for a check.

**Picture.** A sous-chef chops. You decide what leaves the kitchen.

**You do.** Open Chat → **Agent**. Ask for a plan first if you are unsure.

**Paste**

```
Read docs/CHANGELOG.md. In five short sentences, how do we change Gather carefully? Do not edit files yet.
```

**Done when.** You get five plain sentences and no surprise file edits.

**If it fails.** Wrong mode → switch to Agent. If it edits too soon → “stop — plan only.”

### 8. Learn three words (save, share, check)

**What.**

| Word you say | Plain meaning | Picture |
| --- | --- | --- |
| **Save** (commit) | Write today’s page in *your* notebook | Pen on paper. Still on your desk. |
| **Share** (push) | Post that page to the GitHub shelf | Letter in the post. |
| **Ask for a check** (pull request) | Leave a note: please review these pages | Sticky note on the dish. |

The helper must not do these alone. You say the words. Daily work stays on `WORK_LINE`, not `main`.

**Done when.** You can point at those three rows in [git-in-pictures.md](git-in-pictures.md) (situations 4–6).

### 9. Know the live shop exists — do not touch it yet

**What.** The public shop window is **Oracle** (see **Oracle actions** below). Day one is practice on your laptop only.

**Picture.** Do not restock the real shop on your first practice bake.

**You do.** Nothing on the server today. Read the title of **Prompt C** so you know it exists for owners later.

**Done when.** You have not opened SSH or restarted Gather on Oracle.

---

## Daily actions (in order)

Start here on every work day after the folder already exists.

### 1. Get other people’s pages first

**What.** **Pull** means fetch new pages from the shelf before you write.

**Picture.** Collect the post before you add today’s page.

**You do.**

```bash
git checkout WORK_LINE
git pull --ff-only origin WORK_LINE
```

(Replace `WORK_LINE` from [project.md](project.md).)

**Done when.** `git status` is clean and up to date.

**If it fails.** Cannot fast-forward, or red conflict text → stop. Paste the message into Cursor. Do not invent a rebase. See [situation 9](git-in-pictures.md#9-git-says-we-both-wrote-on-the-same-line).

### 2. Name the job in plain words

**What.** One bug or one small change. Not a rebuild.

**Picture.** Fix one shelf label, not the whole kitchen.

**You do.** Write the problem in everyday English. Add a screenshot if you have one. Ask for a 3-step plan, then wait.

**Paste**

```
Bug: [paste your bug here]. Plan in 3 steps, then wait. After I say go: smallest change, tests, changelog. Do not commit unless I ask.
```

**Done when.** You have a 3-step plan and have not changed files yet (unless you already said go).

### 3. Smallest change, then check

**What.** Change only what the plan named. Then prove the app still works.

**Picture.** Taste the soup before you serve it.

**You do.** After you say **go**:

```bash
npm test
npm run typecheck
```

If people will notice the change, add one line to `docs/CHANGELOG.md`. If testers should re-check, add one line to `docs/REVIEW.md`.

**Done when.** Tests and typecheck pass. You looked at the screen in the browser if the change is visual.

**If it fails.** Paste the red lines into Cursor. Do not skip checks.

### 4. Save on this laptop (only when you say “commit”)

**What.** Write today’s page in your notebook. It is not on the shelf yet.

**You do.** Review the file list. Then say **commit** (or run the commands in [from-scratch.md](from-scratch.md) chapter F).

**Done when.** `git status` is clean, or only shows files you chose to leave unsaved.

**If it fails.** “Nothing to commit” → nothing was staged. Look at the list with the helper. Never add `.env`.

### 5. Share, then ask for a check (only when you say so)

**What.** **Push** posts the page. A **pull request** is the letter that asks someone to review it. Base that letter on `WORK_LINE`, not `main`.

**You do.** Say **push**, then **PR**, or follow [from-scratch.md](from-scratch.md) chapter F. Then comment: [review-and-comment.md](review-and-comment.md).

**Done when.** The web project shows your commits, and a review letter if you asked for one.

**If it fails.** Push rejected → daily action 1, then push again. Never force-push `main`.

### 6. Live shop only when an owner asked

**What.** A normal laptop day ends after share / check. Updating **Oracle** is a separate job.

**You do.** If An or Guillaume asked you to refresh the public site, stop this list and paste **Prompt C**. Otherwise leave the live shop alone.

**Done when.** You either finished at the GitHub shelf, or you switched to **Oracle actions** on purpose.

---

## Oracle actions (in order)

Owners only (An / Guillaume). Code must already be on the shelf (`origin` / `WORK_LINE`, usually `experiment`). Full install gate: [`docs/deploy-ubuntu.md`](../../deploy-ubuntu.md). Day-to-day refresh is this list.

### 1. Confirm the shelf has the pages

**What.** The live shop only learns what is already posted to GitHub.

**Picture.** Do not restock from a notebook that never left your bag.

**You do.** On your laptop: `git status` and check the web project shows the commits you want on `WORK_LINE`. If not, finish Daily actions 4–5 first (save + share).

**Done when.** The short commit code on GitHub matches the change you mean to publish.

**If it fails.** Only local commits → push first. Do not SSH yet.

### 2. Confirm you have the shop key

**What.** **SSH** opens a secure door from your laptop to Oracle. The key file is private.

**Picture.** Spare shop key on your keyring — not emailed in chat.

**You do.** Confirm this laptop has `~/.ssh/gather_oracle_ed25519` (or the key name the owner gave you). Do not paste the key into Cursor.

**Done when.** You know the key file is present, or you stopped because it is missing.

**If it fails.** No key → ask An / Guillaume. Do not invent a new key or password login.

### 3. Open the door (connect)

**What.** Log into the rented computer so you can update the app folder.

**You do.** After you say **go**:

```bash
ssh -i ~/.ssh/gather_oracle_ed25519 ubuntu@132.145.68.166
```

Then:

```bash
cd /var/www/gather
```

**Done when.** Your prompt is inside `/var/www/gather` on the server.

**If it fails.** Permission denied → wrong key or wrong user. Stop. Do not retry with guessed passwords.

### 4. Fetch the new pages on the server

**What.** **Pull** the shelf pages into the shop’s copy of the notebook.

**You do.**

```bash
git pull --ff-only origin experiment
```

(Use `WORK_LINE` from [project.md](project.md) if it is not `experiment`.)

**Done when.** Pull succeeds with no conflict text.

**If it fails.** Cannot fast-forward → stop. Paste the message into Cursor on your laptop. Do not force-push. Do not invent a rebase on the server.

### 5. Rebuild and restart the shop

**What.** Install locked ingredients, rebuild the storefront, then restart the service named `gather`.

**Picture.** Restock shelves, unlock the door again for customers.

**You do.**

```bash
npm ci
npx prisma generate
npm run build
sudo systemctl restart gather
```

**Done when.** Build finished without a red error, and restart returned with no failure message.

**If it fails.** Paste the last 30 lines of the error into Cursor. Do not edit `.env` on the server from chat. Do not touch Railway.

### 6. Check the short code and the window

**What.** Prove the shop is serving the same page you posted.

**You do.**

```bash
git rev-parse --short HEAD
```

Compare that short code to GitHub. Then hard-refresh (or private window) https://132.145.68.166.sslip.io  

Optional health check: open `/api/health` on that same site — expect something like `{"ok":true}`.

**Done when.** Short code matches the shelf, and the site shows the new behaviour.

**If it fails.** Site looks old → hard-refresh or private window. Short code wrong → you pulled the wrong line; stop and ask. Incident steps: [`docs/incident-card.md`](../../incident-card.md).

### 7. Leave Railway alone

**What.** The older demo host (Railway) still expects a different database. This SQLite Oracle build must not be pushed there while that is true.

**Picture.** Do not swap the cafe’s till for a bakery oven mid-service.

**You do.** Nothing on Railway. Confirm you did not change Railway settings.

**Done when.** Only Oracle was updated.

---

## Never (read once, keep forever)

- Do not share GitHub passwords or seed passwords.
- Do not put `.env`, secrets, or real member names into a commit, a pull request, or a comment.
- Do not work on `main` for daily fixes. Do not merge to `main` unless a human owner asked.
- Do not force-push `main` / `master`.
- Do not let the helper commit, push, open a pull request, or run Oracle SSH without the words from you.
- Do not push this SQLite app to Railway while Railway still expects the old database.
- Do not paste the Oracle SSH private key or server `.env` into chat.

If anything feels destructive: `git status`, paste the exact message into Cursor, wait.
