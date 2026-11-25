# Prof. Austin N. Nosike — portfolio

Personal portfolio site for Prof. Austin N. Nosike. Build plan and rules: [`SPEC.md`](SPEC.md). Unresolved content questions: [`OPEN_ITEMS.md`](OPEN_ITEMS.md).

**Non-technical editors:** start with [`EDIT_WORKFLOW.md`](EDIT_WORKFLOW.md) (how to change content on GitHub) and [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) (what each content file holds). [`OWNER_WALKTHROUGH.md`](OWNER_WALKTHROUGH.md) is a script for a recorded walkthrough of the site for the client.

## Privacy rules (summary)

- Raw client source files live in `_sources/` locally and are **never committed** (see `.gitignore`).
- No personal email addresses, phone numbers, birth dates, family details, home address, referees or religion on the site.
- `npm run privacy` scans tracked files and fails on violations; it also runs as a pre-commit hook and in CI.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zod content validation · Vitest + Playwright · Sharp image pipeline. Hosting: Vercel (auto-deploys every PR as a Preview; `main` deploys to Production).

## Local development

```bash
cp .env.example .env.local   # fill in what you need; all values optional locally
npm install
npm run dev                  # http://localhost:3000
```

## Common commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Full production build: validates content, builds the search index, builds twice to embed CSP hashes. **Fails if content is invalid** — this is the safety net for edits. |
| `npm start` | Serve the production build locally (use `npm run build` first) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright, starts its own server on port 3100) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run privacy` / `npm run privacy:build` | Privacy scan of source / built output |
| `npm run cv:pdf` | Regenerate the public CV PDF from content |
| `npm run og:images` | Regenerate OG share cards (only needed if names/roles change) |
| `node scripts/optimise-images.ts` | Re-run the photo pipeline (only when `_sources/photos` changes) |

## Environment variables

All are set in the **Vercel project settings** (never in Git). See [`.env.example`](.env.example) for the template.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes (production) | Canonical origin, e.g. `https://www.example.com`. Drives canonical URLs, `sitemap.xml`, OG image URLs. |
| `RESEND_API_KEY` | For the contact form | Resend API key that sends form submissions. Without it submissions are only logged server-side. |
| `CONTACT_TO_EMAIL` | For the contact form | Destination inbox for enquiries. |
| `CONTACT_FROM_EMAIL` | For the contact form | Verified Resend sender address (domain must be verified in Resend with SPF/DKIM). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional | Shared rate-limit store for the contact form; falls back to an in-memory limiter (fine at this traffic level). |
| `CONTACT_RATE_LIMIT_MAX` | Optional | Override the per-IP rate limit (default 5 per window). |

Test-only variables (`CONTACT_TRANSPORT=mock`, `CONTACT_MOCK_FILE`) are used by the e2e suite and must never be set in production.

## Deployment

1. Vercel is connected to this repository: every pull request gets a **Preview** deployment; merging to `main` deploys **Production**.
2. Production domain, HTTPS enforcement, `www` ↔ apex redirect and Resend DNS records (SPF/DKIM) are configured in Vercel / the domain registrar — see the launch checklist in [`OPEN_ITEMS.md`](OPEN_ITEMS.md).
3. Branch protection on `main` (require PR + passing checks) must be enabled by a repo admin: **Settings → Branches → Add branch ruleset** for `main` with "Require a pull request before merging" and the Vercel/CI status checks. The Devin bot token cannot change this (HTTP 403), so it is a manual step.

## Content safety net

Every content file in `content/` is validated against Zod schemas by `scripts/validate-content.ts`, which runs at the start of every build. An invalid edit makes the Vercel Preview build fail, so a bad edit can never reach production unnoticed. The privacy checker runs on every commit and in CI.
