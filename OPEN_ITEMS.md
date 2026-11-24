# Open items

Seeded from SPEC.md Appendix C. **BLOCKER** items need the client's answer before the item is published; the default column applies until then.
Update the **Status** section below as decisions arrive; never resolve a conflict silently in content.

## Gate 0 decisions requested

| Decision                                                                                           | Status                    |
| -------------------------------------------------------------------------------------------------- | ------------------------- |
| Domain name                                                                                        | Pending                   |
| Contact-form delivery address                                                                      | Pending                   |
| Hero photo (suggested: `portrait-suit-charcoal` formal, or `portrait-kaftan-white-b` approachable) | Pending                   |
| #2 Professorship rank/date                                                                         | Pending (default applies) |
| #5 Degree names and fields                                                                         | Pending (default applies) |
| #7 Conference dates/venues/ISBNs                                                                   | Pending (default applies) |
| #14 Social / ORCID / Google Scholar URLs                                                           | Pending (none rendered)   |

## Phase 2 data report (for Gate 2 review)

- **Publications:** `content/publications.json` holds **108 parsed entries** (11 books + 97 articles/chapters/papers/reports/theses/lectures), parsed by `scripts/extract-cv.ts` from the CV's Publications section. The CV claims "150+" and refers to an attached list that was not supplied — the itemised CV text yields 108, so the site's itemised list will show 108 unless the client supplies the fuller list (Appendix C item 3).
- **No-year entries:** 19 entries have `year: null` (mostly undated books, lectures and papers) and sort last.
- **Suspected duplicates:** "Gender, Forest Resources Management and Sustainable Household Economies in South-Eastern Nigeria" appears twice (journal article without year + 2008 book chapter), and "Open and Distance Learning in Nigeria: Development, Policy Options and Challenges" appears twice (journal article + conference paper). Neither merged; both kept.
- **Source corruption repaired in the parser (transparent FIX):** the CV docx glues "Perspectives on Globalization, Development and Public Policy" onto the previous book's ISBN, dropping its capital "P" (`…8482-5erspectives…`). The parser splits it and restores "Perspectives"; the title matches Appendix A.8.
- **Books:** all 11 books from Appendix A.8 parsed with publisher/place/ISBN where printed. Author-vs-editor roles remain `unknown` until the client confirms (Appendix C item 8) — books display as "Book".
- **Conferences:** 5 proceedings-verified events marked `verified`; CV-list-only events (including the ⚠ September 2012 Rivers State entry with conflicting dates in Appendix C item 7) marked `pending`.
- **Proceedings:** ICSTE2012 and ICASE2013 print the same ISBN (978-84-612-8486-3); per Appendix C item 7 the ISBN is **not** in `content/proceedings.json` and both volumes are `pending`.
- **Countries:** Zimbabwe, Malawi, Tanzania, United Kingdom (Lancaster, Appendix C item 5) and United States (Open Christian University, Appendix C item 10) have empty role lists and `verified: false` — kept only so the map matches Appendix A.11; client to confirm or drop.
- **Bios:** `content/bio-short.mdx` (103 words) and `content/bio-long.mdx` (473 words) are edited from the supplied biographies with excluded items removed (religion, family, referees, personal contacts, the "NUL" claim, disputed counts) and carry `approval: client approval pending`. Word limits and the approval flag are enforced by `scripts/validate-content.ts` during `npm run build`.
- **Photos:** 22 of 25 supplied images optimised (3 excluded per Appendix B: awkward crop, legible framed official portraits, low-angle selfie). All outputs are EXIF-stripped; the five Appendix B crop notes (framed portraits behind #10, #20, S2, S3, and tiny background frames #21) are applied as fractional crops before resizing, and `content/images.json` records `file` (base name), `widths`, `width`/`height`, `alt`, `role` and focal point.

## Status log

- Phase 0: items seeded; all defaults applied.
- Phase 2: content model populated; data report above awaits Gate 2 client review.
