# Edit workflow — changing site content without code

This is the whole process. You do it in the GitHub website; no software to install. Typical edit: **under 10 minutes**.

## The one rule

**Never edit `main` directly.** Every change goes through a *branch* and a *pull request* (PR). This gives you a preview link to check before anything goes live, and the automatic checks stop broken content from publishing.

## Steps

1. **Open the repo** on GitHub: <https://github.com/victordeman/nosike> (you need to be a collaborator; ask the site developer to add you under *Settings → Collaborators* if you can't see the green **Code** button).
2. **Create a branch.** Click the branch dropdown (shows `main`) → type a name like `edit-honour-2026` → **Create branch**. You are now on your own copy.
3. **Edit the file.** Press `.` on your keyboard (or click **Add file → Upload files** is *not* what you want) — actually: navigate to the file in `content/` (e.g. `content/honours.json`), click the **pencil icon** (Edit this file), make your change, scroll down and click **Commit changes…**, keep "Commit directly to the `edit-honour-2026` branch" selected, click **Commit changes**.
   - Not sure what to type? Copy the shape from [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) — it has a ready example for every kind of entry.
4. **Open the pull request.** GitHub shows a yellow banner "`edit-honour-2026` had recent pushes" → click **Compare & pull request** → **Create pull request**.
5. **Wait for the Preview.** A *Vercel* check appears on the PR (1–3 minutes). When it is green, click the **Preview** link in the PR description and check your change on the real site.
   - If the check is **red**, the content failed validation — the build log names the file and field. Fix it on the same branch (repeat step 3) and the check re-runs automatically.
6. **Merge.** Back on the PR, click **Merge pull request → Confirm merge**. Within a few minutes the live site updates.

## What the automatic checks protect you from

- **Zod validation** (every build): wrong field names, missing required fields, bad dates, unknown status values → build fails, nothing publishes.
- **Privacy check** (every commit): phone numbers, personal emails, birth dates, etc. → commit is rejected.
- **Unit + browser tests** (CI): regressions on pages → PR checks fail.

## If something looks wrong after merging

Don't panic — every merge is a normal Git commit and can be undone in one click: open the PR → **Revert** creates a new PR that restores the previous state → merge it. Or ask the developer.

## For bigger changes (new photos, design, new pages)

Ask the developer (Devin). Photos go through the optimisation pipeline and new pages are code changes.

## Optional upgrade later

A visual admin (Keystatic) was evaluated for Phase 8 and deferred: it needs extra authentication setup and is unproven on this stack (Next.js 16 + Turbopack). The GitHub workflow above is fully supported today; revisit after launch if editing volume justifies it.
