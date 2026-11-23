# Prof. Austin N. Nosike — portfolio

Personal portfolio site for Prof. Austin N. Nosike. Build plan and rules: [`SPEC.md`](SPEC.md). Unresolved content questions: [`OPEN_ITEMS.md`](OPEN_ITEMS.md).

## Privacy rules (summary)

- Raw client source files live in `_sources/` locally and are **never committed** (see `.gitignore`).
- No personal email addresses, phone numbers, date of birth, family details, home address, referees or religion on the site.
- `npm run privacy` scans tracked files and fails on violations; it also runs as a pre-commit hook and in CI.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```
