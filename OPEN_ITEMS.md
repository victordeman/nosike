# Open items

Seeded from SPEC.md Appendix C. **BLOCKER** items need the client's answer before the item is published; the default column applies until then.
Update the **Status** section below as decisions arrive; never resolve a conflict silently in content.

## Gate 0 decisions requested

| Decision                                                                                           | Status                    |
| -------------------------------------------------------------------------------------------------- | ------------------------- |
| Domain name                                                                                        | Pending                   |
| Contact-form delivery address                                                                      | Pending                   |
| Hero photo (suggested: `portrait-suit-charcoal` formal, or `portrait-kaftan-white-b` approachable) | Decided 2026-11-25: `regalia-full-a` (doctoral regalia, client-supplied) |
| #2 Professorship rank/date                                                                         | Pending (default applies) |
| #5 Degree names and fields                                                                         | Pending (default applies) |
| #7 Conference dates/venues/ISBNs                                                                   | Pending (default applies) |
| #14 Social / ORCID / Google Scholar URLs                                                           | Pending (none rendered)   |

## Phase 2 data report (for Gate 2 review)

- **Publications:** `content/publications.json` holds **108 parsed entries** (10 books + 98 articles/chapters/papers/reports/theses/lectures/unpublished), parsed by `scripts/extract-cv.ts` from the CV's Publications section. The CV claims "150+" and refers to an attached list that was not supplied — the itemised CV text yields 108, so the site's itemised list will show 108 unless the client supplies the fuller list (Appendix C item 3).
- **No-year entries:** 19 entries have `year: null` (mostly undated books, lectures and papers) and sort last.
- **Suspected duplicates:** "Gender, Forest Resources Management and Sustainable Household Economies in South-Eastern Nigeria" appears twice (journal article without year + 2008 book chapter), and "Open and Distance Learning in Nigeria: Development, Policy Options and Challenges" appears twice (journal article + conference paper). Neither merged; both kept.
- **Source corruption repaired in the parser (transparent FIX):** the CV docx glues "Perspectives on Globalization, Development and Public Policy" onto the previous book's ISBN, dropping its capital "P" (`…8482-5erspectives…`). The parser splits it and restores "Perspectives"; the title matches Appendix A.8. The CV also prints "lbadan" (lowercase L) for Ibadan in one chapter citation; repaired to "Ibadan".
- **Classification note (client to confirm):** the CV files "Education and Development in Imo State" under Books, but it is a commissioned research report for the Ministry of Education and Imo Newspapers Ltd — the parser classifies it as `report` (venue keeps the commissioning organisations). Move back to Books if the client disagrees.
- **Citation detail now preserved:** journal volume/issue/month (e.g. "Vol. 3, No. 2", "Vol. 10 (July)") is kept in `issue`; book chapters keep their `editors`, `place` and `publisher` (13 chapters); the unpublished project "Role of Cooperatives in Rural Development" is kind `unpublished` (new enum value) instead of journal-article.
- **Books:** 10 entries remain `kind: "book"` (the 11th Appendix A.8 item is the commissioned report noted above) with publisher/place/ISBN where printed. Author-vs-editor roles remain `unknown` until the client confirms (Appendix C item 8) — books display as "Book".
- **Conferences:** 5 proceedings-verified events marked `verified`; CV-list-only events (including the ⚠ September 2012 Rivers State entry with conflicting dates in Appendix C item 7) marked `pending`.
- **Proceedings:** ICSTE2012 and ICASE2013 print the same ISBN (978-84-612-8486-3); per Appendix C item 7 the ISBN is **not** in `content/proceedings.json` and both volumes are `pending`.
- **Countries:** Zimbabwe, Malawi, Tanzania, United Kingdom (Lancaster, Appendix C item 5) and United States (Open Christian University, Appendix C item 10) have empty role lists and `verified: false` — kept only so the map matches Appendix A.11; client to confirm or drop.
- **Bios:** `content/bio-short.mdx` (103 words) and `content/bio-long.mdx` (473 words) are edited from the supplied biographies with excluded items removed (religion, family, referees, personal contacts, the "NUL" claim, disputed counts) and carry `approval: client approval pending`. Word limits and the approval flag are enforced by `scripts/validate-content.ts` during `npm run build`.
- **Photos:** 22 of 25 supplied images optimised (3 excluded per Appendix B: awkward crop, legible framed official portraits, low-angle selfie). All outputs are EXIF-stripped; the five Appendix B crop notes (framed portraits behind #10, #20, S2, S3, and tiny background frames #21) are applied as fractional crops before resizing, and `content/images.json` records `file` (base name), `widths`, `width`/`height`, `alt`, `role` and focal point.

## Phase 4 notes (for Gate 4 review)

- **Theme tagging:** `content/themes.json` is the reviewable keyword map. Matching is title-only, case-insensitive, word-boundary. 106 of 108 publications match at least one of the six spec themes; **2 are tagged "Other"** and listed below. Themes per publication: economics 67, education 42, management-finance 33, environment 23, gender & development 16, ICT 3.
- **Tagged "Other" (review the keyword map or re-classify):**
  - *An Ideal Republic* (book)
  - *United Nations, Humankind and Proliferation of Dangerous Weapons* (journal article)
- **Events discrepancy handled per Appendix C item 7:** the CV-only `conf-rsu-2012` entry ("September 2012, Rivers State University") is **removed from `content/conferences.json`** until the client resolves it — its dates and venue conflict with the proceedings-verified 1–4 July 2013 FCE(T) Umunze records, and the spec allows only source-consistent dates/venues on display. The proceedings-backed ICTL/ICSTE/ICASE/ICESR/IIC 2012–2013 records carry the verified dates.
- **Search index:** `scripts/build-search-index.ts` (part of `npm run build`) writes `public/search-index.json` (gitignored) from the same 108 records; the explorer lazy-loads it together with Fuse.js on first search.
- **Proceedings downloads:** `proceedingsPdfUrl` is optional in the schema and empty for all five volumes — the Download PDF button renders only when the client approves hosting (Vercel Blob, never Git).

## Phase 5 notes (for Gate 5 review)

- **Gallery:** the Appendix B shortlist (10 images) is categorised in `content/images.json` (`galleryCategory`: portraits / academic / engagements). Final selection and captions await client approval (Gate 5). The optional certificate gallery is skipped — no client-approved cropped certificates yet.
- **Mentorship:** supervision figures (12 PhD / 38 Master's completed; 4 PhD / 7 Master's current) come from the approved A.2 values. The CV's "18 professorial promotion assessments" claim was withheld at Gate 5 and **confirmed by the client on 2026-11-25** — now displayed as an approved external-assessment record.
- **Honours:** pending records (essay prize — year unknown per Appendix C item 9) display with a "Pending confirmation" badge. The West Coast University Research Award (AIM-only, not in CV) was **removed at client request on 2026-11-25**. The "Professional fellowships" group has no records and is omitted.
- **Talks:** the ASCON "Performance Dashboards" abstract is a neutral one-paragraph description written from the session title/theme only — no deck figures or statements (SPEC §2.2). The two 1996/2000 guest lectures show venue/date with "topic to be supplied by client". **Speaking-topics list for the "Invite him to speak" CTA still needs client approval** — the page links to /contact meanwhile.
- **Policy:** the 18 records are grouped explicitly in `src/app/policy/page.tsx` (GROUPS); the "Kenyan University Commission" record stays pending (exact name to confirm).

## Phase 6 notes (for Gate 6 review)

- **Contact form/API:** `POST /api/contact` with shared Zod schema, honeypot, 2-second minimum-fill-time, and a per-IP fixed-window limiter (5 per 10 minutes; in-memory stop-gap — Upstash env vars are reserved in `.env.example` but not wired yet). Transport order: `CONTACT_TRANSPORT=mock` (writes JSONL, used by e2e) → Resend when `RESEND_API_KEY` + `CONTACT_TO_EMAIL` + `CONTACT_FROM_EMAIL` are set → log-only fallback. **Real delivery still needs the client's destination address and a verified Resend sender** (Gate 0 item 2 / Phase 8 checklist); until then submissions are only logged server-side.
- **Public CV PDF:** `npm run cv:pdf` regenerates `public/cv/Nosike-CV-public.pdf` (committed) from the approved content JSON via Playwright print — 12 pages, verified with `pdftotext` to contain no phone numbers, personal email addresses, birth dates or referee contacts. Pending/unverified records (honours, talks, policy, mentorship, career) are excluded. The header uses the placeholder Vercel URL until the domain is decided (Gate 0 item 1).
- **Media kit:** bios with copy buttons, key facts, name forms (Appendix C item 11), and four gallery-approved portraits. Downloads are the highest-resolution approved files (480 px JPEG); the original photos are only ~540–720 px wide, so print-resolution files must come from the client (noted on the page).
- **E2E:** contact flow runs against the mock transport (`CONTACT_TRANSPORT=mock`, file at `tmp/e2e-contact.jsonl`); spam (honeypot, too-fast) is rejected with 400.

## Phase 8 notes (launch/handover)

- **Edit workflow:** Option B (documented GitHub edit → Preview → merge) implemented — see [`EDIT_WORKFLOW.md`](EDIT_WORKFLOW.md) and [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md). Keystatic (Option A) deferred: needs extra auth setup and is unproven on Next.js 16 + Turbopack + PPR; revisit post-launch if edit volume justifies it. Zod validation gates every build, so invalid content can never publish.
- **Branch protection on `main`:** manual repo-admin step (bot token gets HTTP 403) — Settings → Branches → ruleset for `main` requiring a PR and the Vercel/CI checks. Also still manual: move `ci/github-actions-ci.yml` to `.github/workflows/ci.yml` to activate CI.
- **Launch checklist still blocked on client (Gate 0):** domain name (needed for `NEXT_PUBLIC_SITE_URL`, canonical URLs, sitemap, OG tags, CV header), contact-form destination address and verified Resend sender (SPF/DKIM), speaking-topics list for the talks CTA, proceedings PDF hosting approval.
- **Production checks pending domain:** Lighthouse on live URL, form delivery end-to-end, OG link previews, sitemap submission to Google Search Console / Bing.

## Status log

- Phase 0: items seeded; all defaults applied.
- 2026-11-25 (post-Gate 6): client supplied three media-kit key facts (18 professorial promotion assessments as External Assessor, 15 research grants, 35+ projects) and requested removal of the West Coast University Research Award. Key facts added to `profile.json`; award record deleted; promotion claim confirmed and published on /mentorship.
- Phase 2: content model populated; data report above awaits Gate 2 client review.
- Phase 4: scholarship explorer, editorial block, proceedings and events pages built; theme tags and events discrepancies above await Gate 4 client review.
- Phase 5: policy, mentorship, honours, talks and gallery pages built; photo selection/captions await Gate 5 client review.
- Phase 6: contact page + API, media kit and public CV PDF built; CV PDF and contact flow await Gate 6 client review.
- 2026-11-25: hero photo decided by client — `regalia-full-a` (doctoral regalia portrait) on the home hero (PR #10).
- 2026-11-25: Phase 7 merged (PR #9, Gate 7 approved by merge) — SEO, performance, accessibility, security headers, privacy-on-build.
- 2026-11-25: Phase 8 handover pack delivered (README, CONTENT_GUIDE, EDIT_WORKFLOW, OWNER_WALKTHROUGH); production env vars/domain await Gate 0 answers.
