# Dependency Risk Acceptance

Generated: 2026-09-20 (runtime evidence regeneration)


## npm audit status (2026-09-20 re-check)
npm audit --omit=dev on 2026-09-20: 7 vulnerabilities (2 moderate, 4 high, 1 critical),
ALL in transitive dependency xlsx (SheetJS: GHSA-4r6h-8v6p-xvw6 prototype pollution,
GHSA-5pgg-2g8v-p4x9 ReDoS). No fix available from upstream.

## Risk acceptance decision
xlsx is used only for server-side spreadsheet import/export of admin-controlled
files (product/catalog imports), not for rendering untrusted user HTML. The two
CVE classes (prototype pollution, ReDoS) require a maliciously crafted workbook
uploaded by an authenticated admin user. Accepted residual risk: LOW-MODERATE.

## Mitigations
- Upload endpoints are admin-auth gated (see api-role-mapping.md).
- File size limits applied at the route level.
- Revisit on each dependency upgrade cycle; replace with exceljs if exploit
  surface changes (e.g. if customer-facing upload is ever enabled).
