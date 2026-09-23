# Dependency security review

Updated during security remediation on 2026-09-23.

The regenerated lockfile reports **zero vulnerabilities** in both the full
`npm audit --json` and the production-only `npm audit --omit=dev --json` audit.
The full snapshot is retained in [dependency-audit.json](dependency-audit.json).
The existing `npm audit --audit-level=high` CI and release gates remain enabled.

Runtime updates include Next.js 16.3.4, Sharp 0.35.4, Nodemailer 9.1.1,
sanitize-html 2.17.7, PostCSS 8.5.28, and SheetJS 0.20.3. Next.js and Sharp
address the reported AVIF image-optimization vulnerability. Next.js-related
workspace manifests were updated together.

SheetJS is installed from its official distribution, with the tarball integrity
recorded in the lockfile. The npm registry's xlsx 0.18.5 release was removed.
Campaign spreadsheet compatibility tests cover the existing XLSX, XLS, and CSV
import formats.

Development tooling was also refreshed. Root overrides require patched versions
of Hono's Node adapter, Fast URI, Valibot, DeepmergeTS, and MySQL2. Prisma's
configuration loader uses DeepmergeTS's retained `deepmerge` export; client
generation is part of verification for the transitive major update. No forced
Prisma downgrade or advisory suppression is used.

The lockfile was regenerated from the workspace manifests because incremental npm
installs retained obsolete transitive versions despite the overrides. Rerun the
audits after dependency changes; these results describe the checked dependency
graph, not proof of production deployment or the absence of all application
vulnerabilities.
