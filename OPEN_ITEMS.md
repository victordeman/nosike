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

- **Publications:** `content/publications.json` holds **112 parsed entries** (11 books + 101 articles/chapters/papers/reports/theses/lectures), parsed by `scripts/extract-cv.ts` from the CV's Publications section. The CV claims "150+" and refers to an attached list that was not supplied — the itemised CV text yields 112, so the site's itemised list will show 112 unless the client supplies the fuller list (Appendix C item 3).
- **No-year entries:** 21 entries have `year: null` (mostly undated books, lectures and papers) and sort last.
- **Suspected duplicate:** "Gender, Forest Resources Management and Sustainable Household Economies in South-Eastern Nigeria" appears twice — once as a journal article (no year) and once as a book chapter (2008, in _Outlook on Economic and Business Environment_). Not merged; both kept.
- **Source corruption repaired in the parser (transparent FIX):** the CV docx glues "Perspectives on Globalization, Development and Public Policy" onto the previous book's ISBN, dropping its capital "P" (`…8482-5erspectives…`). The parser splits it and restores "Perspectives"; the title matches Appendix A.8.
- **Books:** all 11 books from Appendix A.8 parsed with publisher/place/ISBN where printed. Author-vs-editor roles remain `unknown` until the client confirms (Appendix C item 8) — books display as "Book".
- **Conferences:** 5 proceedings-verified events marked `verified`; CV-list-only events (including the ⚠ September 2012 Rivers State entry with conflicting dates in Appendix C item 7) marked `pending`.
- **Proceedings:** ICSTE2012 and ICASE2013 print the same ISBN (978-84-612-8486-3); per Appendix C item 7 the ISBN is **not** in `content/proceedings.json` and both volumes are `pending`.
- **Countries:** Zimbabwe, Malawi, Tanzania, United Kingdom (Lancaster, Appendix C item 5) and United States (Open Christian University, Appendix C item 10) have empty role lists and `verified: false` — kept only so the map matches Appendix A.11; client to confirm or drop.
- **Bios:** `content/bio-short.mdx` (~105 words) and `content/bio-long.mdx` (~330 words) are edited from the supplied biographies with excluded items removed (religion, family, referees, personal contacts, the "NUL" claim, disputed counts) and carry `approval: client approval pending`.
- **Photos:** 22 of 25 supplied images optimised (3 excluded per Appendix B: awkward crop, legible framed official portraits, low-angle selfie). All outputs are EXIF-stripped; see `content/images.json`.

## Status log

- Phase 0: items seeded; all defaults applied.
- Phase 2: content model populated; data report above awaits Gate 2 client review.
