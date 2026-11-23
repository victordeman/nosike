# SPECIFICATION PROMPT — Portfolio Website for Prof. Austin N. Nosike

> **How to use this file.** Place it at the root of the repo (`victordeman/nosike`) as `SPEC.md`, open Claude Code in that folder, and say: *"Read SPEC.md fully. Start at Phase 0. Work one phase at a time and stop at every GATE for my approval."*
> The repo is currently **empty and public**. That shapes several rules below (see §2).

---

## 0. Operating rules for the agent (read first)

1. **Work in phases.** Complete one phase, run its acceptance checks, summarise what changed, then **stop at the GATE** and wait for approval. Never start the next phase on your own.
2. **Never invent content.** Every biographical fact, number, date, title, or ISBN on the site must come from Appendix A or from the source files in `_sources/`. If something is missing, render nothing or a clearly marked placeholder in dev only, and add it to `OPEN_ITEMS.md`. No lorem ipsum in anything that deploys.
3. **Respect the Open Items (Appendix C).** Where the sources conflict, use the "default" stated there, and flag it in the PR description. Do not silently pick a winner.
4. **Privacy is a hard constraint** (§2). If you are unsure whether something is personal data, leave it out and ask.
5. **Small, reviewable commits** on feature branches (`phase-1-foundation`, `phase-2-content`, …), one PR per phase against `main`. Each PR gets a Vercel Preview URL; post it in the PR description.
6. **Verify, don't assume.** Before choosing versions, run `npm view next version` and confirm current stable releases of Next.js, React, Tailwind, TypeScript. Use the latest stable Next.js App Router. After each phase run `npm run lint`, `npm run typecheck`, `npm run build`, and the tests defined for that phase, and report real output.
7. **Ask only when blocked.** If a decision is genuinely the client's (domain name, contact destination, which photo is the hero, approval of a disputed fact), list it under "Questions for the client" at the gate rather than guessing.

---

## 1. Project brief

**Subject.** Prof. Austin N. Nosike (formal name on CV: *Nosike Austin Njiribeako*). Economist and global management scholar; **Vice Chancellor/President, James Hope University, Lekki-Lagos, Nigeria (2025–present)**; President, African Academy of Economics; 30+ years in higher education across Africa, Europe, the Americas and Asia.

**Purpose.** A personal, authoritative portfolio that presents him as (a) a university executive and quality-assurance leader, (b) a scholar and editor, (c) a policy and capacity-building adviser, (d) a mentor of researchers. It is *his* site, not the university's.

**Audiences (in priority order).**
1. Appointing bodies, governing councils, search committees and accreditation bodies (need a credible, scannable record and a downloadable CV).
2. Academic peers, journal and conference organisers (need publications, editorial roles, events).
3. Government agencies, development partners, event hosts (need policy/consultancy record, speaking topics, contact route).
4. Prospective students, researchers and partner institutions.
5. Journalists / programme organisers (need a media kit: short + long bio, headshots).

**Tone.** Distinguished, warm, plainspoken, African-centred without cliché. Third person on the site ("Prof. Nosike …"), except a short first-person welcome on the home page that he must approve.

**Success criteria.**
- Home page tells a visitor who he is, what he leads, and why he is credible within 10 seconds, with no scrolling needed for the core message.
- Every claim on the site is traceable to a source and none of the excluded personal data is present anywhere in the deployed build, the repo history, or the page source.
- Lighthouse (mobile, home + one inner page): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Fast on mid-range phones and slow 4G (a large share of visitors will be in Nigeria and East/Southern Africa).
- Non-technical owner can update content without touching React code (Phase 8 delivers an edit workflow).

---

## 2. Non-negotiables

### 2.1 Privacy and content governance
The repo is public and Git history is permanent. **Never commit** any of the following, in any file, commit, image metadata, or comment:

- Date of birth, marital status, children, home address.
- Phone numbers and **personal email addresses** (the CV lists two personal Gmail addresses and two mobile numbers — do not publish them). Contact happens through the site form only, delivered to an address the client supplies via environment variable.
- Referees and their email addresses.
- The Chinhoyi University appointment letter (it states an honorarium) and any signed letters, scans, or certificates. Certificates may appear only as cropped, client-approved images in Phase 5.
- Religion (the short bio mentions it) — omit from structured data and facets; the client may approve it as plain bio text.
- Raw source documents. Keep them in `_sources/`, listed in `.gitignore`, never pushed. The five proceedings PDFs are 4–7 MB each and must not go into Git at all.
- **Photo EXIF/GPS metadata.** Strip it from every image during the optimisation step.

Add a pre-commit check (simple script or `gitleaks` + a small custom grep list) that fails if the repo contains `@gmail.com`, `+234`, `date of birth`, or any `.pdf/.docx/.pptx/.zip` under `src/` or `public/` other than the approved CV PDF.

### 2.2 Third-party material
- Do not use the logos of James Hope University, ASCON, AU, UNECA, NCHE, or any institution without written permission. Use text names only until the client supplies approved logo files.
- Several supplied photos show framed portraits of serving public officials on the wall behind him. Do not publish those frames legibly; crop them out or avoid those frames (details in Appendix B).
- The ASCON slide deck contains statistics and statements about named Nigerian agencies and programmes. On the site, show only the talk's title, date, venue, and a one-paragraph abstract. Do not republish those figures or allegations unless the client later supplies sources and approves.

### 2.3 Stack constraints
Next.js (App Router) + TypeScript strict + Tailwind CSS + deployed on Vercel. No database in v1. No client-side data fetching for page content. No heavy UI kits. No third-party trackers beyond Vercel Analytics / Speed Insights. No cookie banner needed if no cookies are set (verify).

---

## 3. Architecture

**Framework.** Next.js App Router, React Server Components by default, static generation (SSG) for all content pages, one Route Handler for the contact form. Node LTS. `pnpm` or `npm` (pick one, commit the lockfile).

**Styling.** Tailwind CSS with design tokens as CSS variables (light + dark). Optional `shadcn/ui` primitives *only* for accessible building blocks (Dialog, Tabs, Accordion, Command/search). Motion via `motion` (Framer Motion) used sparingly; honour `prefers-reduced-motion`.

**Content layer.** Typed, file-based, git-versioned. No CMS in v1.
- `content/*.json` (or `.ts` with `satisfies`) for structured records: career, education, honours, publications, conferences, editorial roles, policy roles, partners, countries.
- `content/*.mdx` for long prose: bio (long/short), welcome note, research statement, talk abstracts.
- Validate every file with **Zod** schemas at build time; the build fails on invalid or missing required fields.

