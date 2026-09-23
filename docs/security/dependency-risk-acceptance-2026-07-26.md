# Dependency security review

Reviewed during repository cleanup on 2026-09-23.

`npm audit --json` reports **25 advisories: 1 critical, 12 high, and 12 moderate**.
The full local audit is retained in [dependency-audit.json](dependency-audit.json).
This supersedes the older seven-advisory summary in this file. Production release
remains blocked by the existing `npm audit --audit-level=high` gate.

The critical finding concerns the installed Next.js version. Other affected
packages include Nodemailer, PostCSS, Sharp, Prisma tooling, and SheetJS (`xlsx`).
Resolve the advisory ranges in the audit, regenerate the lockfile, and verify all
apps before release. Do not use a forced dependency downgrade to silence the audit.

SheetJS is imported by `apps/waba/src/app/campaigns/page.tsx` and parses uploaded
spreadsheets in the browser. The previous description of exclusively server-side
spreadsheet processing was inaccurate. npm reports no fix for the installed `xlsx`
release line; replacing the parser or migrating to a maintained distribution needs
compatibility checks for supported spreadsheet formats. This cleanup does not grant
security risk acceptance.

Rerun the audit after dependency changes; this file and its JSON report are a snapshot,
not proof of current deployment security.
