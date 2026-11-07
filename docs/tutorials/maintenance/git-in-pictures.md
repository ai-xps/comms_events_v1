# Git in pictures

**One picture for everything:** Git is a **shared notebook**.

- Your **laptop** = your copy of the notebook  
- **Shelf (`HOST`)** = post office shelf ([project.md](project.md))  
- **Save (commit)** = write today’s page  
- **Share (push)** = post the page to the shelf  
- **Get updates (pull)** = fetch new pages others posted  
- **Ask for a check (pull request)** = leave a note before pages go into the team notebook  
- **`WORK_LINE`** = daily line (usually `experiment`)  

Use names from the [project card](project.md). Sample `ai-xps` is a **placeholder** for this Gather copy only.

Back to the [door](README.md) · [intro prompt](intro-prompt.md) · full lesson [from-scratch.md](from-scratch.md) · [comment and review](review-and-comment.md)

---

## 1. Where am I?

**You want…** to see which notebook line you are on, and if anything is unsaved.

**Picture.** Read the cover of the notebook before you write.

**Do this**

```bash
git status
```

**If it fails.** “Not a git repository” → open the `gather` folder first (File → Open Folder).

---

## 2. Get a first copy

**You want…** Gather on a laptop that never had it.

**Picture.** Photocopy the shelf notebook onto your desk.

**Do this** (use `CLONE_URL` and `WORK_LINE` from [project.md](project.md))

```bash
git clone -b WORK_LINE CLONE_URL gather
```

Sample fill:

```bash
git clone -b experiment https://github.com/ai-xps/comms_events_v1.git gather
```

Then **File → Open Folder** → `gather`.

**If it fails.** Access denied → ask the project owner to add your user.

---

## 3. Start my day

**You want…** new pages from the shelf before you edit.

**Picture.** Collect the post before you write today’s page.

**Do this**

```bash
git checkout WORK_LINE
git pull --ff-only origin WORK_LINE
```

**If it fails.** Cannot fast-forward → stop. Paste the message into Cursor. Do not invent a rebase.

---

## 4. Save my work on this laptop

**You want…** today’s page written in **your** notebook (not on the shelf yet).

**Picture.** Pen on paper. The page stays on your desk until you post it.

**Do this** (only after you review the list)

```bash
git status
git add path/to/file1 path/to/file2
git commit -m "why this change, in one short sentence"
```

**If it fails.** “Nothing to commit” → you did not change files, or you forgot `git add`.

---

## 5. Share my page

**You want…** the shelf to hold your saved pages.

**Picture.** Post the letter so others can read it.

**Do this**

```bash
git push -u origin HEAD
```

**If it fails.** Rejected → run situation 3 (pull), then push again. Never force-push `main`.

---

## 6. Ask for a check

**You want…** someone to review before the team accepts the pages.

**Picture.** Sticky note on the notebook: “Please check.”

**Do this** (after push; only when you ask)

```bash
gh pr create --base WORK_LINE --title "short title" --body "## Summary
- what changed

## Test plan
- [ ] npm test
- [ ] check the screen in the browser
"
```

Or open a pull request in the browser at `PROJECT_URL` → **Pull requests** → onto **`WORK_LINE`**.

Then: [review-and-comment.md](review-and-comment.md).

**If it fails.** `gh` not logged in → `gh auth login`, or use the website on `PROJECT_URL`.

---

## 7. I typed in the wrong file, not saved yet

**You want…** to throw away pencil marks that were never a commit.

**Picture.** Rub out the pencil. Do not tear the notebook.

**Do this** (one file at a time; be sure)

```bash
git restore path/to/file
```

**If it fails.** Already committed → this will not help. See situation 8.

---

## 8. I saved a page I do not want, not posted yet

**You want…** to undo a local save that never left your laptop.

**Picture.** The page is written but still in your bag — do not invent scissors.

**Do this**

1. Run:

```bash
git log -3 --oneline
git status
```

2. Paste both into Cursor. Say: **do not invent undo; explain options in plain words and wait.**

**If it fails.** Already pushed → do **not** force-push. Ask a human + Cursor with the log.

---

## 9. Git says we both wrote on the same line

**You want…** to fix a clash after pull or push.

**Picture.** Two cooks wrote on the same recipe card. Stop stirring. Read the red ink.

**Do this**

1. Stop.  
2. Copy the full red message.  
3. Paste into Cursor: **explain in plain words; do not force; wait for me.**

**If it fails.** Anyone says `push --force` to `main` → say no. See situation 10.

---

## 10. Never

**You want…** to keep the official book safe.

**Picture.** Do not rip pages out of the shelf copy so the history lies.

**Do this**

- Never force-push `main` / `master`.  
- Never put `.env`, seed passwords, or real member data into a commit, pull request, or review comment.  
- When unsure: `git status` + paste into Cursor + wait.

**If it fails.** Someone already force-pushed → stop coding; tell the project owner.