**Forms/email.** Route Handler `POST /api/contact`: Zod validation, honeypot field, minimum-time-to-submit check, per-IP rate limiting (Vercel KV/Upstash if available, otherwise a simple in-memory limiter as a stop-gap), send via **Resend** (or equivalent) using `CONTACT_TO_EMAIL`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` env vars. Never expose the destination address to the client.

**SEO/meta.** `metadata` API, dynamic OG images via `next/og`, `sitemap.ts`, `robots.ts`, JSON-LD (`Person`, `ProfilePage`, `EducationalOrganization` for employer, `ScholarlyArticle`/`Book` for publications). Do **not** put birth date, phone, or email in structured data.

**Env + config.** `.env.example` committed (no real values). `NEXT_PUBLIC_SITE_URL` drives canonical URLs. Fonts via `next/font`.

**Proposed structure**
```
/
├─ SPEC.md  OPEN_ITEMS.md  README.md  .env.example  .gitignore
├─ _sources/                 # git-ignored: original docx/pdf/pptx/zip (client files)
├─ scripts/
│  ├─ extract-cv.ts          # parse CV publications → content/publications.json (dev tool)
│  ├─ optimise-images.ts     # sharp: resize, AVIF/WebP, strip EXIF, rename per manifest
│  └─ check-privacy.ts       # pre-commit / CI privacy grep
├─ content/
│  ├─ profile.json  career.json  education.json  honours.json
│  ├─ publications.json  proceedings.json  editorial.json
│  ├─ conferences.json  policy.json  mentorship.json  countries.json  talks.json
│  └─ bio-short.mdx  bio-long.mdx  welcome.mdx
├─ public/
│  ├─ images/                # optimised, EXIF-stripped, semantic filenames
│  └─ cv/Nosike-CV-public.pdf   # sanitised public CV (no PII), client-approved
└─ src/
   ├─ app/
   │  ├─ (site)/page.tsx                    # Home
   │  ├─ (site)/about/page.tsx
   │  ├─ (site)/leadership/page.tsx
   │  ├─ (site)/education/page.tsx
   │  ├─ (site)/scholarship/page.tsx
   │  ├─ (site)/scholarship/proceedings/page.tsx
   │  ├─ (site)/events/page.tsx
   │  ├─ (site)/policy/page.tsx
   │  ├─ (site)/mentorship/page.tsx
   │  ├─ (site)/honours/page.tsx
   │  ├─ (site)/talks/page.tsx
   │  ├─ (site)/gallery/page.tsx
   │  ├─ (site)/media-kit/page.tsx
   │  ├─ (site)/contact/page.tsx
   │  ├─ api/contact/route.ts
   │  ├─ opengraph-image.tsx  sitemap.ts  robots.ts  not-found.tsx
   ├─ components/ (ui, layout, sections, timeline, publication-list, world-map, gallery)
   ├─ lib/ (content loaders, schemas, seo, format)
   └─ styles/
```

---

## 4. Design direction

**Concept.** "The scholar-statesman's study": calm, high-trust, editorial. Think university-press typography with a confident, modern layout, not a template-looking CV site.

- **Palette.** Deep ink navy as the base, a restrained doctoral-gown green (the regalia in the supplied photos is black with dark green and gold trim) as the primary accent, warm gold as a sparing highlight, off-white paper background. Do not use national-flag colours as a design device. Define tokens, then check WCAG AA contrast for every text/background pair. Provide a dark theme.
- **Type.** A refined serif for headings (e.g. Fraunces, Newsreader, or Source Serif 4) and a clean sans for UI/body (e.g. Inter or Geist) via `next/font`. Body 17–18 px, generous line height, max measure ~70 characters.
- **Layout.** Mobile-first. Large editorial hero with the portrait, name, current title, one-line positioning, and a row of 4 key facts. Sticky minimal header; footer with site map and contact CTA.
- **Signature elements** (build these, they carry the "modern" feel):
  1. **Career timeline**: vertical on mobile, horizontal-scroll or split view on desktop, filterable by sector (Executive / Research / Policy / Media).
  2. **Global footprint map**: lightweight SVG map (no Mapbox/Google) highlighting the countries in `countries.json`, with a country list fallback for screen readers.
  3. **Scholarship explorer**: filter by type (book, chapter, journal article, proceedings, report), decade, and theme; client-side search with a small index (e.g. Fuse.js or Pagefind); deep-linkable via query string.
  4. **Counters** for key facts, animated once on view, final values rendered in HTML so no-JS and reduced-motion users see them.
- **Imagery rules.** Hero uses the best formal portrait (Appendix B). Use regalia photos for the Leadership/Honours context, traditional-attire photos for the About/Gallery, never as the hero unless the client chooses. Rounded or square-cornered, consistent aspect ratios, art-directed crops per breakpoint.
- **Accessibility.** Semantic landmarks, skip link, visible focus, keyboard-operable timeline/filters/map, alt text written for each image (describe, don't identify beyond "Prof. Nosike"), AA contrast, reduced motion, `lang="en"`.

---

## 5. Information architecture

| Route | Purpose | Primary content |
|---|---|---|
| `/` | Home | Hero, key facts, current role, 3 highlight cards (Leadership, Scholarship, Policy), global map teaser, latest talk, contact CTA |
| `/about` | Biography | Short + long bio, approach/values, research interests, languages (English, Spanish) |
| `/leadership` | Executive record | Career timeline, university governance roles, partnerships, quality-assurance work |
| `/education` | Credentials | Degrees, fellowships and postgraduate training, professional memberships |
| `/scholarship` | Publications | Books, chapters/articles/papers explorer, editorial roles |
| `/scholarship/proceedings` | Edited proceedings | The five proceedings volumes with metadata (no PDFs in Git) |
| `/events` | Conferences | Conferences organised/chaired, 2010–2024 |
| `/policy` | Policy & consultancy | AU, UNECA, ASCON, NCHE Namibia, NUC, etc. |
| `/mentorship` | Supervision | Completed/ongoing PhD and Master's supervision, external assessment |
| `/honours` | Recognition | Awards, fellowships, listings, memberships |
| `/talks` | Speaking | ASCON Cohort 14 session; topic list; invite CTA |
| `/gallery` | Photos | Curated gallery, captions |
| `/media-kit` | Press | Short/long bio copy buttons, approved headshots, CV download |
| `/contact` | Contact | Form (no public email/phone) |

---

# PHASES

Effort key: **S** ≈ half a day, **M** ≈ 1–2 days, **L** ≈ 3+ days.

## Phase 0 — Discovery, governance and repo bootstrap  (S)

**Goal.** Make the data, privacy rules and repo safe *before* any UI exists.

**Tasks**
1. Clone `https://github.com/victordeman/nosike`. It is empty; create `main` with an initial commit containing only `README.md`, `.gitignore`, `.env.example`, `SPEC.md`, `OPEN_ITEMS.md`.
2. `.gitignore`: `_sources/`, `.env*` (except `.env.example`), `.next/`, `node_modules/`, `*.pdf`, `*.docx`, `*.pptx`, `*.zip` (then un-ignore only `!public/cv/Nosike-CV-public.pdf`).
3. Ask the user to place the source files in `_sources/` locally (CV/profile docx, short-bio docx, AIMTDS docx, ASCON pptx, the five proceedings PDFs, the 22-photo zip, and the 3 supplied portraits). Do not read the full proceedings PDFs; read only title pages, forewords and tables of contents.
4. Create `OPEN_ITEMS.md` seeded from Appendix C.
5. Write `scripts/check-privacy.ts` (§2.1) and wire it to a Git pre-commit hook (`simple-git-hooks` or Husky) and later to CI.
6. Connect the repo to Vercel (client's account/team) and confirm the Git integration creates Preview + Production deployments from `main`. Do not add a custom domain yet.

**Deliverables.** Initialised repo, privacy tooling, `OPEN_ITEMS.md`, Vercel project linked.
**Acceptance.** `git ls-files` shows no PDF/DOCX/PPTX/ZIP; privacy script passes; a trivial placeholder page deploys on Vercel.

**GATE 0 — ask the client:** domain name; address for contact-form delivery; hero photo choice; decisions on Appendix C items marked **BLOCKER**.

---

## Phase 1 — Foundation and design system  (M)

**Goal.** A deployable shell with the design system, layout, and quality tooling.

**Tasks**
1. Scaffold Next.js (App Router, TS strict, ESLint, Tailwind, `src/` dir, import alias `@/*`).
2. Tooling: Prettier, `typecheck` script, Vitest (unit), Playwright (e2e + `@axe-core/playwright`), Lighthouse CI config, GitHub Actions workflow (lint, typecheck, build, unit, e2e smoke, privacy check).
3. Design tokens (colour, type scale, spacing, radius, shadows), light/dark theme with no flash on load, fonts via `next/font`.
4. Layout primitives: `Container`, `Section`, `Heading`, `Prose`, `Card`, `Badge`, `Button`, `Link`, `Tag`, `Stat`, `Timeline`, `Figure`.
5. Global layout: skip link, sticky header with responsive nav (mobile sheet), footer, theme toggle, `not-found`, `error`.
6. Add Vercel Analytics and Speed Insights (cookie-less configuration).
7. Component gallery route `/_design` (dev only; excluded from sitemap, `noindex`, 404 in production).

**Acceptance.** Build passes; header/footer work by keyboard and on a 360 px viewport; axe has zero serious/critical violations on the shell; CI green; Preview deploy live.

**GATE 1 — client review of look and feel** (palette, type, header/footer) via Preview URL.

---

## Phase 2 — Content model and data population  (M–L)

**Goal.** All content exists as validated, typed data before pages are built.

**Tasks**
1. Define Zod schemas + TS types for each collection (fields in Appendix A headings). Required fields enforce provenance: every record has `source` (file + section) and optional `verified: boolean`.
2. Populate from Appendix A (career, education, honours, memberships, editorial roles, policy roles, conferences, mentorship, countries, proceedings volumes, talks).
3. Build `scripts/extract-cv.ts` to parse the CV's *Publications* section (books, then journal articles/chapters/papers) from the source `.docx` into `content/publications.json`. Normalise: title, venue, year (nullable), type, co-editors, ISBN/ISSN if present. Entries lacking a year keep `year: null` and sort last. Output a report: total parsed, items with no year, suspected duplicates. **Do not hand-fix the data silently**; list anomalies in `OPEN_ITEMS.md`.
4. Write `bio-short.mdx` and `bio-long.mdx` from the two supplied biographies, edited for web (third person, ≤ 120 words short / ≤ 600 words long), removing every excluded item (§2.1) and every disputed claim (Appendix C) until resolved. Mark both as "client approval pending".
5. Build typed content loaders in `src/lib/content.ts` with unit tests (sorting, filtering, grouping by decade).
6. Image pipeline: `scripts/optimise-images.ts` using `sharp`: input from `_sources/photos`, output AVIF + WebP at 480/960/1600 widths, strip EXIF, rename per Appendix B, emit `content/images.json` with width/height, alt text, role, and crop focal point.

**Acceptance.** `npm run build` validates all content; unit tests pass; publication count in `publications.json` is reported against the CV claim "150+" (expect about 106 parsed entries; state the real number, do not force it); no PII in any content file (privacy script green); no image in `public/` contains EXIF GPS (check with `exiftool`).

**GATE 2 — client reviews the data report** (counts, anomalies, the two bios) before any page uses it.

---

## Phase 3 — Core pages: Home, About, Leadership, Education  (L)

**Tasks**
1. **Home.** Hero (portrait, name, "Vice Chancellor/President, James Hope University", positioning line, two CTAs: *Explore his work*, *Download CV*). Key-facts row using only **approved** stats (Appendix A.2). Three highlight cards. Global map teaser. Latest talk. Contact CTA.
2. **About.** Short bio first, expandable long bio, research interests list, languages, values (integrity, transparency, academic excellence, ethical leadership — from the profile), a short photo strip.
3. **Leadership.** The career timeline with filters, each role card showing institution, country, dates, title, and sub-roles (Senate chair, QA committee, etc.). A "Governance & committees" section listing the 22 committees from the CV as a compact tag list. A "Partnerships & institution-building" section using only the claims that survive Appendix C.
4. **Education.** Degrees grouped as *Doctoral*, *Master's*, *Postgraduate fellowships & training*, *Foundation*; professional memberships/fellowships (FIPMD, FICP, FBQS, Chartered Institute of Administration, TRCN registration).
5. Build the **global footprint map** component from `countries.json` with an accessible list alternative.
6. Page-level metadata, OG images, JSON-LD `Person` on Home/About.

**Acceptance.** All four routes render statically; timeline filters work by keyboard; every displayed number appears in Appendix A.2 as *approved*; Lighthouse ≥ targets on Home; no layout shift (CLS < 0.05); alt text on all images.

**GATE 3 — client approval of Home, About, Leadership, Education content and wording.**

---

## Phase 4 — Scholarship, proceedings and events  (L)

**Tasks**
1. **Scholarship explorer** (`/scholarship`): books at top as feature cards (cover placeholders only if client supplies covers), then the searchable/filterable list of chapters, articles and papers. Facets: type, decade, theme (economics, education, gender & development, environment, management/finance, ICT). Theme tags are applied by a **reviewable keyword map** in `content/themes.json`, not by guesswork; unmatched items are tagged "Other" and listed in `OPEN_ITEMS.md`. Copy-citation button per item (APA-style string generated from fields).
2. **Editorial roles** block: journals he edits/chairs (Africa Management Review; African Journal of Development Studies; ASCON International Journal of Management and Public Administration; Journal of Business and Economics; Journal of Social and Educational Research; etc., per Appendix A.6), plus the founding presidency of the African Association of Journal Editors.
3. **Proceedings** (`/scholarship/proceedings`): five edited volumes (Appendix A.7) as cards: conference name, dates, venue, role, publisher/organiser, page count, ISBN/ISSN **only where confirmed** (see Appendix C item 7), and the two papers he co-authored within them. Each card has an optional "Download PDF" button wired to a `proceedingsPdfUrl` field that stays empty until the client approves hosting (use Vercel Blob, never Git).
4. **Events** (`/events`): conferences organised/chaired as a filterable timeline (2010–2024) from Appendix A.5, with role badge (Chair / Scientific Committee / Conference Director) and host institution. Resolve discrepancies per Appendix C item 7 before display; until resolved, show only dates and venues that are consistent across sources.
5. Search index built at build time (Pagefind or Fuse), lazy-loaded.

**Acceptance.** Explorer filters, search and deep links work with JS and degrade to a plain list without JS; the displayed publication total equals the parsed total; the 5 proceedings records match Appendix A.7 exactly; e2e test covers filter + search + deep link; initial JS on `/scholarship` ≤ 150 KB gzipped (search index loaded on demand).

**GATE 4 — client review of publications data, theme tags, and the events/proceedings discrepancies.**

---

## Phase 5 — Policy, mentorship, honours, talks, gallery  (M–L)

**Tasks**
1. **Policy & consultancy** (`/policy`): grouped by institution (African Union Commission; UNECA; ASCON/The Presidency; NCHE Namibia University Audit Panel; NUC Nigeria and other regulators as resource person; Imo State committee), each with role and year where known. Add the short note on his early career in journalism as context for translating research to policy.
2. **Mentorship** (`/mentorship`): 12 PhD and 38 Master's completed, 4 PhD and 7 Master's current; external assessor roles (Bindura University of Science Education, Chinhoyi University of Technology, UTAMU, per bio) and the "18 professorial promotion assessments" claim only if confirmed (Appendix C).
3. **Honours** (`/honours`): awards, fellowships, directory listings, memberships. Group by *Awards & prizes*, *Fellowships & grants*, *Professional fellowships*, *Biographical listings*. Feature the 2025 UNN Alumni Icon Award.
4. **Talks** (`/talks`): feature "Performance Dashboards" (ASCON Mandatory Training Programme for CEOs of Federal Agencies and Parastatals, Cohort 14, theme *Leadership for Policy Execution: From Mandate to Measurable Results*, 4 June 2026, ASCON Complex, Topo-Badagry, Lagos). Show title/date/venue/abstract only (see §2.2). Add "Invite him to speak" CTA and a list of speaking topics the client approves.
5. **Gallery** (`/gallery`): curated grid (Appendix B shortlist, 8–12 images, not all 22), lightbox with keyboard support and captions, categories *Academic life* / *Public engagements* / *Portraits*.
6. Optional: certificate gallery of cropped, client-approved certificates (ULK visiting-professor certification, FICP certificate). Skip if not approved.

**Acceptance.** All pages static; gallery uses `next/image` with correct `sizes`; lightbox trap-focus and ESC work; no image shows legible third-party official portraits (manual review gate); every mentorship number matches the CV.

**GATE 5 — client approval of photo selection and captions.**

---

## Phase 6 — Contact, media kit, public CV  (M)

**Tasks**
1. **Contact page + API.** Fields: name, email, organisation, enquiry type (Speaking, Collaboration/Research, Media, Institutional/Advisory, Other), message, consent checkbox. Zod validation on both client and server, honeypot, min-time check, rate limit, accessible error/success states, no email address shown on the page. Provide `/contact` `noindex` only if the client requests.
2. **Media kit.** Short and long bio with copy buttons, approved headshots (download links to high-res files), key facts, "how to introduce him" one-liner, preferred name forms (Appendix C item 11).
3. **Public CV PDF.** Generate a clean, branded PDF (`@react-pdf/renderer` or print-CSS route rendered with Playwright) from the same JSON content, **excluding all §2.1 items**. Commit only the final approved file at `public/cv/Nosike-CV-public.pdf`. Include a build step so it can be regenerated.
4. Transactional email template for the acknowledgement (optional, off by default).

**Acceptance.** E2E test submits the form against a mocked email transport; spam attempts (honeypot filled, too-fast submit) are rejected; real email delivery verified once in Preview using the client's address; CV PDF contains no phone, personal email, DOB, or referee data (verify with `pdftotext` + grep).

**GATE 6 — client approves the CV PDF and contact flow.**

---

## Phase 7 — SEO, performance, accessibility, security  (M)

**Tasks**
1. **SEO.** Unique titles/descriptions per route; canonical URLs; OG/Twitter images per section; `sitemap.xml`; `robots.txt`; JSON-LD (`Person`, `ProfilePage`; `Book`/`ScholarlyArticle` for books and selected papers); breadcrumb data on inner pages.
2. **Performance budget.** LCP ≤ 2.5 s on simulated Slow 4G mobile; CLS < 0.05; initial JS ≤ 150 KB gz on the heaviest page; images AVIF/WebP with explicit dimensions; `priority` only for the hero; fonts subset and preloaded; no layout-blocking third-party scripts.
3. **Accessibility audit.** Automated axe on every route in CI + manual keyboard and screen-reader pass (NVDA or VoiceOver) of Home, Scholarship explorer, Gallery lightbox, Contact form. Fix to WCAG 2.2 AA.
4. **Security headers** in `next.config`: CSP (nonce or hash based, no `unsafe-inline` scripts), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame-ancestors. Confirm the form route has body-size limits and rejects non-JSON.
5. **Resilience.** Custom 404/500, graceful no-JS behaviour for all content pages, print stylesheet for `/about`, `/leadership`, `/scholarship`.
6. **Privacy review.** Run the privacy script against the *built output* (`.next/` and rendered HTML), not just source. Run `exiftool` on all images served from `/_next/image` samples and `public/`.

**Acceptance.** Lighthouse CI passes the budget in CI for Home, Leadership, Scholarship, Contact; zero axe serious/critical violations; securityheaders-style scan returns A or better; privacy check on built output is clean.

**GATE 7 — sign-off on QA report.**

---

## Phase 8 — Production launch, handover and edit workflow  (S–M)

**Tasks**
1. Set production env vars in Vercel (never in Git): `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Add the custom domain, enforce HTTPS, set `www` ↔ apex redirect, confirm SPF/DKIM for the sending domain so the contact emails do not land in spam.
2. Production checks on the live URL: Lighthouse, form delivery, OG preview (LinkedIn/WhatsApp/X link-preview), sitemap submitted to Google Search Console and Bing Webmaster Tools.
3. Enable branch protection on `main` (PR + passing CI required). Keep Preview deployments for every PR.
4. **Edit workflow for a non-developer.** Choose one and implement:
   - *Option A (recommended):* **Keystatic** (git-based, no database) pointed at `content/`, exposing forms for career, honours, publications, talks, bios; edits create commits/PRs; role-restricted login.
   - *Option B:* a documented "edit JSON on GitHub → Preview → merge" workflow with a one-page guide and a validation bot.
   Whichever is chosen, content validation (Zod) must still gate the build.
5. Handover pack: `README.md` (run, build, deploy, env vars), `CONTENT_GUIDE.md` (how to add a publication, event, honour, photo), `OPEN_ITEMS.md` (status), and a short Loom-style walkthrough script for the owner.

**Acceptance.** Live on the production domain with HTTPS; form delivers to the client; CI required on `main`; the owner (or the client's delegate) successfully makes one content change end-to-end and sees it live.

**GATE 8 — launch approval.**

---

## Phase 9 (optional, post-launch) — Extensions

Prioritise with the client; each is independent:
1. **Spanish version** (`/es`) with `next-intl` or built-in i18n routing, `hreflang`, translated bios and navigation (he speaks Spanish; many past appointments and publishers are Spanish). Translation must be reviewed by a fluent human.
2. **Insights/Writing** section (MDX) for op-eds, public lectures, and convocation lecture texts.
3. **Research impact page** (Google Scholar / ORCID links once he supplies them; do not fabricate profile URLs).
4. **Institution-specific landing** for the African Academy of Economics, AIMTDS (African Institute of Management, Technology and Development Studies, Kigali; originally Development Africa Consortium, founded 1996) as linked organisations, each only with that body's written approval.
5. **Newsletter** or event-invitation mailing list (consent, double opt-in, GDPR-style notice).

---

# APPENDICES

## Appendix A — Content dossier (verified against the supplied files)

> Source labels: **CV** = `Prof_Austin_Nosike_Profile.docx` (profile + full CV, dated 26 Oct 2026); **SB** = `Short_Biography_of_Prof_Austin_Nosike-WU.docx`; **AIM** = `AIMTDS_1.docx`; **PPT** = ASCON "Performance Dashboards" deck; **PROC** = proceedings PDFs. Items marked ⚠ have a conflict in Appendix C.

### A.1 Identity
- Display name: **Prof. Austin N. Nosike**. Formal CV name: *Nosike, Austin Njiribeako* (CV).
- Current: **Vice Chancellor/President, James Hope University (JHU), Lekki-Lagos, Nigeria — 2025–present**; also Professor of Entrepreneurship, Marketing and Economics (James Hope Business School); Head of Partnership, Innovation and Consultancy; Chairman of Senate; Chairman, Senior Management Committee; Member, Governing Council (CV). SB: "second substantive Vice Chancellor of JHU" ⚠.
- **President, African Academy of Economics** (SB, AIM). **Founding President, African Association of Journal Editors** (SB).
- Nationality: Nigerian. Languages: English and Spanish (SB, AIM). Has visited 30+ countries (SB).
- Academic rank: Professor ⚠ (CV says "since 2016").
- Research interests (CV): globalization and development management; human capacity building; business environment; research methodology; quantitative analysis; public/social policy; industrial relations; gender; human rights; environmental management; human ecology; project management; social/corporate re-engineering.

### A.2 Key facts — default display values
| Fact | Display | Source | Status |
|---|---|---|---|
| Years in higher education | "30+ years" | CV, SB | Approved |
| Publications | "150+" as a career claim; the on-site list will show only what is actually itemised (about 106 entries in the CV text) | CV, SB (AIM says 200+) | Approved at 150+ ⚠ — itemised list is shorter (item 3) |
| PhDs supervised to completion | 12 | CV, profile | Approved |
| Master's supervised to completion | 38 | CV, profile | Approved |
| Current supervision | 4 PhD, 7 Master's | CV | Approved |
| Countries with academic appointments/engagements | Derive from `countries.json` | CV, SB | Approved (count computed, not typed) |
| Events convened | "100+ conferences, seminars and workshops" | SB (profile says 70+ conferences) | **Pending** ⚠ |
| International partnerships established | "40+" | SB only | **Pending** |
| Research grants won / projects | 15 grants / 35+ projects | CV | **Pending** |
| Committees chaired/served | do not headline | 70+ (CV) vs 30+ (SB, AIM) vs 22 listed | **Do not display a number** ⚠ |
| Editorial roles | do not headline | 40 (CV) vs 60+ boards (SB) | **Do not display a number** ⚠ |
| Professorial promotions assessed | 18 | CV | **Pending** |

### A.3 Career timeline (CV unless noted)
| Dates | Role | Institution | Place |
|---|---|---|---|
| 2025–present | Vice Chancellor/President; Professor; Chair Senate; Chair Senior Mgmt Cttee; Member Governing Council; Head, Partnership, Innovation & Consultancy | James Hope University | Lekki-Lagos, Nigeria |
| 2023–2025 | Deputy Vice Chancellor (Academics & Research); Professor; Vice Chair Senate; Vice Chair Senior Mgmt Cttee; Chair Higher Degree Research Cttee; Chair Senate Cttee on QA & Resource Mobilization | International University of Equator | Bujumbura, Burundi |
| 2021–2023 | Deputy Vice Chancellor (Academics & Research); Professor; Vice Chair Senate; Vice Chair Senior Mgmt Cttee | Copperstone University | Kitwe, Zambia |
| 2019–2021 | Dean, School of Graduate Studies; Full Professor of Business & Economics; Chair Senate Cttee on Research & Resource Mobilization | University of Kigali | Kigali, Rwanda |
| 2017–2019 | Director of Research, Innovation & Consultancy | Metropolitan International University | Kampala, Uganda |
| 2016–2018 | Full Professor of Management | Avance International University | Kampala, Uganda (SB) |
| 2014–2016 | Director, School of Business & Economics | Ballsbridge University | Dominican Republic |
| 2011–2014 | Associate Professor & Director, Globalization & Development Program | Mediterranean Center for Social and Educational Research (Sapienza, Rome) | Rome, Italy |
| 2008–2011 | Director of Research & Planning | Granada Management Institute | Granada, Spain |
| 2005–2008 | Senior Research Fellow & Head, Dept of Training & Publications | Afro-Euro Centre for Development Studies | Budapest, Hungary ⚠ |
| 2003–2004 | Visiting Senior Fellow | African Management Institute | Addis Ababa, Ethiopia |
| 1999–2005 | Research Fellow → Senior Research Fellow & Head of Research and Training | Development Africa Consortium | Port Harcourt, Nigeria |
| 1996–1999 | Lecturer, Dept of Continuing Education | Alvan Ikoku College of Education | Owerri, Nigeria |
| 1993–1996 | Lecturer, Dept of Liberal Studies | Kaduna Polytechnic | Kaduna, Nigeria |
| 1993–1995 | Part-time Lecturer; later Assistant Co-ordinator, Military Geography & Warfare Program | Nigerian Defence Academy | Kaduna, Nigeria |
| 1990–1991 | Research Assistant II | Technological and Economic Development Mission | Owerri, Nigeria |

**Visiting/concurrent appointments (CV):** Visiting Professor — Kigali Independent University (ULK) (certified 2020–21 and 2021–22 by its DVCA letter, 26 Jul 2025); Dominican University, Ibadan; Ugandan Pentecostal University, Fort Portal; University of Mkar. Visiting Professor, Granada Management Institute / Universidad de Granada (2019–); Visiting Scholar, Universidad del País Vasco (2019–). **SB-only roles needing dates:** Registrar, Kayiwa International University (KINTU); Director of Partnership, Collaboration and Linkages, Ugandan Pentecostal University.

**Pre-academic career (CV):** Features Writer, Daily Star (Enugu) 1987–89; Staff Writer (Features), The Statesman (Owerri) 1989–90; Senior Staff Writer & Ag. Asst Editor (Business), News Flash 1991–92; Principal Partner, J. Charlot & Fyne Ltd (1997–); Managing Director & CEO, JCF Publishing (1999–); President, Development Africa Consortium (founded 1996, per AIM).

### A.4 Education (CV; naming conflicts in Appendix C item 5)
- **PhD Economics** (Development Economics & Public Policy), Universidad Central de Nicaragua, 2016 (SB: with distinction).
- **PhD Business Administration** (Marketing & Entrepreneurship), Universidad Azteca, Chalco, Mexico, 2011; **MBA** (Finance & Accounting), Universidad Azteca, 2005 ⚠.
- **Master's**, Universidad Católica San Antonio de Murcia (UCAM), Spain ⚠ (field).
- Postgraduate Fellowship in *Globalization, Power and Resistance*, Central European University, Budapest, 2006–2007.
- Postgraduate training in International and Comparative Human Rights Law, International Institute of Human Rights, Strasbourg, 2005.
- Postgraduate training/coursework in *Economy, State and Society*, Institute of Social Studies, Warsaw, 2004–2005 (SB names "Centre for Social Studies, Warsaw" and University of Lancaster, UK ⚠).
- MBA (Marketing), Rivers State University of Science & Technology, 1997–1999.
- PGD Management, Imo State University, 1995–1996.
- B.Sc. (Hons) Social Studies (Economics), Upper Second Class, University of Nigeria, Nsukka (1991–93, 1995–97) and B.Sc. (Hons) Geography.
- NCE Social Studies (Distinction), Anambra State College of Education, Awka, 1987–1990.
- Diploma in Business Administration (Distinction) and Higher Diploma in Mass Communication, Chartered Institute of Administrators, 1987–1991.
- **Professional:** Fellow, Institute of Policy Management Development (FIPMD); Fellow, Chartered Institute of Professionals (FCIP/FICP; certificate dated 14 Aug 2016 — "Level 8, equivalent of a doctorate") ; Fellow, Board of Quality Standards (FBQS); Member, Chartered Institute of Administration; Certified Teacher (TRCN).

### A.5 Conferences organised/chaired (CV list; PROC adds; discrepancies in Appendix C item 7)
- 8–10 Nov 2010, Oviedo, Spain (International Association for the Scientific Knowledge): Global Management; E-Activity and Leading Technologies; Tourism; Iberia-Americano — *Scientific Committee Member*.
- Sep 2012: Congress on Social and Cultural Studies and Business and Economic Research, Ignatius Ajuru University of Education, Port Harcourt — *Chair*.
- Sep 2012: Environmental Studies and Research; Agriculture, Science and Engineering — Rivers State University of Science & Technology, Port Harcourt — *Chair* ⚠ (PROC shows 1–4 Jul 2013, FCE(T) Umunze).
- 22–26 Oct 2012: Science and Technology Education (ICSTE2012), Alvan Ikoku Federal College of Education, Owerri — *Chair*.
- 23–27 Oct 2012: International Conference on Teaching and Learning (ICTL2012), Abuja (PROC; not in CV list).
- 1–4 Jul 2013: IIC2013, ICASE2013, ICESR2013, FCE(T) Umunze, Anambra (PROC; not in CV list).
- Oct 2018: Abuja International Conference on Human and Social Sciences.
- 3–4 Mar 2015: Trends & Innovative Practices in Education, Phagwara, Punjab, India.
- ICETC2019 (Educational Technology and Curriculum Studies), Mediterranean Center for Educational and Social Research.
- ICGWS2020 (Gender and Women Studies), International Association for Teaching and Learning.
- AICWER2023: Abuja International Conference on Water, Energy and Environmental Research (European Scientific Institute).
- 1–4 May 2024: International Conference on Strategic Leadership and Management Entrepreneurial Education, Association of Leaders and Policy Professionals, Port Harcourt.

### A.6 Editorial roles
Chairman, Editorial Board, *ASCON International Journal of Management and Public Administration*; Editor-in-Chief, *Journal of Business and Economics*; Editor-in-Chief, *Journal of Social and Educational Research*; Editor, *Africa Management Review* (African Management Institute, 2003–); Editor, *African Journal of Development Studies* (1999–); Managing Editor, *Journal of Social and Policy Studies*; Editor, *African Development Review*; Consulting Editor, *Journal of Economics and Contemporary Policies*; Secretary, Editorial Board, *African Journal of Research in Education* (2000–); Member, Editorial Board, *Journal of Women Studies and Research*. Editorial consultant/consultant to Tonyben Publishers, Macmillan Press (Lagos), Ihem Davis Press, Fourth Dimension Publishers. Founding President, African Association of Journal Editors (SB).

### A.7 Edited proceedings (verified from the PDFs)
| Code | Title | Dates & venue | Published by | Pages | His role | Identifiers as printed |
|---|---|---|---|---|---|---|
| ICTL2012 | International Conference on Teaching and Learning, Vol. 1 | 23–27 Oct 2012, Abuja | International Association for Teaching and Learning (IATEL), Granada | 236 | Lead editor; Project Director | ISSN 2224-946X; Legal Deposit MU-705-2012 |
| ICSTE2012 | International Conference on Science and Technology Education, Vol. 1 | 22–26 Oct 2012, Owerri | IATEL, Granada | 343 | Lead editor; Project Director | ISBN 978-84-612-8486-3 ⚠; LD MU-706-2012 |
| ICASE2013 | International Conference on Agriculture, Science and Engineering | 1–4 Jul 2013, FCE(T) Umunze | Beverly Scientific Organisation, Granada | 237 | Editor; Conference Director | ISBN 978-84-612-8486-3 ⚠; LD MU-0704-2012 |
| ICESR2013 | International Conference on Environmental Studies and Research | 1–4 Jul 2013, FCE(T) Umunze | Beverly Scientific Organisation, Granada | 287 | Editor; Project Director | ISBN 978-84-612-8488-7; LD MU-0702-2012 |
| IIC2013 | International Interdisciplinary Conference on Education and Development | 1–4 Jul 2013, Umunze | IATEL, Granada | 352 | Editor; General Coordinator | not captured |

His own papers inside these volumes: *Co-operative Occupational Education: A Strategy for Preparing Youths for Employment in Agriculture* (with Ephraim A. Orikpe), ICASE2013; *Sustainability as a Strategy of Responsible and Competitive Development* (with José G. Vargas-Hernández), ICESR2013.

### A.8 Books (CV; authored vs edited to be confirmed — Appendix C item 8)
*Adjustment and Development in Nigeria* (1999); *Leadership and Development in Nigeria* (2000); *An Ideal Republic* (2000); *Creating Job Opportunities in Nigeria* (2001); *Education and Development in Imo State* (commissioned report, 1994); *Issues of Information Communication Technology (ICT) in Education* (Kanishka, New Delhi); *Outlook on Economic and Business Environment* (Granada, 2008; ISBN 978-84-612-8482-5; he is listed as editor); *Perspectives on Globalization, Development and Public Policy* (Granada; ISBN 978-84-612-8474-0); *The State of Education in a Global Age* (Granada; ISBN 978-84-612-8476-4); *Environmental Health in the Niger Delta* (Port Harcourt); *Essays on the Niger Delta* (Granada; ISBN 978-84-612-8472-6). The full articles/chapters/papers list (about 106 bulleted entries in total including the books, c. 1990–2020) is parsed from the CV in Phase 2. The CV says "see list attached" for the 150+ claim, so a longer list may exist; ask the client for it.

### A.9 Policy, consultancy and public service
- Technical Advisor, Administrative Staff College of Nigeria (ASCON), The Presidency; **Facilitator, Mandatory Training Programme for CEOs of Federal Government Agencies and Parastatals, Cohort 14** (31 May–6 Jun 2026; his session 4 Jun 2026; invitation DG.40/XV/440 from the ASCON Director-General dated 19 May 2026); Chair, Editorial Board of ASCON's journal; member of the 2026 Promotion and Conversion Examination for ASCON senior staff; Member, Strategy Group for the establishment of the National School of Government.
- **Chairperson, University Audit Panel, National Council for Higher Education (NCHE), Namibia (2024)**.
- Consultant on Human Capacity Building and Member, Selection Team, **African Union Commission**, Addis Ababa (from 2003/2004).
- Consultant on Water, Sanitation and Human Ecology, **UN Economic Commission for Africa**; Nigerian/West African delegate at the Pan-African Summit on Water (2003), African Civil Society Consultative Meeting (2004), African Hunger Summit (2004); Chair, Human Settlement Session (Africa), CSD-12; observer at the 2003 African Ministerial Council on Water and Sanitation, and at AU Assembly/Executive Council sessions.
- Resource person/consultant to (names as written in the CV): Higher Education Council of Rwanda; National Council for Higher Education, Uganda; "Kenyan University Commission" (confirm the exact name); National Universities Commission, Nigeria; NCHE, Namibia.
- Member, Imo State Committee on the Review of Education and Development (1995).
- Civic: Founder, Cajetan Nosike Memorial Trust (1999); Trustee, Youths for Christ Foundation; Chairman, Board of Trustees, Centre for Environment and Community Development (2002–); Co-founder, Network on Water and Development in Nigeria (2003); Secretary, Niger Delta Network on Human Rights; Project Team Leader, Niger Delta Environmental Health Project (2003–).

### A.10 Honours, awards, recognitions
2025 University of Nigeria Alumni **ICON Award** (SB; CV "UNN Alumni Icon Award"); Central European University Fellowship Award 2006 and Travel Research Grant 2006/07; Polish Ministry of Foreign Affairs Travel Research Grant 2006; International Institute of Human Rights Fellowship Award; 1999 International Youth of the Year Award (Africa), International Biographical Centre, Cambridge; 20th Century Award for Achievement in Education (IBC, England); Marquis *Who's Who in the World*; *International Who's Who of Professionals* (USA); *Dictionary of International Biography* (29th ed.); First Prize, International Essay Competition for Nigerian University Students (Forum for the Advancement of Nigeria, Philadelphia) ⚠ year; Imo State Government Scholarship 1991; Second Best Graduand (Social Studies), UNN; Best Research Project Graduand, Anambra State College of Education; Special Commendation, Imo Newspapers Ltd (*The Statesman*), 1990. AIM also lists a *West Coast University Research Award* (not in CV).

### A.11 Countries (derive `countries.json` from these; mark role type)
Nigeria, Burundi, Zambia, Rwanda, Uganda, Kenya, Zimbabwe, Malawi, Namibia, Tanzania, Ethiopia, Spain, Italy, Hungary, Poland, France, United Kingdom (SB study), Dominican Republic, Mexico (study), Nicaragua (study), India (events), United States (Open Christian University, per SB). Keep only those the client confirms.

### A.12 Related institution (for the footer "affiliations" line, text only)
African Institute of Management, Technology and Development Studies (AIMTDS), Kigali — Board/Governing Council member (AIM). Originally Development Africa Consortium, founded 1996.

---

## Appendix B — Photo manifest (22 images from the zip + 3 supplied portraits)

All supplied photos are treated as depicting Prof. Nosike as provided by the client. Image quality is **phone-camera selfie quality** (540×960 to 750×1000 for most), so the hero and any large display need care: do not upscale; use `object-fit` with sensible focal points; the client should be offered a professional portrait session before launch (record this in `OPEN_ITEMS.md`).

Rename on optimisation using the "Target name". The pipeline is source-order-based (sorted by filename). Roles are *suggestions from a visual review*; the client decides the hero (Gate 0).

| # | Source file (`WhatsApp Image 2026-11-18 at …`) | Size | What it shows | Suggested use | Target name |
|---|---|---|---|---|---|
| 0 | 21.09.05 (1).jpeg | 540×960 | Navy suit, yellow striped tie, window blinds | Formal portrait (secondary) | `portrait-suit-navy.jpg` |
| 1 | 21.09.05 (2).jpeg | 540×960 | Burgundy blazer, striped tie | Gallery | `portrait-blazer-burgundy.jpg` |
| 2 | 21.09.05.jpeg | 720×1280 | Charcoal suit, blue patterned tie | **Hero candidate (formal)** | `portrait-suit-charcoal.jpg` |
| 3 | 21.10.03 (1).jpeg | 750×1000 | Full doctoral regalia (black/green/gold) with cap | **Leadership / Honours banner** | `regalia-full-a.jpg` |
| 4 | 21.10.03.jpeg | 540×960 | Mustard blazer | Gallery | `portrait-blazer-mustard.jpg` |
| 5 | 21.10.04 (1).jpeg | 720×1280 | Mustard shirt, patterned cap | About / culture | `portrait-traditional-cap-mustard-a.jpg` |
| 6 | 21.10.04 (2).jpeg | 720×1280 | Same outfit, closer | Gallery | `portrait-traditional-cap-mustard-b.jpg` |
| 7 | 21.10.04.jpeg | 750×1000 | Full doctoral regalia with cap | **Leadership / Honours banner** | `regalia-full-b.jpg` |
| 8 | 21.12.07.jpeg | 720×1280 | Dark tunic, curtain backdrop | Gallery | `portrait-tunic-dark.jpg` |
| 9 | 21.12.08 (1).jpeg | 720×1280 | Royal-blue tunic | Gallery | `portrait-tunic-blue-a.jpg` |
| 10 | 21.12.08.jpeg | 720×1280 | Black tunic with embroidered cap; small framed official portrait beside him | About / culture (crop the frame out) | `portrait-tunic-black-cap-a.jpg` |
| 11 | 21.12.09 (1).jpeg | 720×1280 | Maroon tunic | Gallery | `portrait-tunic-maroon-a.jpg` |
| 12 | 21.12.09 (2).jpeg | 720×1280 | Maroon tunic, room behind | Gallery | `portrait-tunic-maroon-b.jpg` |
| 13 | 21.12.09 (3).jpeg | 720×1280 | Maroon tunic, hand on chest | Skip (awkward crop) | — |
| 14 | 21.12.09 (4).jpeg | 720×1280 | Maroon tunic, hand at chin (thoughtful) | About (pull-quote) | `portrait-tunic-maroon-thoughtful.jpg` |
| 15 | 21.12.09 (5).jpeg | 720×1280 | Black tunic, cap | Gallery | `portrait-tunic-black-cap-b.jpg` |
| 16 | 21.12.09 (6).jpeg | 720×1280 | Blue tunic; **framed official portraits behind** | **Do not use uncropped** | — |
| 17 | 21.12.09.jpeg | 720×1280 | Navy tunic, window | Gallery | `portrait-tunic-navy.jpg` |
| 18 | 21.12.10 (1).jpeg | 720×1280 | White kaftan, wall clock | Gallery | `portrait-kaftan-white-a.jpg` |
| 19 | 21.12.10 (2).jpeg | 720×1280 | White kaftan | **Hero candidate (approachable)** | `portrait-kaftan-white-b.jpg` |
| 20 | 21.12.10 (3).jpeg | 1280×960 | White kaftan, speaking at a desk; Nigerian flag and **framed official portraits** | Talks page — **crop to remove frames** | `speaking-desk.jpg` |
| 21 | 21.12.10.jpeg | 720×1280 | Tan tunic, seated; tiny framed portraits far background | Gallery (crop or accept at small size) | `portrait-tunic-tan.jpg` |
| S1 | (supplied) `…d64d1763-image.jpg` | 960×1280 | Close-up, dark suit, purple dotted tie, low selfie angle | **Do not use as hero** (angle/lighting) | — |
| S2 | (supplied) `…85b61b03-image.jpg` | 960×1280 | White kaftan at conference table; **framed official portraits with captions behind** | Talks (crop tight, frames out) | `talk-session-a.jpg` |
| S3 | (supplied) `…6e2241eb-image.jpg` | 1280×960 | White kaftan, Nigerian flag, **four framed official portraits** | Talks (crop tight, frames out) | `talk-session-b.jpg` |

Curated gallery shortlist (Phase 5): #2, #3, #7, #14, #19, #10, #5, #20-cropped, S2-cropped, #11 (8–12 total after client review).
Image rules: AVIF + WebP + JPEG fallback; widths 480/960/1600 (never above source width); strip all metadata; keep an `images.json` with `alt` text. Alt text format: "Prof. Austin Nosike in doctoral regalia, standing" (describe, don't speculate).

---

## Appendix C — Open Items, conflicts and defaults

**BLOCKER** = needs the client's answer before the item is published; the default in the right column applies meanwhile.

| # | Issue | What the sources say | Default until resolved |
|---|---|---|---|
| 1 | **Stray text from another application** | The profile says he will "make **NUL** a destination of choice for scholars and funders across Africa" (a different institution) | **Never publish.** Remove from all bios |
| 2 | **Date and rank of professorship** | CV: "Professor since 2016"; FICP certificate dated 14 Aug 2016 calls him *Associate* Professor | Say "Professor"; omit "since 2016". **BLOCKER** |
| 3 | **Headline counts disagree** | Publications 150+ (CV, SB) vs 200+ (AIM), but only about 106 entries are itemised in the CV (it refers to an attached list we were not given); committees 70+ (CV), 30+ (SB/AIM), 22 listed; events 100+ (SB) vs 70+ conferences (CV); editorial roles 40 (CV) vs 60+ boards (SB); research programmes 20 / 30 / 35 projects | Use A.2 defaults; do not display disputed numbers |
| 4 | **JHU details** | CV: Vice Chancellor/President 2025–; SB: "second substantive Vice Chancellor" | Display "Vice Chancellor/President, JHU"; omit "second substantive". Confirm start date |
| 5 | **Degree names and fields** | Business: "PhD Business Administration" (CV, SB) vs "DBA" (AIM); Master's (Mexico): "MBA Finance & Accounting" (CV) vs "MSc Accounting and Finance" (AIM); UCAM Master's: "Entrepreneurship & Innovation" (CV) vs "Management" (SB, AIM); Warsaw: "Institute of Social Studies" (CV) vs "Centre for Social Studies" (SB/AIM); Lancaster UK appears in SB/AIM, not CV | Use the CV wording; omit Lancaster until confirmed. **BLOCKER** (credentials are scrutinised) |
| 6 | **Afro-Euro Centre location** | CV: Budapest; SB: Accra, Ghana | Show Budapest (CV dates 2005–08), omit Accra |
| 7 | **Conference dates/venues and identifiers** | CV: ICASE and ICESR 3–7 Sep 2012, Rivers State Univ. of Science & Technology; Proceedings: both 1–4 Jul 2013, FCE(T) Umunze. ICTL2012 and IIC2013 are in the proceedings but not in the CV list. ICSTE2012 and ICASE2013 print the **same ISBN** (978-84-612-8486-3); ICASE2013 (2013) carries a "2012" legal-deposit number | Show the dates printed in the proceedings volumes (primary evidence); **do not display ISBN** for ICSTE2012/ICASE2013 until verified. **BLOCKER** |
| 8 | **Authored vs edited books** | The profile calls *Adjustment and Development in Nigeria* and *Perspectives on Globalization…* "authored"; the CV lists all books together and shows *Outlook on Economic and Business Environment* as edited | Label each as "Author" or "Editor" only after the client confirms; until then show "Book" |
| 9 | **Essay prize year** | SB: 1992; CV: 1993–94 | Show "International Essay Competition for Nigerian University Students" without a year |
| 10 | **Bio-only roles** | Registrar at KINTU; Director of Partnership at UPU; Open Christian University (Delaware); West Coast University Research Award; "40+ international partnerships"; Retention Enhancement Project; pioneering blended/e-learning | Include only with dates/confirmation; otherwise omit |
| 11 | **Name forms** | "Nosike Austin Njiribeako" (CV), "Prof. Nosike Austin" (ASCON), "Austin N. Nosike" (publications) | Site: **Prof. Austin N. Nosike**; media kit lists accepted forms. Keep the author form "Nosike, A. N." in citations |
| 12 | **ASCON session time** | Invitation: 11:00–12:30; slide: 12:15 PM | Show date only (4 June 2026) |
| 13 | **Religion and family** | SB mentions faith; CV lists marital status | Omit both |
| 14 | **Domain, contact destination, social/ORCID/Scholar URLs** | Not supplied | Use env vars; render no social links until supplied. **BLOCKER** (domain, contact destination) |
| 15 | **Logos and cover images** | None supplied | Text-only until supplied with permission |
| 16 | **Photo quality / hero** | Selfie-grade photos | Offer a professional portrait session; choose hero at Gate 0 |

---

## Appendix D — Definition of Done (whole project)

- [ ] Live on the production domain, HTTPS, canonical redirects set.
- [ ] All routes in §5 shipped; every number/claim traceable to Appendix A; all **BLOCKER** items in Appendix C resolved or the affected content removed.
- [ ] Privacy check clean on source, built output, images, public CV PDF, and Git history (no excluded data ever committed).
- [ ] Lighthouse and axe budgets pass in CI; manual keyboard + screen-reader pass recorded.
- [ ] Contact form delivers to the client; spam protections verified.
- [ ] Public CV PDF approved and regenerable.
- [ ] Edit workflow demonstrated by the client end-to-end.
- [ ] `README.md`, `CONTENT_GUIDE.md`, `OPEN_ITEMS.md` complete; `main` protected; CI required.
